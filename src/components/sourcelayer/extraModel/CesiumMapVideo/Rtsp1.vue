<template>
  <div class="videoDemoPlayer">
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
    </div>
    <div :id="id" class="frequency-pic type1" />
  </div>
</template>
<script>
import { getRtmpVideoURL } from "api/cityBrainAPI";
const Aliplayer = window.Aliplayer;
export default {
  name: "Rtsp1",
  data() {
    return {
      id: "Rtsp1",
      video: undefined,
      videoTimer: undefined,
      ety: undefined,
      rotate: 0,
    };
  },
  beforeDestroy() {
    this.video && this.video.dispose();
    this.video && (this.video = undefined);
    window.earth.entities.removeById(this.id);
    clearInterval(this.videoTimer);
  },
  async mounted() {
    const { data } = await getRtmpVideoURL("122213000100000131003310");
    this.initRtmp(data);
  },
  methods: {
    initRtmp({ flv }) {
      this.video = undefined;
      this.video = new Aliplayer(
        {
          id: this.id,
          source: flv,
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
      window.etys[this.id] = window.earth.entities.add({
        id: this.id,
        
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray([
              120.698893798466,
              28.001919490126,
              120.698012161289,
              28.0018447184291,
              120.697656034724,
              28.0028060447815,
              120.698349855701,
              28.0030819575945,
            ])
          ),
          height: 1,
          stRotation: 1.2,
          material: document.getElementById(this.id).children[0],
        },
        classificationType: Cesium.ClassificationType.BOTH,
      });
      this.rotate = window.etys[this.id].polygon.stRotation.getValue() * 100;
    },
    setVideoRotate() {
      window.etys[this.id].polygon.stRotation.setValue(this.rotate / 100);
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
  }
}
</style>
