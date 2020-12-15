<!--
 * @Author: eds
 * @Date: 2020-08-20 18:52:41
 * @LastEditTime: 2020-09-15 11:01:20
 * @LastEditors: eds
 * @Description:
 * @FilePath: \wz-city-culture-tour\src\components\sourcelayer\cesium_map.vue
-->
<template>
  <div class="cesiumContainer">
    <div id="cesiumContainer" />
    <!-- 气泡框 -->
    <div class="popup-groups">
      <DetailPopup ref="detailPopup" />
    </div>
    <!-- 功能组件 -->
    <div v-if="mapLoaded">
      <CesiumMapVideo />
      <RtmpVideo />
    </div>
  </div>
</template>

<script>
import { ServiceUrl } from "config/server/mapConfig";
import CesiumMapVideo from "components/sourcelayer/extraModel/CesiumMapVideo/CesiumMapVideo";
import DetailPopup from "components/sourcelayer/commonFrame/Popups/DetailPopup";
import RtmpVideo from "components/sourcelayer/extraModel/RtmpVideo/RtmpVideo";
import { CenterPoint } from "mock/overview.js";
import {
  forceOnEntity,
  mouseDownForce,
  mouseUpRelease,
  mouseMove,
  drawLuChengOPoints,
} from "./extraModel/CesiumMapVideo/RtspVideoTool";
import {
  mapConfigInit,
  mapImageLayerInit,
  mapMvtLayerInit,
  mapRiverLayerInit,
  mapBaimoLayerInit,
  mapRoadLampLayerInit,
  mapRoadLampLayerTurn,
} from "components/sourcelayer/cesium_map_init";
import { mapGetters } from "vuex";
const Cesium = window.Cesium;

export default {
  data() {
    return {
      mapLoaded: false,
    };
  },
  computed: {
    ...mapGetters("map", ["initDataLoaded", "forceTreeLabel"]),
  },
  components: {
    CesiumMapVideo,
    DetailPopup,
    RtmpVideo,
  },
  created() {
    //  点位信息 hash
    window.featureMap = {};
    //  点位icon hash
    window.billboardMap = {};
    //  点位label hash
    window.labelMap = {};
    //  视频调整
    window.etys = {};
    window.etyEdits = undefined;
    window.forceDragObject = undefined;
    window.doDragFlag = undefined;
  },
  async mounted() {
    await this.init3DMap(() => {
      this.mapLoaded = true;
      // this.initPostRender();
      this.initHandler();
    });
    this.eventRegsiter();
  },
  methods: {
    initPostRender() {
      window.earth.scene.postRender.addEventListener(() => {
        if (!window.earth || !this.mapLoaded) return;
      });
    },
    initHandler() {
      const handler = new Cesium.ScreenSpaceEventHandler(window.earth.scene.canvas);
      // 监听左键点击事件
      handler.setInputAction((e) => {
        const pick = window.earth.scene.pick(e.position);
        if (!pick || !pick.id) return;
        if (typeof pick.id == "object") {
          //  *****[videoCircle]  监控视频点*****
          if (pick.id.id && ~pick.id.id.indexOf("normalpoint_")) {
            this.$bus.$emit("cesium-3d-normalPointClick", {
              mp_id: pick.id.id,
              mp_name: pick.id.name,
            });
          } else if (pick.id.id && ~pick.id.id.indexOf("Rtsp")) {
            forceOnEntity(pick.id.id);
            this.$bus.$emit("cesium-3d-video-force-id", {
              id: pick.id.id,
            });
          }
        } else if (typeof pick.id == "string") {
          //  *****[detailPopup]  资源详情点*****
          if (~pick.id.indexOf("Lucheng")) {
            this.$refs.detailPopup.getForceEntity({
              id: pick.id,
              position: pick.primitive.position,
            });
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 监听左键按下事件
      handler.setInputAction((e) => {
        mouseDownForce(e);
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      // 监听左键抬起事件
      handler.setInputAction((e) => {
        mouseUpRelease(e);
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      // 监听左键移动事件
      handler.setInputAction((e) => {
        mouseMove(e);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    /**
     * 事件注册
     */
    eventRegsiter() {},
    /**
     * 地图初始化
     * @param {function} fn 回调函数
     */
    async init3DMap(fn) {
      const that = this;
      window.earth = new Cesium.Viewer("cesiumContainer", {
        infoBox: false,
        selectionIndicator: false,
        shadows: false,
      });
      //  地图配置
      mapConfigInit();
      //  相机位置
      this.cameraMove();
      //  大数据地图
      window.datalayer = mapImageLayerInit(ServiceUrl.SWImage);
      //  地图注记
      // const mapMvt = mapMvtLayerInit("mapMvt", ServiceUrl.YJMVT);
      //  重要地物注记
      // const keyMvt = mapMvtLayerInit("keyMvt", ServiceUrl.KEYMVT);
      //  画鹿城点
      drawLuChengOPoints();
      //  白模叠加
      await mapBaimoLayerInit(ServiceUrl.WZBaimo_OBJ);
      //  路灯、光源叠加
      // mapRoadLampLayerInit();
      //  回调钩子
      fn && fn();
    },
    /**
     * move your fat ass bro
     */
    cameraMove() {
      window.earth.scene.camera.setView(CenterPoint);
    },
  },
};
</script>

<style lang="less">
.cesiumContainer {
  height: 100%;
  width: 100%;
  #cesiumContainer {
    height: 100%;
    width: 100%;
    // color: rgb(42, 104, 163);
  }
}
.mapCover {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 8;
}
.cesium-viewer-navigationContainer {
  display: none;
}
</style>
