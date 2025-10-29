<template>
  <div class="image-column">
    <div
      v-if="displayImage"
      class="image-wrapper"
    >
      <el-image
        :src="displayImage"
        :preview-src-list="previewList"
        :style="imageStyle"
        class="image-preview"
        fit="contain"
        :alt="rowData.product_name || rowData.brand_name || '图片'"
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
        v-if="imageCount > 1"
        class="image-count-badge"
      >
        +{{ imageCount - 1 }}
      </div>
    </div>
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
    type: [String, Array],
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

// 显示的图片（第一张）
const displayImage = computed(() => {
  if (!props.modelValue) return ''
  
  if (Array.isArray(props.modelValue)) {
    return props.modelValue[0] || ''
  }
  
  return props.modelValue
})

// 预览图片列表（所有图片）
const previewList = computed(() => {
  if (!props.modelValue) return []
  
  if (Array.isArray(props.modelValue)) {
    return props.modelValue
  }
  
  return [props.modelValue]
})

// 图片数量
const imageCount = computed(() => {
  if (!props.modelValue) return 0
  
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.length
  }
  
  return 1
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
  
  .image-wrapper {
    position: relative;
    
    .image-preview {
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid #e4e7ed;
      overflow: hidden;
      transition: all 0.2s ease;
      
      :deep(.el-image__inner) {
        width: 100%;
        height: 100%;
        object-fit: contain;
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
    
    .image-count-badge {
      position: absolute;
      bottom: 2px;
      right: 2px;
      background-color: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      line-height: 1;
      pointer-events: none;
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

