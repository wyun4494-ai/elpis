<template>
  <el-select
    v-model="dtoValue"
    v-bind="schema.option"
    class="dynamic-select"
  >
    <el-option
      v-for="item in enumList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

/**
 * 动态下拉选择器组件
 * 用于搜索栏的动态选项筛选
 *
 * 核心功能：
 * - 从 API 动态加载选项列表
 * - 支持重置
 *
 * 使用场景：
 * - 动态分类筛选
 * - 动态状态筛选
 * - 其他需要从后端加载选项的场景
 *
 * @component DynamicSelect
 */
<script setup>
import { ref, onMounted} from 'vue'
import $curl from '$elpisCommon/curl'

const { schema, schemaKey} = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @example
   * {
   *   label: '分类',
   *   option: {
   *     api: '/api/proj/category/list'
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
 * @returns {Object} 搜索参数对象
 */
const getValue = () => {
  return dtoValue.value !== undefined ? {
    [schemaKey]: dtoValue.value
  } : {}
}

const enumList = ref([])

/**
 * 从 API 加载选项列表
 */
const fetchEnumList = async () => {
  try{
    const res = await $curl({
      method: 'get',
      url: schema.option?.api,
      params: {}
    })
    if(res?.data && Array.isArray(res.data) && res.data.length > 0){
      enumList.value.push(...res.data)
    }

  }catch(error) {
    console.log(error)
  }
}

/**
 * 重置搜索值
 * 恢复为默认值或第一个选项
 */
const reset = () => {
  dtoValue.value = schema?.option?.default ?? enumList?.value[0]?.value;
  return
}

/**
 * 组件挂载时初始化
 * 加载选项列表并重置
 */
onMounted(async () => {
  await fetchEnumList()
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