<template>
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
        <!-- 插槽： 菜单区域   -->
        <slot class="menu-content">
          <!--  -->
        </slot>
        <!-- 右上方 设置区域 -->
        <el-row
          type="flex"
          align="middle"
          justify="end"
          class="setting-panel"
        >
          <!-- 插槽： 设置区域 -->
          <slot name="setting-content">
            <!--  -->
          </slot>
          <img 
            src="./asserts/avatar.png"
            class="avatar"
          >
          <el-dropdown @command="handleUserCommand">
            <span class="username">
              {{ userName }} <i class="el-icon-arrow-down el-icon--right" />
            </span>
            <template #dropdown>
              <el-dropdown-item command="logout">
                退出登录
              </el-dropdown-item>
            </template>
          </el-dropdown>
        </el-row>
      </el-row>
    </el-header>
    <el-main class="main-container">
      <!-- 插槽: 外部扩展区域 -->
      <slot name="main-content" />
    </el-main>
  </el-container>
</template>
<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const userName = ref('管理员')
const handleUserCommand = function(event) {
  console.log(event)
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
      
      .avatar {
        margin-right: 10px;
        width: 25px;
        height: 25px;
        border-radius: 50%;
      }
      
      .username {
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        height: 60px;
        line-height: 60px;
        outline: none;
      }
    }
  }
  
  // 主要区域容器
  // .main-container{}
}

:deep(.el-header) {
  padding: 0;
}
</style>