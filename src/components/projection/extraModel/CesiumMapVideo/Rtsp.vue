<template>
  <div class="videoDemoPlayer" :class="{ video_visi: onMapVideoForceId != id }">
    <p>{{ rtspData.mp_name }}</p>
    <div class="operate-video">
      <span class="release-video" @click="doProjection">投射</span>
      <span class="release-video" @click="clearProjection">清除</span>
      <span class="release-video" @click="initRtmp">刷新</span>
      <span class="release-video" @click="releaseVideo" :data-val="this.id"
        >关闭视频</span
      >
    </div>
    <div class="update-video">
      <span class="release-video" @click="getVideoParams">获取视频参数</span>
      <span class="release-video" @click="saveVideoParams">保存视频参数</span>
    </div>
    <div class="demonstration">
      <div class="demonstration-single">
        <span>观测高度 {{ pheight }} 米</span>
        <span class="video-silder">
          <el-slider
            v-model="pheight"
            :max="300"
            :format-tooltip="(val) => val"
            @change="(value) => setVideoPointHeight(value)"
          />
        </span>
      </div>
      <div class="demonstration-single">
        <span>视频距离 {{ vdistance }} 米</span>
        <span class="video-silder">
          <el-slider
            v-model="vdistance"
            :max="1000"
            :format-tooltip="(val) => val"
            @change="(value) => setVideoDistance(value)"
          />
        </span>
      </div>
      <div class="demonstration-single">
        <span>视频高度 </span>
        <span class="video-silder">
          <el-slider
            v-model="vheight"
            :max="200"
            :format-tooltip="(val) => val"
            @change="(value) => setVideoHeight(value)"
          />
        </span>
      </div>
      <div class="demonstration-single">
        <span>视频宽度 </span>
        <span class="video-silder">
          <el-slider
            v-model="vwidth"
            :max="300"
            :format-tooltip="(val) => val"
            @change="(value) => setVideoWidth(value)"
          />
        </span>
      </div>
    </div>
    <div :id="id" class="frequency-pic type1" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import { getRtmpVideoURL } from "api/cityBrainAPI";
import { getVideoProjections, saveVideoProjections } from "api/videoAPI";
const Aliplayer = window.Aliplayer;
export default {
  data() {
    return {
      video: undefined,
      videoTimer: undefined,
      serverParams: undefined,
      //  参数
      pheight: 80,
      vdistance: 500,
      vheight: 20,
      vwidth: 40,
    };
  },
  props: ["rtspData"],
  computed: {
    ...mapGetters("map", ["onMapVideoForceId"]),
  },
  created() {
    this.id = "Rtsp" + this.$props.rtspData.mp_id;
  },
  beforeDestroy() {
    this.video && this.video.dispose();
    this.video && (this.video = undefined);
    window.projections[this.id].destroy();
    window.projections[this.id] = undefined;
    window.handlers[this.id].clear();
    window.handlers[this.id] = undefined;
    clearInterval(this.videoTimer);
  },
  async mounted() {
    await this.initRtmp();
  },
  methods: {
    ...mapActions("map", ["DeleteOnMapVideo", "SetOnMapVideoForceId"]),
    initRtmp() {
      return new Promise((resolve, reject) => {
        this.video && this.video.dispose();
        this.video && (this.video = undefined);
        this.video = new Aliplayer(
          {
            id: this.id,
            source: this.rtspData.flv,
            width: "100%",
            height: "200px",
            autoplay: true,
            controlBarVisibility: "hover",
            useFlashPrism: false,
            useH5Prism: true,
          },
          (player) => {
            player.mute();
            player.play();
            console.log(player);
            this.initVideoToMap();
            this.videoTimer = setInterval(() => {
              this.video && player ? player.play() : clearInterval(this.videoTimer);
            }, 1 * 60 * 1000);
            resolve(true);
          }
        );
      });
    },
    doProjection() {
      window.handlers[this.id].clear();
      this.clearAndActive();
      window.handlers[this.id].activate();
    },
    clearProjection() {
      window.handlers[this.id].clear();
      this.clearAndActive();
    },
    /**
     * 初始化对象与句柄
     */
    initVideoToMap() {
      if (!window.projections[this.id]) {
        //  ****** 生成投射对象 ******
        const projectionImage = new Cesium.ProjectionImage(window.earth.scene);
        window.projections[this.id] = projectionImage;
        //  ****** 生成句柄 ******
        const handler = new Cesium.DrawHandler(window.earth, Cesium.DrawMode.Point);
        handler.movingEvt.addEventListener((windowPosition) => {
          var last = window.earth.scene.pickPosition(windowPosition);
          //计算该点与视口位置点坐标的距离
          var distance = Cesium.Cartesian3.distance(
            window.earth.scene.camera.position,
            last
          );
          if (distance > 0) {
            //将鼠标当前点坐标转化成经纬度
            var cartographic = Cesium.Cartographic.fromCartesian(last);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            //通过该点设置视频投放对象的距离及方向
            window.projections[this.id].setDistDirByPoint([longitude, latitude, height]);
            window.projections[this.id].distance = this.vdistance;
          }
        });
        window.handlers[this.id] = handler;
      }
    },
    clearAndActive() {
      const video = document.getElementById(this.id).children[0];
      const projectionImage = window.projections[this.id];
      projectionImage.distance = 0.1;
      const { lng, lat } = this.rtspData.position;
      let x = parseFloat(lng);
      let y = parseFloat(lat);
      projectionImage.viewPosition = [x, y, this.pheight];
      projectionImage.horizontalFov = this.vwidth;
      projectionImage.verticalFov = this.vheight;
      projectionImage.setImage({ video });
      projectionImage.removeAllClipRegion();
      projectionImage.build();
    },
    setVideoPointHeight(value) {
      const { lng, lat } = this.rtspData.position;
      let x = parseFloat(lng);
      let y = parseFloat(lat);
      window.projections[this.id] &&
        (window.projections[this.id].viewPosition = [x, y, this.pheight]);
    },
    setVideoDistance(value) {
      window.projections[this.id] && (window.projections[this.id].distance = value);
    },
    setVideoHeight(value) {
      window.projections[this.id] && (window.projections[this.id].verticalFov = value);
    },
    setVideoWidth(value) {
      window.projections[this.id] && (window.projections[this.id].horizontalFov = value);
    },
    releaseVideo() {
      this.clearAndActive();
      this.DeleteOnMapVideo(this.rtspData);
      this.SetOnMapVideoForceId(undefined);
    },
    //  获取服务端视频数据
    async getVideoParams() {
      const { rows } = await getVideoProjections(this.id);
      if (rows.length) {
        this.serverParams = JSON.parse(rows[0].PARAMS);
        this.doServerStyle();
      } else {
        this.$message({ message: "未找到已保存的视频系数" });
      }
    },
    //  保存服务端视频数据
    async saveVideoParams() {
      const {
        verticalFov,
        horizontalFov,
        pitch,
        distance,
        direction,
        viewPosition,
      } = window.projections[this.id];
      const params = {
        verticalFov,
        horizontalFov,
        pitch,
        distance,
        direction,
        viewPosition,
      };
      const data = await saveVideoProjections(this.id, JSON.stringify(params));
      this.serverParams = params;
      this.$message({ message: "视频参数保存成功" });
    },
    //  还原服务端视频系数
    doServerStyle() {
      const video = document.getElementById(this.id).children[0];
      const serverParams = this.serverParams;
      const projectionImage = window.projections[this.id];
      projectionImage.verticalFov = serverParams.verticalFov;
      projectionImage.horizontalFov = serverParams.horizontalFov;
      projectionImage.pitch = serverParams.pitch;
      projectionImage.distance = serverParams.distance;
      projectionImage.direction = serverParams.direction;
      projectionImage.viewPosition = serverParams.viewPosition;
      projectionImage.setImage({ video });
      projectionImage.removeAllClipRegion();
      projectionImage.build();
    },
    //  重置至最新的服务端视频数据
    resetVideoParams() {},
  },
};
</script>
<style lang="less" scoped>
.videoDemoPlayer {
  position: fixed;
  height: auto;
  width: 380px;
  top: 0px;
  right: 0px;
  z-index: 30;
  margin: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  &.video_visi {
    display: none;
    z-index: -1;
  }
  > p {
    color: white;
  }
  .frequency-pic {
    height: 200px;
  }
  .demonstration {
    color: white;
    margin-bottom: 10px;

    .demonstration-single {
      width: 100%;
      display: flex;
      span {
        display: inline-block;
        vertical-align: middle;
        line-height: 40px;
        height: 28px;
        margin: 0 4px;
      }
      .video-silder {
        flex: 1;
      }
    }
  }
  .operate-video,
  .update-video {
    margin-top: 10px;
    height: 30px;
    line-height: 30px;
    .release-video {
      color: white;
      cursor: pointer;
      border: 1px gray solid;
      padding: 0px 6px;
      height: 22px;
      line-height: 21px;
      display: inline-block;
      vertical-align: middle;
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
</style>
