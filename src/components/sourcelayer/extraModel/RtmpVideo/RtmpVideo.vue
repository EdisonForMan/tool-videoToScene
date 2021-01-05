<!--
 * @Author: eds
 * @Date: 2020-08-21 18:30:30
 * @LastEditTime: 2020-09-15 10:53:32
 * @LastEditors: eds
 * @Description:
 * @FilePath: \wz-city-culture-tour\src\components\sourcelayer\extraModel\RtmpVideo\RtmpVideo.vue
-->
<template>
  <div class="rtmpVideo">
    <!-- <div class="rtmpListFrame" v-if="doRtmpListFrame">
      <header>
        <span>现场视频</span> /
        <span>{{ RtmpForcePoint.shortname }}</span>
        <i class="close" @click="closeRtmpVideoFrame"></i>
      </header>
      <div class="rtmpVideoContent">
        <div class="rtmpVideoList">
          <header>
            周边
            <el-select
              v-if="!isCircleVideo"
              class="rtmp-video-range"
              v-model="radiusRange"
              @change="refreshRtmpVideoList"
              placeholder="范围"
            >
              <el-option
                v-for="item in radiusOption"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
            <i v-if="isCircleVideo">{{ radiusRange }}</i>
            米
            <i>({{ fixRtmpList.length }})</i>
            <el-switch v-model="isHightVideo" name="高位" active-text="高位" />
            <span
              @click="videoOfPrivate = !videoOfPrivate"
              :class="{ active: videoOfPrivate }"
              >私有监控</span
            >
            <span
              @click="videoOfPublic = !videoOfPublic"
              :class="{ active: videoOfPublic }"
              >公有监控</span
            >
          </header>
          <div>
            <ul>
              <li
                v-for="(item, index) in fixRtmpList"
                :class="[forceRtmpVideo == item.mp_name ? 'rtmp_active' : '']"
                :key="index"
                @click="openRtmpVideoFrame(item)"
              >
                <span>
                  <input
                    id="custom-checkbox"
                    type="checkbox"
                    :checked="forceRtmpVideo === item.mp_name"
                    @click="checkUniqueVideo(item)"
                  />
                </span>
                <span :title="item.mp_name"
                  >{{ index + 1 }}.{{ item.mp_name }}</span
                >
                <span>{{ item.dist }} 米</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="rtmpVideoFrame">
          <header>
            <p>{{ forceRtmpVideo }}</p>
            <span
              @click="videoSourceTop = false"
              :class="{ active: !videoSourceTop }"
              >Flash模式</span
            >
            <span
              @click="videoSourceTop = true"
              :class="{ active: videoSourceTop }"
              >H5模式</span
            >
          </header>
          <div>
            <flv
              v-if="RtmpVideoURL"
              :url="RtmpVideoURL"
              :mode="RtmpVideoMode"
              :type="videoSourceTop"
            />
            <p v-if="!RtmpVideoURL">正在获取视频内容...</p>
          </div>
        </div>
      </div>
    </div> -->
  </div>
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
    ...mapGetters("map", ["rtmpList", "rtmpListOther"]),
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

<style lang="less" scoped>
.rtmpVideo {
  display: block;
}
</style>
