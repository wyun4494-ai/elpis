<template>
  <div class="table-switch-wrapper">
    <span class="switch-label">上架:</span>
    <el-switch
      :model-value="modelValue"
      :active-value="schema.option?.activeValue ?? 1"
      :inactive-value="schema.option?.inactiveValue ?? 0"
      :active-text="schema.option?.activeText"
      :inactive-text="schema.option?.inactiveText"
      :disabled="schema.option?.disabled || loading"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  schema: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: [String, Number, Boolean],
    default: undefined
  },
  rowData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const loading = ref(false)
const initialValue = ref(null)
const isMounted = ref(false)

const handleChange = async (value) => {
  // 防止初始化时触发：如果值和初始值相同，说明是初始化触发的
  if (!isMounted.value || value === initialValue.value) {
    return
  }
  
  loading.value = true
  
  try {
    // 触发更新事件
    emit('update:modelValue', value)
    emit('change', value, props.rowData)
  } finally {
    // 短暂延迟，提供视觉反馈
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
}

onMounted(() => {
  // 保存初始值
  initialValue.value = props.modelValue
  // 立即标记为已挂载（不需要延迟）
  isMounted.value = true
})
</script>

<style lang="less" scoped>
.table-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;

  .switch-label {
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
  }

  :deep(.el-switch) {
    vertical-align: middle;
  }
}
</style>

