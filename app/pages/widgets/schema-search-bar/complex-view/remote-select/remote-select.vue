<template>
  <el-select
    v-model="dtoValue"
    v-bind="schema.option"
    class="remote-select"
    :placeholder="placeholder"
    filterable
    remote
    reserve-keyword
    :remote-method="remoteSearch"
    :loading="loading"
    clearable
    @change="onChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

/**
 * 搜索远程下拉框组件
 * 用于搜索栏的远程搜索筛选
 *
 * 核心功能：
 * - 支持远程搜索（输入关键字调用 API 搜索）
 * - 支持自定义 labelKey 和 valueKey
 * - 支持重置
 *
 * 使用场景：
 * - 品牌搜索筛选
 * - 商品搜索筛选
 * - 其他大数据量搜索场景
 *
 * @component SearchRemoteSelect
 */
<script setup>
import { ref, onMounted } from 'vue'
import $curl from '$elpisCommon/curl.js'

const { schema, schemaKey } = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @example
   * {
   *   label: '品牌',
   *   option: {
   *     api: '/api/proj/brand/search',
   *     labelKey: 'brand_name',
   *     valueKey: 'brand_id',
   *     placeholder: '请输入品牌名称搜索'
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
const options = ref([])
const loading = ref(false)
const placeholder = ref('请输入关键字搜索')

/**
 * 远程搜索
 * 输入关键字调用 API 搜索
 *
 * @param {string} query - 搜索关键字
 */
const remoteSearch = async (query) => {
  if (!query) {
    options.value = []
    return
  }

  loading.value = true

  try {
    const res = await $curl({
      method: 'get',
      url: schema.option?.api,
      params: {
        keyword: query,
        page: 1,
        pageSize: 50
      }
    })

    loading.value = false

    if (res && res.success && Array.isArray(res.data)) {
      const labelKey = schema.option?.labelKey || 'name'
      const valueKey = schema.option?.valueKey || 'id'

      options.value = res.data.map(item => ({
        label: item[labelKey],
        value: item[valueKey]
      }))
    } else {
      options.value = []
    }
  } catch (error) {
    loading.value = false
    console.error('Remote search error:', error)
    options.value = []
  }
}

/**
 * 获取搜索值
 * @returns {Object} 搜索参数对象
 */
const getValue = () => {
  if (!dtoValue.value) {
    return {}
  }

  return {
    [schemaKey]: dtoValue.value
  }
}

/**
 * 重置搜索值
 * 清空选项列表
 */
const reset = () => {
  dtoValue.value = schema?.option?.default
  options.value = []
}

/**
 * 值变化事件处理
 * 搜索栏不需要特殊处理
 *
 * @param {any} value - 新值
 */
const onChange = (value) => {
  // 搜索栏不需要特殊处理
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  placeholder.value = schema.option?.placeholder || '请输入关键字搜索'
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
.remote-select {
  width: 220px;
}
</style>

