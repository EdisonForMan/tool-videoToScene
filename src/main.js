/*
 * @Author: eds
 * @Date: 2020-07-01 15:22:04
 * @LastEditTime: 2020-09-03 19:47:41
 * @LastEditors: eds
 * @Description:
 * @FilePath: \wz-city-culture-tour\src\main.js
 */
import "element-ui/lib/theme-chalk/index.css";
import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import VueBus from "vue-bus";

Vue.use(VueBus);
Vue.use(ElementUI);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  store,
  components: { App },
  template: "<App/>"
});
