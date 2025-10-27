<template>
  <div class="sku-status-column">
    <div class="status-text">
      {{ modelValue }}
    </div>
    <el-button
      type="primary"
      size="small"
      link
      @click="handleEdit"
    >
      编辑SKU
    </el-button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

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

// 注入 schema-view 的数据和方法
const schemaViewData = inject('schemaViewData', null)

const handleEdit = () => {
  if (schemaViewData && schemaViewData.showComponent) {
    schemaViewData.showComponent.value({
      btnConfig: {
        eventOption: {
          comName: 'skuEditDialog'
        }
      },
      rowData: props.rowData
    })
  }
}
</script>

<style lang="less" scoped>
.sku-status-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  
  .status-text {
    font-size: 14px;
    color: #606266;
  }
  
  .el-button {
    padding: 0;
    height: auto;
    font-size: 12px;
  }
}
</style>

