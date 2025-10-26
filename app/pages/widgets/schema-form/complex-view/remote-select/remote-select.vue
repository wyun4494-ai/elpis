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

<script setup>
import { ref, toRefs, watch, onMounted, inject } from 'vue'
import $curl from '$elpisCommon/curl.js'

const ajv = inject('ajv')
const props = defineProps({
  schema: {
    type: Object,
    default: () => ({})
  },
  schemaKey: {
    type: String,
    default: ''
  },
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

// 初始化数据
const initData = () => {
  dotValue.value = model.value !== undefined ? model.value : schema.option?.default
  validTips.value = ''
  placeholder.value = schema.option?.placeholder || '请输入关键字搜索'
  
  // 如果有初始值，加载对应的选项
  if (dotValue.value) {
    loadInitialOption(dotValue.value)
  }
}

// 加载初始选项（用于回显）
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

// 远程搜索
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

onMounted(() => {
  initData()
})

watch([model, schema], () => {
  initData()
}, {
  deep: true,
  immediate: false
})

// 获取表单值
const getValue = () => {
  return dotValue.value !== null && dotValue.value !== undefined ? {
    [schemaKey]: dotValue.value
  } : {}
}

// 表单校验
const validate = () => {
  validTips.value = ''
  
  if (schema.option?.required && !dotValue.value) {
    validTips.value = '请选择'
    return false
  }
  
  return true
}

// 值变化事件
const onChange = () => {
  validate()
}

// 输入框聚焦事件
const onFocus = () => {
  validTips.value = ''
}

// 输入框失焦事件
const onBlur = () => {
  validate()
}

defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>
</style>

