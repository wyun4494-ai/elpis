<template>
  <div class="image-column">
    <el-image
      v-if="modelValue"
      :src="modelValue"
      :preview-src-list="[modelValue]"
      :style="imageStyle"
      class="image-preview"
      fit="contain"
      :alt="rowData.brand_name || '图片'"
      :z-index="3000"
      :preview-teleported="true"
      @error="handleError"
    >
      <template #error>
        <div
          class="image-error"
          :style="imageStyle"
        >
          <el-icon><Picture /></el-icon>
          <span>加载失败</span>
        </div>
      </template>
    </el-image>
    <div
      v-else
      class="image-placeholder"
      :style="imageStyle"
    >
      <el-icon><Picture /></el-icon>
      <span>暂无图片</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  rowData: {
    type: Object,
    default: () => ({})
  },
  schema: {
    type: Object,
    default: () => ({})
  }
})

// 计算图片尺寸（可通过 schema.option.imageSize 配置）
const imageSize = computed(() => {
  return props.schema?.option?.imageSize || 60
})

const imageStyle = computed(() => {
  return {
    width: `${imageSize.value}px`,
    height: `${imageSize.value}px`
  }
})

const handleError = (e) => {
  console.error('Image load error:', e)
}
</script>

<style lang="less" scoped>
.image-column {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  
  .image-preview {
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid #e4e7ed;
    overflow: hidden;
    transition: all 0.2s ease;
    
    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
      object-fit: contain;  // 显示完整图片
      transition: transform 0.2s ease;
    }
    
    :deep(.el-image__wrapper) {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
    }
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      
      :deep(.el-image__inner) {
        transform: scale(1.1);
      }
    }
  }
  
  .image-error,
  .image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    color: #909399;
    font-size: 12px;
    
    .el-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }
    
    span {
      font-size: 10px;
    }
  }
}
</style>

