<template>
  <el-cascader
    v-model="dtoValue"
    class="cascader"
    :options="options"
    :props="cascaderProps"
    :placeholder="placeholder"
    clearable
    @change="onChange"
    @focus="onFocus"
  />
</template>

/**
 * 搜索级联选择器组件
 * 用于搜索栏的分类筛选，支持懒加载
 *
 * 核心功能：
 * - 支持懒加载（按需加载子分类）
 * - 支持 4 级分类层级
 * - 支持任意级选择（checkStrictly: true）
 * - 延迟加载（聚焦时才加载数据）
 *
 * 使用场景：
 * - 商品分类筛选
 * - 商品类型筛选
 *
 * @component SearchCascader
 */
<script setup>
import { ref, onMounted, computed } from 'vue'
import $curl from '$elpisCommon/curl.js'

const { schema, schemaKey } = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @example
   * {
   *   label: '商品分类',
   *   option: {
   *     api: '/api/proj/category/children',
   *     props: {
   *       checkStrictly: true
   *     }
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
const options = ref([])
const placeholder = ref('请选择')
const isDataLoaded = ref(false)  // 标记数据是否已加载

/**
 * Cascader 配置
 * 搜索时默认可选任意级（checkStrictly: true）
 *
 * @type {ComputedRef<Object>}
 */
const cascaderProps = computed(() => {
  return {
    value: 'category_id',
    label: 'category_name',
    children: 'children',
    checkStrictly: schema.option?.props?.checkStrictly ?? true,  // 搜索时默认可选任意级
    lazy: true,
    lazyLoad: loadCategoryChildren,
    ...schema.option?.props
  }
})

/**
 * 懒加载子分类
 * 当用户展开某个分类时，动态加载其子分类
 *
 * @param {Object} node - 当前节点对象
 * @param {Function} resolve - 回调函数，传入子分类数据
 */
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
      url: schema.option?.api || '/api/proj/category/children',
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
        leaf: item.has_children === 0
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

/**
 * 加载根级分类（一级分类）
 * 避免重复加载，使用 isDataLoaded 标记
 */
const loadRootCategories = async () => {
  // 避免重复加载
  if (isDataLoaded.value) {
    return
  }

  isDataLoaded.value = true

  try {
    const res = await $curl({
      method: 'get',
      url: schema.option?.api || '/api/proj/category/children',
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
    // 加载失败时，不阻塞页面，静默失败
    options.value = []
  }
}

/**
 * 获取搜索值
 * 返回选中的最后一级分类 ID
 *
 * @returns {Object} 搜索参数对象
 */
const getValue = () => {
  // 返回选中的最后一级分类ID
  const value = Array.isArray(dtoValue.value) && dtoValue.value.length > 0
    ? dtoValue.value[dtoValue.value.length - 1]
    : null

  // 如果没有选择，不传递该参数
  if (!value) {
    return {}
  }

  return {
    [schemaKey]: value
  }
}

/**
 * 重置搜索值
 * 恢复为默认值或空数组
 */
const reset = () => {
  dtoValue.value = schema?.option?.default || []
}

/**
 * 值变化事件处理
 * 搜索栏不需要特殊处理
 *
 * @param {Array} value - 选中的分类路径
 */
const onChange = (value) => {
  // 搜索栏不需要特殊处理
}

/**
 * 聚焦时加载数据
 * 延迟加载，避免页面初始化时发起不必要的请求
 */
const onFocus = () => {
  loadRootCategories()
}

/**
 * 组件挂载时初始化
 * 不在 onMounted 时加载数据，改为在用户聚焦时加载
 */
onMounted(() => {
  placeholder.value = schema.option?.placeholder || '请选择'
  reset()

  // 不在 onMounted 时加载数据，改为在用户聚焦时加载
  // 这样可以避免页面初始化时发起大量请求

  // 通知搜索栏组件已加载完成
  emit('loaded')
})

/**
 * 暴露给父组件的方法
 * - getValue: 获取选中的分类 ID
 * - reset: 重置选择
 */
defineExpose({
  getValue,
  reset
})
</script>

<style lang="less" scoped>
.cascader {
  width: 220px;
}
</style>

