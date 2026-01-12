<template>
  <div class="table-switch-wrapper">
    <!-- 只有当 showLabel 为 true 时才显示标签 -->
    <span
      v-if="schema.option?.showLabel !== false"
      class="switch-label"
    >{{ schema.option?.label || '上架:' }}</span>
    <el-switch
      v-model="currentValue"
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
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

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
const currentValue = ref(props.modelValue)
const initialValue = ref(null)
const isMounted = ref(false)

// 监听外部值变化，同步到currentValue
watch(() => props.modelValue, (newVal) => {
  currentValue.value = newVal
})

const handleChange = async (value) => {
  // 防止初始化时触发：如果值和初始值相同，说明是初始化触发的
  if (!isMounted.value || value === initialValue.value) {
    return
  }

  const activeValue = props.schema.option?.activeValue ?? 1

  // 业务逻辑验证（根据 schema.option.validateRules 配置）
  const validateRules = props.schema.option?.validateRules || []
  
  for (const rule of validateRules) {
    // 商品上架验证：检查库存
    if (rule === 'checkInventory' && value === activeValue && props.rowData.inventory === 0) {
      ElMessage.error('总库存为0，不能上架')
      currentValue.value = props.modelValue
      return
    }
    
    // 商品上架验证：检查审核状态
    if (rule === 'checkAuditStatus' && value === activeValue && props.rowData.audit_status !== 1) {
      ElMessage.error('商品未审核通过，不能上架')
      currentValue.value = props.modelValue
      return
    }

    // 秒杀活动开启验证：检查开始时间
    if (rule === 'checkStartTime' && value === activeValue) {
      const startTime = props.rowData.start_time
      if (startTime) {
        const startDate = new Date(startTime)
        const now = new Date()
        
        if (startDate > now) {
          ElMessage.error('活动开始时间未到，不能开启活动')
          currentValue.value = props.modelValue
          return
        }
      }
    }
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
  currentValue.value = props.modelValue
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

