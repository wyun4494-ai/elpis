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
      <el-cascader
        v-model="dotValue"
        class="component"
        :class="validTips ? 'valid-border' : ''"
        :options="options"
        :props="cascaderProps"
        :placeholder="placeholder"
        :disabled="schema.option?.disabled"
        clearable
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
      />
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
import { ref, toRefs, watch, onMounted, computed, nextTick } from 'vue'
import $curl from '$elpisCommon/curl.js'

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
    type: [String, Number, Boolean, Object, Array],
    default: undefined
  }
})

const { schema, schemaKey, model } = toRefs(props)

const name = ref('cascader')
const dotValue = ref([])
const options = ref([])
const validTips = ref('')
const placeholder = ref('请选择')
const isDataLoaded = ref(false)  // 标记数据是否已加载

// Cascader 配置
const cascaderProps = computed(() => {
  return {
    value: 'category_id',
    label: 'category_name',
    children: 'children',
    checkStrictly: schema.value.option?.checkStrictly ?? false,  // 默认只能选末级
    lazy: true,
    lazyLoad: loadCategoryChildren,
    ...schema.value.option?.props
  }
})

// 懒加载子分类
const loadCategoryChildren = async (node, resolve) => {
  const { level, value } = node
  
  // 超过4级不再加载
  if (level >= 4) {
    resolve([])
    return
  }
  
  try {
    const res = await $curl({
      method: 'get',
      url: schema.value.option?.api || '/api/proj/category/children',
      params: {
        parent_id: value || null,
        level: level + 1
      }
    })
    
    if (res && res.success && Array.isArray(res.data)) {
      const children = res.data.map(item => ({
        category_id: item.category_id,
        category_name: item.category_name,
        level: item.level,
        leaf: item.has_children === 0  // 没有子分类则为叶子节点
      }))
      resolve(children)
    } else {
      resolve([])
    }
  } catch (error) {
    console.error('Load category error:', error)
    resolve([])
  }
}

// 初始化数据
const initData = async () => {
  validTips.value = ''
  placeholder.value = schema.value.option?.placeholder || '请选择'
  
  await loadRootCategories()
  
  if (model.value) {
    await loadInitialValue(model.value)
  } else if (schema.value.option?.default !== undefined) {
    dotValue.value = schema.value.option.default
  } else {
    dotValue.value = []
  }
}

// 加载根级分类（一级分类）
const loadRootCategories = async () => {
  // 避免重复加载
  if (isDataLoaded.value) {
    return
  }
  
  isDataLoaded.value = true
  
  try {
    const res = await $curl({
      method: 'get',
      url: schema.value.option?.api || '/api/proj/category/children',
      params: {
        parent_id: null,
        level: 1
      }
    })
    
    if (res && res.success && Array.isArray(res.data)) {
      options.value = res.data.map(item => ({
        category_id: item.category_id,
        category_name: item.category_name,
        level: item.level,
        leaf: item.has_children === 0
      }))
    }
  } catch (error) {
    console.error('Load root categories error:', error)
    // 加载失败时重置标记，允许重试
    isDataLoaded.value = false
  }
}

// 加载初始值（回显）
const loadInitialValue = async (categoryId) => {
  if (!categoryId) return
  
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/category/path',
      params: { category_id: categoryId }
    })
    
    if (res && res.success && Array.isArray(res.data)) {
      const uniquePath = [...new Set(res.data)]
      
      dotValue.value = []
      await nextTick()
      
      dotValue.value = uniquePath
      await nextTick()
    }
  } catch (error) {
    console.error('Load initial value error:', error)
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
  // 返回选中的最后一级分类ID
  const value = Array.isArray(dotValue.value) && dotValue.value.length > 0
    ? dotValue.value[dotValue.value.length - 1]
    : null
  
  return value !== null ? {
    [schemaKey.value]: value
  } : {}
}

// 表单校验
const validate = () => {
  validTips.value = ''
  
  if (schema.value.option?.required && (!dotValue.value || dotValue.value.length === 0)) {
    validTips.value = '请选择分类'
    return false
  }
  
  return true
}

// 值变化事件
const onChange = (value) => {
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
.form-item {
  .item-value {
    .component {
      width: 500px;
      
      &.valid-border {
        :deep(.el-input__wrapper) {
          border: 1px solid #f56c6c;
          box-shadow: 0 0 0 0;
        }
      }
    }
  }
}
</style>

