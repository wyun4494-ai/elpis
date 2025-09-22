import { createApp } from "vue";

// 引入 elementUI
import ElementPlus from "element-plus";
import "element-plus/theme-chalk/index.css";
import 'element-plus/theme-chalk/dark/css-vars.css'
import './asserts/custom.css'
import pinia from '$store/index.js'
import { createWebHistory, createRouter } from 'vue-router'

/**
 * vue 页面主入口， 用于启动 vue
 * @param  pageComponent vue 入口组件
 * @param  routes 路由列表   
 * @param  libs 页面依赖的第三方包
 */
export default (pageComponent, { routes, libs } = {}) => { 
  const app = createApp(pageComponent);

  // 挂载 elementUI 
  app.use(ElementPlus);
  // 挂载 pinia
  app.use(pinia);

  // 挂载 第三方库
  if ( libs && libs.length ) {
    for (let i = 0; i < libs.length; i++) {
      app.use(libs[i]);
    }
  }
  
  // 挂载路由
  if ( routes && routes.length ) {
    const router = createRouter ({
      history: createWebHistory(), // 采用 history 路由模式
      routes,
    });
    app.use(router);
    router.isReady().then(() => {
      app.mount("#root");
    })
  } else {
    app.mount("#root");
  }
}