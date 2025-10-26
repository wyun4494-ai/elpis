<template>
  <div class="theme-switcher">
    <el-switch
      v-model="isDark"
      class="theme-switch"
      inline-prompt
      :active-icon="Moon"
      :inactive-icon="Sunny"
      @change="handleToggle"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useThemeStore } from '$elpisStore/theme'

const themeStore = useThemeStore()
const isDark = ref(false)

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  isDark.value = themeStore.isDark
})

// 切换主题
const handleToggle = () => {
  themeStore.toggleTheme()
}
</script>

<style lang="less" scoped>
.theme-switcher {
  display: flex;
  align-items: center;
  margin: 0 20px;
  
  .theme-switch {
    --el-switch-on-color: #2c3e50;
    --el-switch-off-color: #409eff;
    
    :deep(.el-switch__core) {
      width: 50px;
      height: 26px;
      border-radius: 13px;
    }
    
    :deep(.el-switch__action) {
      width: 22px;
      height: 22px;
    }
    
    :deep(.el-switch__inner) {
      .el-icon {
        font-size: 14px;
      }
    }
  }
}
</style>

