<template>
  <div class="rtspVideo">
    <Rtsp1 />
  </div>
</template>

<script>
import Rtsp1 from "./Rtsp1";
// import Rtsp2 from "./Rtsp2";
export default {
  name: "rtspVideo",
  data() {
    return {
      forceEtyId: undefined,
    };
  },
  mounted() {
    this.eventRegsiter();
    this.initLayer();
  },
  components: { Rtsp1 },
  beforeDestroy() {},
  methods: {
    eventRegsiter() {},
    initLayer() {},
  },
};
</script>

<style lang="less" scoped></style>
