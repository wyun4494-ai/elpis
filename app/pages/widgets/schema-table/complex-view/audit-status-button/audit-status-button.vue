<template>
  <div class="audit-status-button">
    <!-- 审核状态标签 -->
    <el-tag
      :type="tagType"
      size="small"
    >
      {{ statusText }}
    </el-tag>

    <!-- 审核详情按钮（始终显示） -->
    <el-button
      type="primary"
      size="small"
      link
      @click="handleClick"
    >
      审核详情
    </el-button>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
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

// 注入 operationHandler（从 schema-table.vue 提供）
const operationHandler = inject('operationHandler', null)

// 审核状态值
const auditStatus = computed(() => {
  return parseInt(props.modelValue) || 0
})

// 状态文本
const statusText = computed(() => {
  switch (auditStatus.value) {
    case 0:
      return '待审核'
    case 1:
      return '已审核'
    case 2:
      return '审核不通过'
    default:
      return '待审核'
  }
})

// 标签类型（颜色）
const tagType = computed(() => {
  switch (auditStatus.value) {
    case 0:
      return 'info'      // 待审核：灰色
    case 1:
      return 'success'   // 已审核：绿色
    case 2:
      return 'danger'    // 审核不通过：红色
    default:
      return 'info'
  }
})

// 点击按钮
const handleClick = () => {
  if (operationHandler && typeof operationHandler === 'function') {
    // 使用与行按钮相同的事件处理方式
    operationHandler({
      btnConfig: {
        eventKey: 'showComponent',
        eventOption: {
          comName: 'auditDetailDialog',
          mode: 'view'
        }
      },
      rowData: props.rowData
    })
  }
}
</script>

<style scoped>
.audit-status-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
</style>

