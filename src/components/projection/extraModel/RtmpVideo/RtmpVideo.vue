<!--
 * @Author: eds
 * @Date: 2020-08-21 18:30:30
 * @LastEditTime: 2020-09-15 10:53:32
 * @LastEditors: eds
 * @Description:
 * @FilePath: \wz-city-culture-tour\src\components\projection\extraModel\RtmpVideo\RtmpVideo.vue
-->
<template>
  <div class="rtmpVideo" />
</template>

<script>
const Cesium = window.Cesium;
import { mapGetters, mapActions } from "vuex";
import { getRtmpVideoList, getRtmpVideoURL } from "api/cityBrainAPI";

export default {
  data() {
    return {
      forceRtmpVideo: undefined, //  正在看的视频名
      radiusRange: 200, //  默认半径200米
      radiusOption: [100, 200, 500, 1000],
      //  激活列表
      entitiesID: [],
    };
  },
  computed: {
    ...mapGetters("map", ["rtmpList"]),
  },
  async mounted() {
    this.eventRegsiter();
  },
  methods: {
    ...mapActions("map", ["SetRtmpList", "SetOnMapVideo"]),
    //  事件绑定
    eventRegsiter() {
      const that = this;
      this.$bus.$off("cesium-3d-rtmpFetch");
      this.$bus.$on("cesium-3d-rtmpFetch", async (item) => {
        //  移除缓冲区与视频图标
        this.removeVideoCircle();
        //  获取缓冲区内视频列表
        const { data } = await getRtmpVideoList(item.geometry, this.radiusRange);
        //  设置store视频列表数据
        this.SetRtmpList(data);
        //  画缓冲区与视频图标
        this.drawVideoCircle(item.geometry, this.radiusRange);
      });
      // 图层监控视频点
      this.$bus.$off("cesium-3d-normalPointClick");
      this.$bus.$on("cesium-3d-normalPointClick", (item) => {
        const mp_id = item.mp_id.split("normalpoint_")[1];
        this.rtmpList.length &&
          this.openRtmpVideoFrame({
            mp_name: item.mp_name,
            mp_id,
            position: this.rtmpList.filter((v) => v.mp_id == mp_id)[0],
          });
      });
    },
    /**
     * 赋值 开视频
     * @param {object} item
     */
    async openRtmpVideoFrame({ mp_name, mp_id, position }) {
      this.forceRtmpVideo = mp_name;
      if (!mp_id) {
        this.$message({
          message: "无法获取视频，mp_id为空",
          type: "error",
        });
      } else {
        const { data } = await getRtmpVideoURL(mp_id);
        this.SetOnMapVideo({ mp_id, mp_name, position, ...data });
      }
    },
    /**
     * 画缓冲区
     * @param {string!|number!} 没id不画
     * @param {geometry!} 没geometry不画
     * @param {queryRadius!} 监控点查询半径
     */
    async drawVideoCircle({ lng, lat }, queryRadius = 200) {
      //  画圈
      console.log("[drawVideoCircle]", lng, lat, queryRadius);
      const circleEntity = new Cesium.Entity({
        position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
        ellipse: {
          semiMinorAxis: queryRadius,
          semiMajorAxis: queryRadius,
          height: 1,
          material: Cesium.Color.WHITE.withAlpha(0.1),
          outline: true,
          outlineWidth: 3,
          outlineColor: Cesium.Color.WHITE,
        },
        name: "videoCircle",
      });
      window.earth.entities.add(circleEntity);
      this.entitiesID.push(circleEntity.id);
      //  画点
      this.rtmpList.forEach((item) => {
        const isHigh = ~item.mp_name.indexOf("高位");
        const videoPointEntity = new Cesium.Entity({
          id: `normalpoint_${item.mp_id}`,
          position: Cesium.Cartesian3.fromDegrees(Number(item.lng), Number(item.lat), 3),
          billboard: {
            image: `/static/images/map-ico/${isHigh ? "火车站" : "视频监控"}.png`,
            width: isHigh ? 50 : 40,
            height: isHigh ? 50 : 40,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          name: item.mp_name,
        });
        window.earth.entities.add(videoPointEntity);
        this.entitiesID.push(videoPointEntity.id);
      });
    },
    /**
     * 删缓冲区
     * @param {string|number|undefined} 有id删id 没id删全部
     */
    removeVideoCircle(id) {
      this.entitiesID.forEach((item) => {
        window.earth.entities.removeById(item);
      });
      this.entitiesID = [];
    },
  },
};
</script>

<style lang="less">
.rtmpVideo {
  display: block;
}
</style>
