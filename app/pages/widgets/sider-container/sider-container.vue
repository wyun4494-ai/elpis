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
  }
}
</style>