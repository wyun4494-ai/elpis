<template>
  <el-config-provider :locale="zhCn">
    <header-view 
      :proj-name="projName"
      @menu-select="onMenuSelect"
    >
      <!-- 主内容区域插槽插入 -->
      <template #main-content>
        <router-view />
      </template>
    </header-view>
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import HeaderView from './complex-view/header-view/header-view.vue'
import { ref, onMounted } from 'vue'
import { useProjectStore } from '$store/project.js'
import { useMenuStore } from '$store/menu.js'
import $curl from '$common/curl.js'
import { useRouter, useRoute } from 'vue-router'

const projectStore = useProjectStore()
const menuStore = useMenuStore()
const projName = ref('')
const route = useRoute()
const router = useRouter()

onMounted(() => {
  getProjectList()
  getProjectConfig()
})

// 请求 /api/project/list 并缓存到 project-store
async function getProjectList() {
  const res = await $curl({
    method: 'get',
    url: '/api/project/list',
    params: {
      // todo 动态获取
      proj_key: route.query.proj_key,
    }
  });
  if (!res || !res.data || !res.success) {
    return
  }

  projectStore.setProjectList(res.data)
}
// 请求 /api/project 并缓存到 menu-store
async function getProjectConfig() {
  const res = await $curl({
    method: 'get',
    url: '/api/project',
    params: {
      // todo 动态获取
      proj_key: route.query.proj_key,
    },
  });
  if (!res || !res.data || !res.success) {
    return
  }
  const { name, menu} = res.data
  projName.value = name
  menuStore.setMenuList(menu)
}

// 点击菜单回调方法
const onMenuSelect = function(menuItem) {
  const { moduleType, key, customConfig} = menuItem
  
  if (key === route.query.key) {
    return
  }
  // 菜单项的 moduleType 映射到对应的路由
  const pathMap = {
    sider: '/sider',
    schema: '/schema',
    iframe: '/iframe',
    custom: customConfig?.path
  }
  router.push({
    path: pathMap[moduleType],
    query: {
      key,
      proj_key: route.query.proj_key
    }
  })
} 

</script>

<style scoped lang="less">
:depp(el-main) {
  padding: 0%;
}
</style>
