<template>
  <el-input
    v-model="dtoValue"
    v-bind="schema.option"
    class="input"
  />
</template>

/**
 * 搜索输入框组件
 * 用于搜索栏的文本输入
 *
 * 核心功能：
 * - 支持文本输入
 * - 支持重置
 * - 空值时不传递参数
 *
 * 使用场景：
 * - 商品名称搜索
 * - 品牌名称搜索
 * - 其他文本搜索场景
 *
 * @component SearchInput
 */
<script setup>
import { ref, onMounted} from 'vue'

const { schema, schemaKey} = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @example
   * {
   *   label: '商品名称',
   *   option: {
   *     placeholder: '请输入商品名称'
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
 * 空值时返回空对象（不传递该参数）
 *
 * @returns {Object} 搜索参数对象
 */
const getValue = () => {
  // 如果值为空字符串或undefined，则不传递该参数
  if (dtoValue.value === undefined || dtoValue.value === '') {
    return {}
  }
  return {
    [schemaKey]: dtoValue.value
  }
}

/**
 * 重置搜索值
 * 恢复为默认值
 */
const reset = () => {
  dtoValue.value = schema?.option?.default;
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