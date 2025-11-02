<template>
  <el-container class="sider-container">
    <!-- 侧边栏模板 -->
    <el-aside
      width="200px"
      class="aside"
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
 * - 固定侧边栏宽度（200px）
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

</script>

<style lang="less" scoped>
.sider-container {
  height: 100%;

  .aside{
    border-right: 1px solid #eee;
  }
  .main{
    overflow: auto;
    padding: 10px !important;
  }
}

:deep(.el-main) {
  padding: 10px;
}
</style>