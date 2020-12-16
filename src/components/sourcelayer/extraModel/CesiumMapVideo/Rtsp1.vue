<template>
  <div class="videoDemoPlayer" :class="{ video_visi: onMapVideoForceId != id }">
    <p>{{ rtspData.mp_name }}</p>
    <div class="demonstration">
      <span>角度: {{ rotate / 100 }} </span>
      <span class="video-silder">
        <el-slider
          v-model="rotate"
          :max="628"
          :format-tooltip="(val) => val / 100"
          @change="(value) => setVideoRotate(value)"
        />
      </span>
      <span class="release-video" @click="initRtmp">刷新</span>
      <span class="release-video" @click="releaseVideo">关闭视频</span>
    </div>
    <div :id="id" class="frequency-pic type1" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import { getRtmpVideoURL } from "api/cityBrainAPI";
const Aliplayer = window.Aliplayer;
export default {
  name: "Rtsp1",
  data() {
    return {
      video: undefined,
      videoTimer: undefined,
      ety: undefined,
      rotate: 0,
    };
  },
  props: ["rtspData"],
  computed: {
    ...mapGetters("map", ["onMapVideoForceId"]),
  },
  created() {
    this.id = "Rtsp" + this.rtspData.mp_id;
  },
  beforeDestroy() {
    this.video && this.video.dispose();
    this.video && (this.video = undefined);
    window.etyEdits.clear();
    window.earth.entities.remove(window.etys[this.id]);
    window.etys[this.id] = undefined;
    clearInterval(this.videoTimer);
  },
  async mounted() {
    this.initRtmp();
  },
  methods: {
    ...mapActions("map", ["DeleteOnMapVideo", "SetOnMapVideoForceId"]),
    initRtmp() {
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
          console.log("Rtsp1播放器创建");
          player.mute();
          player.play();
          this.initVideoToMap();
          this.videoTimer = setInterval(() => {
            if (this.video) {
              player && player.play();
            } else {
              clearInterval(this.videoTimer);
            }
          }, 1 * 60 * 1000);
        }
      );
    },
    initVideoToMap() {
      const { lng, lat } = this.rtspData.position;
      let x = parseFloat(lng);
      let y = parseFloat(lat);
      if (window.etys[this.id]) {
        window.etys[this.id].polygon.material = document.getElementById(
          this.id
        ).children[0];
      } else {
        window.etys[this.id] = window.earth.entities.add({
          id: this.id,
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(
              Cesium.Cartesian3.fromDegreesArray([
                (x -= 0.002),
                y,
                x,
                (y -= 0.0012),
                (x += 0.002),
                y,
                x,
                (y += 0.0012),
              ])
            ),
            height: 2,
            stRotation: 0,
            material: document.getElementById(this.id).children[0],
          },
          classificationType: Cesium.ClassificationType.BOTH,
        });
        this.rotate = window.etys[this.id].polygon.stRotation.getValue() * 100;
      }
    },
    setVideoRotate() {
      window.etys[this.id].polygon.stRotation.setValue(this.rotate / 100);
    },
    releaseVideo() {
      this.DeleteOnMapVideo(this.rtspData);
      this.SetOnMapVideoForceId(undefined);
    },
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
    visibility: hidden;
  }
  > p {
    color: white;
  }
  .frequency-pic {
    height: 200px;
  }
  .demonstration {
    display: flex;
    color: white;
    span {
      display: inline-block;
      vertical-align: middle;
      line-height: 40px;
      height: 40px;
      margin: 0 4px;
    }
    .video-silder {
      flex: 1;
    }
    .release-video {
      cursor: pointer;
    }
  }
}
</style>
