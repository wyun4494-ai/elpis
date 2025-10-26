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

<script setup>
import { ref, onMounted } from 'vue'
import $curl from '$elpisCommon/curl.js'

const { schema, schemaKey } = defineProps({
  schema: {
    type: Object,
    default: () => ({})
  },
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

// 获取搜索值
const getValue = () => {
  if (!dtoValue.value) {
    return {}
  }
  
  return {
    [schemaKey]: dtoValue.value
  }
}

// 重置
const reset = () => {
  dtoValue.value = schema?.option?.default
  options.value = []
}

// 值变化
const onChange = (value) => {
  // 搜索栏不需要特殊处理
}

onMounted(() => {
  placeholder.value = schema.option?.placeholder || '请输入关键字搜索'
  reset()
  emit('loaded')
})

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

