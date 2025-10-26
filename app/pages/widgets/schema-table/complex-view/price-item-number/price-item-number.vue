<template>
  <div class="price-item-number">
    <div class="price">
      价格：¥{{ formatPrice(rowData.price) }}
    </div>
    <div class="item-number">
      货号：{{ rowData.item_number || '-' }}
    </div>
  </div>
</template>

<script setup>
// 定义 props，在模板中直接使用
defineProps({
  modelValue: {
    type: [Number, String],
    default: 0
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

// 格式化价格
const formatPrice = (price) => {
  if (!price && price !== 0) return '0.00'
  return parseFloat(price).toFixed(2)
}
</script>

<style lang="less" scoped>
.price-item-number {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
  
  .price {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }
  
  .item-number {
    font-size: 12px;
    color: #909399;
  }
}
</style>

