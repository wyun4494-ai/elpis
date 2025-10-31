<template>
  <el-date-picker
    v-model="dtoValue"
    v-bind="schema.option"
    type="daterange"
    range-separator="至"
    :start-placeholder="schema.label + '开始日期'"
    :end-placeholder="schema.label + '结束日期'"
    class="date-range"
  />
</template>

/**
 * 日期范围选择器组件
 * 用于搜索栏的日期范围筛选
 *
 * 核心功能：
 * - 支持日期范围选择
 * - 支持重置
 * - 自动格式化为 YYYY-MM-DD
 * - 返回 {key}_start 和 {key}_end 两个参数
 *
 * 使用场景：
 * - 创建时间筛选
 * - 更新时间筛选
 * - 其他日期范围筛选场景
 *
 * @component DateRange
 */
<script setup>
import { ref, onMounted} from 'vue'
import moment from 'moment'

const { schema, schemaKey} = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @example
   * {
   *   label: '创建时间',
   *   option: {
   *     placeholder: '请选择日期范围'
   *   }
   * }
   */
  schema: {
    type: Object,
    default: () => ({})
  },

  /**
   * Schema 键名
   * @type {string}
   */
  schemaKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['loaded'])

const dtoValue = ref([])

/**
 * 获取搜索值
 * 返回开始日期和结束日期（格式：YYYY-MM-DD）
 *
 * @returns {Object} 搜索参数对象
 * @example
 * {
 *   create_time_start: '2024-01-01',
 *   create_time_end: '2024-01-31'
 * }
 */
const getValue = () => {
  return dtoValue.value?.length >= 2 ? {
    [`${schemaKey}_start`]: moment(dtoValue.value[0]).format('YYYY-MM-DD'),
    [`${schemaKey}_end`]: moment(dtoValue.value[1]).format('YYYY-MM-DD'),
  } : {}
}

/**
 * 重置搜索值
 * 清空日期范围
 */
const reset = () => {
  dtoValue.value = []
  return
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  reset()
  emit('loaded')
})

/**
 * 暴露给父组件的方法
 * - getValue: 获取日期范围
 * - reset: 重置日期范围
 */
defineExpose({
  getValue,
  reset
})
</script>

<style lang="less" scoped>

</style>