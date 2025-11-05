<template>
  <sider-container>
    <!-- 侧边栏 -->
    <template #menu-content>
      <el-menu
        :default-active="activeKey"
        :ellipsis="false"
        :collapse="menuStore.isCollapsed"
        :collapse-transition="false"
        @select="onMenuSelect"
      >
        <template v-for="item in menuList">
          <!-- group -->
          <sub-menu
            v-if="item.subMenu && item.subMenu.length > 0"
            :menu-item="item"
          >
            <!--  -->
          </sub-menu>
          <!-- module -->
          <el-menu-item
            v-else
            :key="item.key"
            :index="item.key"
          >
            <el-icon v-if="item.icon">
              <component :is="ElementPlusIconsVue[item.icon]" />
            </el-icon>
            <el-icon v-else>
              <Document />
            </el-icon>
            <template #title>
              <span>{{ item.name }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </template>
    <!-- 主内容 -->
    <template #main-content>
      <router-view />
    </template>
  </sider-container>
</template> 

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMenuStore } from '$elpisStore/menu.js'
import siderContainer from '$elpisWidgets/sider-container/sider-container.vue';
import subMenu from './complex-view/sub-menu/sub-menu.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { Document } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const menuStore = useMenuStore();

 
const menuList = ref([])
const setMenuList = function() {
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: route.query.key
  })
  if (menuItem && menuItem.siderConfig && menuItem.siderConfig.menu) {
    menuList.value = menuItem.siderConfig.menu
  }
}

const activeKey = ref('');
// 设置 activeKey
const setActiveKey = function() {
  let siderMenuItem = menuStore.findMenuItem({
    key: 'key',
    value: route.query.sider_key 
  }) 
  // 首次加载时，没有 sider_key ，用户没有选择侧边栏菜单，则默认选择第一个菜单
  if (!siderMenuItem) {
    const hMenuList = menuStore.findMenuItem({
    key: 'key',
    value: route.query.key
  })
  if (hMenuList && hMenuList.siderConfig && hMenuList.siderConfig.menu) {
    const siderMenuList = hMenuList.siderConfig.menu
    siderMenuItem = menuStore.findFirstMenuItem(siderMenuList) // 递归查找第一个菜单
    if (siderMenuItem) {
      handleMenuSelect(siderMenuItem.key)
    }
  }
  }
  activeKey.value = siderMenuItem?.key
}

// 监听路由变化，设置 activeKey
watch( [
  () => route.query.key,
  () => route.query.sider_key,
  () => menuStore.menuList
], () => {
  setActiveKey()
  setMenuList()
},{ deep: true })

// 当页面加载完成并且该组件被挂载到DOM上时
onMounted(() => {
  setActiveKey()
  setMenuList()
})
const onMenuSelect = function(menuKey) {
  handleMenuSelect(menuKey)
}

// 菜单选择处理
const handleMenuSelect = function(menuKey) {
  const siderMenuItem = menuStore.findMenuItem({
    key: 'key',
    value: menuKey
  })
  if (!siderMenuItem) {
    return
  }
  const { key, moduleType, customConfig } = siderMenuItem

  if (key === route.query.sider_key) {
    return
  }
  const pathMap = {
    schema: '/schema',
    iframe: '/iframe',
    custom: customConfig?.path
  }
  router.push({
    path: `/view/dashboard/sider${pathMap[moduleType]}`,
    query: {
      key: route.query.key,
      sider_key: key,
      proj_key: route.query.proj_key
    }
  })
}

</script> 

<style lang="scss" scoped>

</style>