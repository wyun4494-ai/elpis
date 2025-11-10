<template>
  <span>{{ formattedText }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array],
    default: undefined
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

const formattedText = computed(() => {
  const value = props.modelValue
  const formatter = props.schema?.option?.formatter

  if (formatter && typeof formatter === 'function') {
    return formatter(value, props.rowData)
  }

  // 默认格式化规则
  if (value === null || value === undefined) {
    return '-'
  }

  // 布尔值或 1/0 转换
  if (typeof value === 'number' && (value === 0 || value === 1)) {
    // 检查是否是 switch 类型的字段
    if (props.schema?.option?.displayAsSwitch) {
      return value === 1 ? '是' : '否'
    }
  }

  // 数组转逗号分隔
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value
})
</script>

<style scoped>
span {
  font-size: 14px;
  color: #606266;
}
</style>

