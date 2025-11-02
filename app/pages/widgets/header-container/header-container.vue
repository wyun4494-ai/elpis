<template>
  <!-- 布局模板 -->
  <el-container class="header-container">
    <!--  头部 -->
    <el-header class="header">
      <el-row
        type="flex"
        align="middle"
        class="header-row"
      >
        <!-- 左上方 title -->
        <el-row
          type="flex"
          align="middle"
          class="title-panel"
        >
          <img
            src="./asserts/logo.png"
            class="logo"
          >
          <el-row class="text">
            {{ title }}
          </el-row>
        </el-row>

        <!-- 面包屑导航 -->
        <Breadcrumb
          v-if="showBreadcrumb && Breadcrumb"
          :key="breadcrumbKey"
        />

        <!-- 插槽： 中间菜单区域   -->
        <slot name="menu-content" />
        <!-- 右上方 设置区域 -->
        <el-row
          type="flex"
          align="middle"
          justify="end"
          class="setting-panel"
        >
          <!-- 插槽： 设置区域 -->
          <slot name="setting-content" />
          <!-- 主题切换 -->
          <theme-switcher />
          <!-- 用户面板 -->
          <component
            :is="businessHeaderConfig?.userPanel?.component"
            v-if="businessHeaderConfig?.userPanel?.component"
          />
        </el-row>
      </el-row>
    </el-header>
    
    <!-- 主要区域 -->
    <el-main class="main-container">
      <!-- 插槽: 外部扩展区域 -->
      <slot name="main-content" />
    </el-main>
  </el-container>
</template>
/**
 * 顶栏容器组件
 * Dashboard 布局的顶栏容器，包含 Logo、标题、菜单、设置区域
 *
 * 核心功能：
 * - 显示 Logo 和标题
 * - 显示面包屑导航
 * - 提供菜单插槽（menu-content）
 * - 提供设置区域插槽（setting-content）
 * - 集成主题切换器
 * - 集成用户面板
 * - 提供主内容区域插槽（main-content）
 *
 * 插槽说明：
 * - menu-content: 中间菜单区域
 * - setting-content: 右上方设置区域
 * - main-content: 主内容区域
 *
 * 使用场景：
 * - Dashboard 布局的顶栏
 *
 * @component HeaderContainer
 */
<script setup>
import { computed, ref, watch, defineAsyncComponent, getCurrentInstance } from 'vue'
import businessHeaderConfig from '$businessHeaderConfig'
import ThemeSwitcher from './complex-view/theme-switcher/theme-switcher.vue'

// 使用 getCurrentInstance() 安全地访问 router，避免在非 router-view 页面报错
const instance = getCurrentInstance()
const router = instance?.appContext?.config?.globalProperties?.$router
const route = instance?.appContext?.config?.globalProperties?.$route

// 判断是否在 router-view 内且是 dashboard 页面
const isInRouterView = computed(() => {
  return !!(router && route && route.path && route.path.startsWith('/view/dashboard'))
})

// 只在 router-view 内且是 dashboard 页面时才加载面包屑组件
const Breadcrumb = defineAsyncComponent(() => import('./complex-view/breadcrumb/breadcrumb.vue'))

defineProps({
  /**
   * 标题文本
   * @type {string}
   * @example 'Elpis 管理系统'
   */
  title: {
    type: String,
    default: ''
  }
})

/**
 * 是否显示面包屑导航
 * 只在 dashboard 页面显示面包屑
 */
const showBreadcrumb = computed(() => {
  return isInRouterView.value
})

/**
 * 面包屑 key，用于强制刷新
 */
const breadcrumbKey = ref(0)

// 只在 router-view 内才监听路由变化
if (route) {
  watch(
    () => route.query,
    () => {
      breadcrumbKey.value++
    },
    { deep: true }
  )
}
</script>

<style lang="less">
// 外层容器
.header-container {
  height: 100%;
  min-width: 1000px;
  overflow: hidden;

  // 顶栏容器
  .header {
    max-height: 120px;
    border-bottom: 1px solid #e8e8e8;
    // background-color: #e8e8e8;
    // 左上方title
    .header-row {
      height: 60px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      flex-wrap: nowrap;

      .title-panel {
        width: 180px;
        min-width: 180px;
        flex-shrink: 0;

        .logo {
          margin-right: 10px;
          width: 25px;
          height: 25px;
          border-radius: 50%;
        }

        .text {
          font-size: 15px;
          font-weight: 500;
        }
      }
    }

    // 右上方 设置区域
    .setting-panel {
      margin-left: auto;
      width: auto;
      min-width: 240px;
      flex-shrink: 0;
    }
  }

  // 主要区域容器
  .main-container {
    padding: 10px !important;
  }
}

:deep(.el-header) {
  padding: 0;
}

:deep(.el-main) {
  padding: 10px;
}
</style>