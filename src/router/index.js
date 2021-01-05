/*
 * @Author: eds
 * @Date: 2020-07-01 14:19:49
 * @LastEditTime: 2020-09-15 11:14:22
 * @LastEditors: eds
 * @Description:
 * @FilePath: \wz-city-culture-tour\src\router\index.js
 */
import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const router = new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      redirect: "videotool"
    },
    {
      path: "/videotool", // 平面调整
      name: "videotool",
      meta: {
        title: "视频映射工具"
      },
      component: resolve => require(["page/sourcelayer/sourcelayer"], resolve)
    },
    {
      path: "/videoprojection", // 三维投影
      name: "videoprojection",
      meta: {
        title: "视频投射工具"
      },
      component: resolve => require(["page/projection/projection"], resolve)
    },
  ]
});

/**
 * 设置文档名
 */
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;
