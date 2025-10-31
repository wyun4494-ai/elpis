<template>
  <el-row
    type="flex"
    align="top"
    class="form-item"
  >
    <!-- label -->
    <el-row
      class="item-label"
      justify="start"
    >
      <el-row 
        v-if="schema.option?.required"
        type="flex"
        class="required"
      >
        *
      </el-row>
      {{ schema.label }}
    </el-row>
    <!-- value -->
    <el-row
      class="item-value"
    >
      <el-select
        v-model="dotValue"
        v-bind="schema.option"
        class="component"
        :class="validTips ? 'valid-border' : ''"
        :placeholder="placeholder"
        filterable
        remote
        reserve-keyword
        :remote-method="remoteSearch"
        :loading="loading"
        clearable
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-row>
    <el-row
      v-if="validTips"
      class="valid-tips"
    >
      {{ validTips }}
    </el-row>
  </el-row>
</template>

/**
 * 远程搜索下拉组件
 * 支持远程搜索的下拉选择框，用于大数据量的选择场景
 *
 * 核心功能：
 * - 支持远程搜索（输入关键字调用 API 搜索）
 * - 支持数据回显（编辑模式下加载初始选项）
 * - 支持自定义 labelKey 和 valueKey
 * - 支持必填校验
 *
 * 使用场景：
 * - 品牌选择（从大量品牌中搜索）
 * - 分类选择（从大量分类中搜索）
 * - 商品选择（从大量商品中搜索）
 *
 * @component RemoteSelect
 */
<script setup>
import { ref, toRefs, watch, onMounted } from 'vue'
import $curl from '$elpisCommon/curl.js'

const props = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @required
   * @example
   * {
   *   label: '品牌',
   *   option: {
   *     api: '/api/proj/brand/search',
   *     detailApi: '/api/proj/brand/:id',
   *     labelKey: 'brand_name',
   *     valueKey: 'brand_id',
   *     placeholder: '请输入品牌名称搜索',
   *     required: true
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
  },

  /**
   * 表单值（用于数据回显）
   * @type {string|number|boolean|Object}
   */
  model: {
    type: [String, Number, Boolean, Object],
    default: undefined
  }
})

const { schema, schemaKey } = props
const { model } = toRefs(props)

const name = ref('remoteSelect')
const dotValue = ref()
const options = ref([])
const loading = ref(false)
const validTips = ref('')
const placeholder = ref('请输入关键字搜索')

/**
 * 初始化数据
 * 从 model 中加载初始值，用于数据回显
 */
const initData = () => {
  dotValue.value = model.value !== undefined ? model.value : schema.option?.default
  validTips.value = ''
  placeholder.value = schema.option?.placeholder || '请输入关键字搜索'

  // 如果有初始值，加载对应的选项
  if (dotValue.value) {
    loadInitialOption(dotValue.value)
  }
}

/**
 * 加载初始选项（用于回显）
 * 编辑模式下，根据初始值调用详情 API 获取选项数据
 *
 * @param {string|number} value - 初始值
 */
const loadInitialOption = async (value) => {
  if (!value) return

  try {
    const res = await $curl({
      method: 'get',
      url: schema.option?.detailApi || schema.option?.api,
      params: {
        [schema.option?.valueKey || 'id']: value
      }
    })

    if (res && res.success && res.data) {
      const labelKey = schema.option?.labelKey || 'name'
      const valueKey = schema.option?.valueKey || 'id'

      options.value = [{
        label: res.data[labelKey],
        value: res.data[valueKey]
      }]
    }
  } catch (error) {
    console.error('Load initial option error:', error)
  }
}

/**
 * 远程搜索
 * 根据用户输入的关键字调用 API 搜索数据
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
    // 调用搜索 API
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

      // 转换为下拉选项格式
      options.value = res.data.map(item => ({
        label: item[labelKey],
        value: item[valueKey],
        ...item  // 保留原始数据
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
 * 组件挂载时初始化数据
 */
onMounted(() => {
  initData()
})

/**
 * 监听 model 和 schema 变化，重新初始化数据
 */
watch([model, schema], () => {
  initData()
}, {
  deep: true,
  immediate: false
})

/**
 * 获取表单值
 * @returns {Object} 表单值对象
 */
const getValue = () => {
  return dotValue.value !== null && dotValue.value !== undefined ? {
    [schemaKey]: dotValue.value
  } : {}
}

/**
 * 表单校验
 * @returns {boolean} 校验结果
 */
const validate = () => {
  validTips.value = ''

  if (schema.option?.required && !dotValue.value) {
    validTips.value = '请选择'
    return false
  }

  return true
}

/**
 * 值变化事件处理
 * 触发校验
 */
const onChange = () => {
  validate()
}

/**
 * 输入框聚焦事件处理
 * 清空校验提示
 */
const onFocus = () => {
  validTips.value = ''
}

/**
 * 输入框失焦事件处理
 * 触发校验
 */
const onBlur = () => {
  validate()
}

/**
 * 暴露给父组件的方法
 * - getValue: 获取表单值
 * - validate: 校验表单
 * - name: 组件名称
 */
defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>
</style>

