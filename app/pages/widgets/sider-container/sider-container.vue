<template>
  <el-container class="sider-container">
    <!-- 侧边栏模板 -->
    <el-aside
      :width="menuStore.isCollapsed ? '64px' : '200px'"
      class="aside"
      :class="{ 'is-collapsed': menuStore.isCollapsed }"
    >
      <slot name="menu-content" />
    </el-aside>
    <!-- 主内容模板 -->
    <el-main class="main">
      <slot name="main-content" />
    </el-main>
  </el-container>
</template>

/**
 * 侧边栏容器组件
 * Dashboard 布局的侧边栏容器，包含侧边栏菜单和主内容区域
 *
 * 核心功能：
 * - 提供侧边栏插槽（menu-content）
 * - 提供主内容区域插槽（main-content）
 * - 支持侧边栏折叠/展开（200px / 64px）
 * - 自动适应宽度变化
 *
 * 插槽说明：
 * - menu-content: 侧边栏菜单区域
 * - main-content: 主内容区域
 *
 * 使用场景：
 * - Dashboard 布局的侧边栏
 *
 * @component SiderContainer
 */
<script setup>
import { onMounted } from 'vue'
import { useMenuStore } from '$elpisStore/menu.js'

const menuStore = useMenuStore()

// 组件挂载时恢复折叠状态
onMounted(() => {
  menuStore.restoreCollapseState()
})
</script>

<style lang="less" scoped>
.sider-container {
  height: 100%;

  .aside {
    border-right: 1px solid #eee;
    transition: width 0.3s ease; // 平滑的宽度变化动画
    overflow: hidden; // 折叠时隐藏溢出内容

    &.is-collapsed {
      // 折叠状态下的样式
      :deep(.el-menu) {
        width: 64px;
      }
    }
  }

  .main {
    overflow: auto;
    padding: 10px !important;
    transition: margin-left 0.3s ease; // 平滑的布局变化
  }
}

:deep(.el-main) {
  padding: 10px;
}

// 深色主题适配
html.dark .sider-container {
  .aside {
    border-right: 1px solid #4c4d4f;
  }
}
</style>