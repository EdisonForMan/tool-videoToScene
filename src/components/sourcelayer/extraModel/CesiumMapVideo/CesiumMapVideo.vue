<template>
  <div class="rtspVideo">
    <Rtsp v-for="(value, key, index) in onMapVideo" :key="index" :rtspData="value" />
  </div>
</template>

<script>
import Rtsp from "./Rtsp";
import { mapGetters, mapActions } from "vuex";
export default {
  name: "rtspVideo",
  computed: {
    ...mapGetters("map", ["onMapVideo"]),
  },
  mounted() {
    this.eventRegsiter();
    this.initLayer();
  },
  components: { Rtsp },
  beforeDestroy() {},
  methods: {
    ...mapActions("map", ["SetOnMapVideoForceId"]),
    eventRegsiter() {
      this.$bus.$off("cesium-3d-video-force-id");
      this.$bus.$on("cesium-3d-video-force-id", ({ id }) => {
        this.SetOnMapVideoForceId(id);
      });
    },
    initLayer() {},
  },
};
</script>

<style lang="less" scoped></style>
