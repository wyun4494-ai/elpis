<template>
  <el-select
    v-model="dtoValue"
    v-bind="schema.option"
    class="select"
  >
    <el-option
      v-for="item in schema.option?.enumList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

/**
 * 搜索下拉框组件
 * 用于搜索栏的下拉选择
 *
 * 核心功能：
 * - 支持下拉选择
 * - 支持重置
 * - 支持"全部"选项（值为 -999 时不传递参数）
 *
 * 使用场景：
 * - 商品状态筛选
 * - 分类类型筛选
 * - 其他枚举值筛选场景
 *
 * @component SearchSelect
 */
<script setup>
import { ref, onMounted} from 'vue'

const { schema, schemaKey} = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @example
   * {
   *   label: '商品状态',
   *   option: {
   *     enumList: [
   *       { label: '全部', value: -999 },
   *       { label: '上架', value: 1 },
   *       { label: '下架', value: 0 }
   *     ]
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

const dtoValue = ref()

/**
 * 获取搜索值
 * 值为 -999（全部选项）时返回空对象（不传递该参数）
 *
 * @returns {Object} 搜索参数对象
 */
const getValue = () => {
  // 如果值为-999（全部选项），则不传递该参数
  if (dtoValue.value === -999) {
    return {}
  }
  return dtoValue.value !== undefined && dtoValue.value !== '' ? {
    [schemaKey]: dtoValue.value
  } : {}
}

/**
 * 重置搜索值
 * 恢复为默认值或第一个选项
 */
const reset = () => {
  dtoValue.value = schema?.option?.default ?? schema.option?.enumList?.[0]?.value ?? undefined;
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
 * - getValue: 获取搜索值
 * - reset: 重置搜索值
 */
defineExpose({
  getValue,
  reset
})
</script>

<style lang="less" scoped>

</style>