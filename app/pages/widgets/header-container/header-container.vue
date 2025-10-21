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
<script setup>
// import { ref } from 'vue'
import businessHeaderConfig from '$businessHeaderConfig'

defineProps({
  title: {
    type: String,
    default: ''
  }
})
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
      
      .title-panel {
        width: 180px;
        min-width: 180px;
        
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
      width: 180px;
      min-width: 180px;
    }
  }
  
  // 主要区域容器
  // .main-container{}
}

:deep(.el-header) {
  padding: 0;
}
</style>