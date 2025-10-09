import boot from '$elpisPage/boot.js'
import dashboard from './dashboard.vue'
import businessDashboardConfig from '$businessDashboardConfig'

const routes = []

// 头部菜单路由
routes.push({
  path: '/view/dashboard/iframe',
  component: () => import('./complex-view/iframe-view/iframe-view.vue')
})
routes.push({
  path: '/view/dashboard/schema',
  component: () => import('./complex-view/schema-view/schema-view.vue')
})

const siderRoutes = [
  {
    path: 'schema',
    component: () => import('./complex-view/schema-view/schema-view.vue')
  },
  {
    path: 'iframe',
    component: () => import('./complex-view/iframe-view/iframe-view.vue')
  }
]

// 侧边栏路由
routes.push({
  path: '/view/dashboard/sider',
  component: () => import('./complex-view/sider-view/sider-view.vue'),
  children: siderRoutes
})

// 业务扩展路由
if(typeof businessDashboardConfig === 'function') {
  businessDashboardConfig({ routes, siderRoutes })
}

// 侧边栏路由兜底
routes.push({
  path: '/view/dashboard/sider/:chapters+',
  component: () => import('./complex-view/sider-view/sider-view.vue')
})
// 启动页面
boot(dashboard, { routes } )
