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

/**
 * 级联选择器组件
 * 用于分类选择，支持懒加载和数据回显
 *
 * 核心功能：
 * - 支持懒加载（按需加载子分类）
 * - 支持 4 级分类层级
 * - 支持数据回显（编辑模式）
 * - 支持只选末级或任意级（checkStrictly 配置）
 * - 自动加载分类路径用于回显
 *
 * 使用场景：
 * - 商品分类选择
 * - 商品类型选择
 *
 * @component Cascader
 */
<script setup>
import { ref, toRefs, watch, onMounted, computed, nextTick } from 'vue'
import $curl from '$elpisCommon/curl.js'

const props = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @required
   * @example
   * {
   *   label: '商品分类',
   *   option: {
   *     api: '/api/proj/category/children',
   *     checkStrictly: false,
   *     placeholder: '请选择分类',
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
   * 分类 ID（用于数据回显）
   * @type {string|number|boolean|Object|Array}
   */
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

/**
 * Cascader 配置
 * @type {ComputedRef<Object>}
 */
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

/**
 * 初始化数据
 *
 * 处理流程：
 * 1. 加载根级分类（一级分类）
 * 2. 如果有初始值，加载分类路径用于回显
 */
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

/**
 * 加载初始值（回显）
 * 编辑模式下，根据分类 ID 加载完整的分类路径
 *
 * 处理流程：
 * 1. 确保根分类已加载
 * 2. 调用 API 获取分类路径（如 [CAT001, CAT001001, CAT001001001]）
 * 3. 设置到 cascader 组件
 *
 * @param {string} categoryId - 分类 ID
 */
const loadInitialValue = async (categoryId) => {
  if (!categoryId) return

  try {
    // 确保根分类已加载
    if (!isDataLoaded.value) {
      await loadRootCategories()
    }

    // 等待根分类加载完成
    await nextTick()

    const res = await $curl({
      method: 'get',
      url: '/api/proj/category/path',
      params: { category_id: categoryId }
    })

    if (res && res.success && Array.isArray(res.data)) {
      const uniquePath = [...new Set(res.data)]

      // 清空并重新设置，触发el-cascader刷新
      dotValue.value = []
      await nextTick()

      dotValue.value = uniquePath

      // 多次nextTick确保渲染完成
      await nextTick()
      await nextTick()
    }
  } catch (error) {
    console.error('Load initial value error:', error)
  }
}

/**
 * 组件挂载时初始化数据
 */
onMounted(() => {
  initData()
})

/**
 * 监听 model 变化，重新加载初始值
 * 优化逻辑，避免重复初始化
 */
watch(model, async (newVal, oldVal) => {
  // 值没变化不处理
  if (newVal === oldVal) return

  // 如果新值为空或undefined,清空选择
  if (!newVal) {
    dotValue.value = []
    return
  }

  // 延迟执行，确保组件完全挂载
  await nextTick()
  await loadInitialValue(newVal)
}, {
  flush: 'post'  // 在DOM更新后执行
})

/**
 * 监听 schema 变化，重新加载根分类
 */
watch(schema, () => {
  // schema变化时只需要重新加载根分类
  if (!isDataLoaded.value) {
    loadRootCategories()
  }
}, {
  deep: true,
  immediate: false
})

/**
 * 获取表单值
 * 返回选中的最后一级分类 ID
 *
 * @returns {Object} 表单值对象
 */
const getValue = () => {
  // 返回选中的最后一级分类ID
  const value = Array.isArray(dotValue.value) && dotValue.value.length > 0
    ? dotValue.value[dotValue.value.length - 1]
    : null

  return value !== null ? {
    [schemaKey.value]: value
  } : {}
}

/**
 * 表单校验
 * @returns {boolean} 校验结果
 */
const validate = () => {
  validTips.value = ''

  if (schema.value.option?.required && (!dotValue.value || dotValue.value.length === 0)) {
    validTips.value = '请选择分类'
    return false
  }

  return true
}

/**
 * 值变化事件处理
 * 触发校验
 *
 * @param {Array} value - 选中的分类路径
 */
const onChange = (value) => {
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
 * - getValue: 获取选中的分类 ID
 * - validate: 校验分类
 * - name: 组件名称
 */
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

