<template>
  <!-- 引用布局模板、 增加插槽部分 -->
  <header-container :title="projName">
    <!-- 中间菜单区域 -->
    <template #menu-content>
      <!-- 根据 menuStore.menuList 渲染  -->
      <el-menu
        :default-active="activeKey"
        :ellipsis="false"
        mode="horizontal"
        @select="onMenuSelect"
      >
        <template
          v-for="item in menuStore.menuList"
        >
          <sub-menu
            v-if="item.subMenu && item.subMenu.length > 0"
            :menu-item="item"
          />
          <el-menu-item
            v-else 
            :index="item.key"
          >
            {{ item.name }}
          </el-menu-item>
        </template>
      </el-menu>
    </template>
    <!-- 右侧上方设置区域 -->
    <template #setting-content>
      <!-- 根据 projStore.projList 渲染 -->
      <el-dropdown @command="handleProjectCommand">
        <span class="project-list">
          {{ projName }}
          <el-icon
            v-if="projectStore.projectList.length > 1"
            class="el-icon--right"
          >
            <arrow-down />
          </el-icon>
        </span> 
        <template
          v-if="projectStore.projectList.length > 1"
          #dropdown
        > 
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in projectStore.projectList"
              :key="item.key"
              :command="item.key"
              :disabled="item.key === route.query.proj_key"
            >
              {{ item. name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <!-- 主内容区域 -->
    <template #main-content>
      <slot name="main-content" />
    </template>
  </header-container>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { ref, watch, onMounted } from 'vue'
import {  useRoute } from 'vue-router'
import HeaderContainer from '$elpisWidgets/header-container/header-container.vue'
import SubMenu from './complex-view/sub-menu/sub-menu.vue'
import { useProjectStore } from '$elpisStore/project.js'
import { useMenuStore } from '$elpisStore/menu.js'

const route = useRoute()
const projectStore = useProjectStore()
const menuStore = useMenuStore()

defineProps({
  // eslint-disable-next-line vue/require-default-prop
  projName: {
    type: String,
  }
})
// 传给父组件 menu-select 事件
const emit = defineEmits(['menu-select'])

const activeKey = ref('')

// 设置 activeKey
const setActiveKey = function() {
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: route.query.key
  })
  activeKey.value = menuItem?.key
}

// 监听路由变化，设置 activeKey
watch( [
  () => route.query.key,
  () => menuStore.menuList
], () => {
  setActiveKey()
}, { deep: true, immediate: true})
// 当页面加载完成并且该组件被挂载到DOM上时
onMounted(() => {
  setActiveKey()
})


// 监听菜单选择
const onMenuSelect = function(menuKey) {
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: menuKey
  })
  emit('menu-select', menuItem)
}

// 下拉菜单处理项目切换
const handleProjectCommand = function(event) {
  const projectItem = projectStore.projectList.find(item => item.key === event)
  if (!projectItem || !projectItem.homePage) {
    return
  }
  const { origin} = window.location
  window.location.href = `${origin}/view/dashboard${projectItem.homePage}`
}
</script>

<style scoped lang="less">
.project-list {
  margin-right: 20px;
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  outline: none;
}
</style>