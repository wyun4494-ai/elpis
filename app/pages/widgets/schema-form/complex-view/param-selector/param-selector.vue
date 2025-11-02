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
      <div class="param-selector-container">
        <!-- 参数库分类标签 -->
        <el-tabs
          v-model="activeCategory"
          @tab-click="handleCategoryChange"
        >
          <el-tab-pane 
            v-for="category in categories" 
            :key="category"
            :label="category" 
            :name="category"
          >
            <!-- 参数列表（checkbox 形式） -->
            <div class="param-list">
              <el-checkbox
                v-for="param in getParamsByCategory(category)"
                :key="param.param_id"
                v-model="param.checked"
                @change="(checked) => toggleParam(param, checked)"
              >
                <span class="param-name">{{ param.param_name }}</span>
                <el-tag
                  size="small"
                  class="param-type-tag"
                >
                  {{ getParamTypeLabel(param.param_type) }}
                </el-tag>
              </el-checkbox>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 已选参数预览 -->
        <el-divider content-position="left">
          已选参数 ({{ selectedParams.length }})
        </el-divider>
        <div
          v-if="selectedParams.length > 0"
          class="selected-params"
        >
          <el-tag
            v-for="param in selectedParams"
            :key="param.param_id"
            closable
            @close="removeParam(param.param_id)"
          >
            {{ param.param_name }}
          </el-tag>
        </div>
        <el-empty
          v-else
          description="暂未选择参数"
          :image-size="60"
        />
      </div>
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
 * 参数选择器组件
 * 从参数库中选择参数，用于配置商品类型的参数
 *
 * 核心功能：
 * - 从参数库加载参数列表
 * - 按分类展示参数（基本参数/服装参数/数码参数/家电参数/通用参数）
 * - 支持多选参数
 * - 支持参数排序
 * - 支持数据回显
 *
 * 使用场景：
 * - 商品类型配置参数
 * - 商品参数选择
 *
 * @component ParamSelector
 */
<script setup>
import { ref, toRefs, watch, onMounted, computed } from 'vue'
import $curl from '$elpisCommon/curl.js'

const props = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @required
   * @example
   * {
   *   label: '商品参数',
   *   option: {
   *     api: '/api/proj/param-library/list',
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
   * 已选参数列表（用于数据回显）
   * @type {Array}
   * @example
   * [
   *   { param_id: 'PARAM001', is_required: 1, sort_order: 0 },
   *   { param_id: 'PARAM002', is_required: 0, sort_order: 1 }
   * ]
   */
  model: {
    type: Array,
    default: () => []
  }
})

const { schema, schemaKey, model } = toRefs(props)

const name = ref('paramSelector')
const paramLibrary = ref([])  // 参数库
const selectedParams = ref([])  // 已选参数
const validTips = ref('')
const activeCategory = ref('基本参数')

/**
 * 参数分类列表
 * 从参数库中提取所有分类
 *
 * @type {ComputedRef<Array<string>>}
 */
const categories = computed(() => {
  const cats = [...new Set(paramLibrary.value.map(p => p.param_category))]
  return cats.length > 0 ? cats : ['基本参数']
})

/**
 * 初始化数据
 *
 * 处理流程：
 * 1. 加载参数库
 * 2. 从 model 加载已选参数
 * 3. 从参数库中补全参数信息
 */
const initData = async () => {
  validTips.value = ''

  // 加载参数库
  await loadParamLibrary()

  // 加载已选参数
  if (model.value && Array.isArray(model.value) && model.value.length > 0) {
    selectedParams.value = model.value.map(item => {
      // 从参数库中找到完整信息
      const libParam = paramLibrary.value.find(p => p.param_id === item.param_id)
      return {
        param_id: item.param_id,
        param_name: libParam ? libParam.param_name : '',
        param_type: libParam ? libParam.param_type : '',
        param_category: libParam ? libParam.param_category : '',
        is_required: item.is_required || 0,
        sort_order: item.sort_order || 0
      }
    })
  } else {
    selectedParams.value = []
  }
}

/**
 * 加载参数库
 * 从后端 API 加载所有参数
 */
const loadParamLibrary = async () => {
  try {
    const res = await $curl({
      method: 'get',
      url: schema.value.option?.api || '/api/proj/param-library/list',
      params: {
        page: 1,
        pageSize: 100
      }
    })

    if (res && res.success && Array.isArray(res.data)) {
      paramLibrary.value = res.data
    }
  } catch (error) {
    console.error('Load param library error:', error)
    paramLibrary.value = []
  }
}

/**
 * 根据分类获取参数
 * @param {string} category - 参数分类
 * @returns {Array} 该分类下的参数列表（包含 checked 属性）
 */
const getParamsByCategory = (category) => {
  return paramLibrary.value
    .filter(p => p.param_category === category)
    .map(p => ({
      ...p,
      checked: isParamSelected(p.param_id)
    }))
}

/**
 * 判断参数是否已选
 * @param {string} paramId - 参数 ID
 * @returns {boolean} 是否已选
 */
const isParamSelected = (paramId) => {
  return selectedParams.value.some(p => p.param_id === paramId)
}

/**
 * 切换参数选中状态
 * @param {Object} param - 参数对象
 * @param {boolean} checked - 是否选中
 */
const toggleParam = (param, checked) => {
  if (checked) {
    // 添加参数
    selectedParams.value.push({
      param_id: param.param_id,
      param_name: param.param_name,
      param_type: param.param_type,
      param_category: param.param_category,
      is_required: 0,
      sort_order: selectedParams.value.length
    })
  } else {
    // 移除参数
    removeParam(param.param_id)
  }
  onValueChange()
}

/**
 * 移除参数
 * @param {string} paramId - 参数 ID
 */
const removeParam = (paramId) => {
  const index = selectedParams.value.findIndex(p => p.param_id === paramId)
  if (index !== -1) {
    selectedParams.value.splice(index, 1)
    onValueChange()
  }
}

/**
 * 获取参数类型标签
 * @param {string} type - 参数类型
 * @returns {string} 类型标签
 */
const getParamTypeLabel = (type) => {
  const typeMap = {
    'input': '输入框',
    'select': '下拉框',
    'checkbox': '多选框'
  }
  return typeMap[type] || type
}

/**
 * 分类切换事件处理
 */
const handleCategoryChange = () => {
  // 切换分类时不需要特殊处理
}

/**
 * 值变化事件处理
 * 触发校验
 */
const onValueChange = () => {
  validate()
}

/**
 * 获取表单值
 * 返回已选参数列表（包含 param_id、is_required、sort_order）
 *
 * @returns {Object} 表单值对象
 */
const getValue = () => {
  const value = selectedParams.value.map((param, index) => ({
    param_id: param.param_id,
    is_required: param.is_required,
    sort_order: index
  }))

  return {
    [schemaKey.value]: value
  }
}

/**
 * 表单校验
 * 校验是否至少选择一个参数
 *
 * @returns {boolean} 校验结果
 */
const validate = () => {
  validTips.value = ''

  if (schema.value.option?.required && selectedParams.value.length === 0) {
    validTips.value = '请至少选择一个参数'
    return false
  }

  return true
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
 * 暴露给父组件的方法
 * - getValue: 获取已选参数列表
 * - validate: 校验参数选择
 * - name: 组件名称
 */
defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>
.param-selector-container {
  width: 100%;
  
  .param-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 10px 0;

    .el-checkbox {
      margin: 0;
      
      .param-name {
        margin-right: 8px;
      }

      .param-type-tag {
        font-size: 12px;
      }
    }
  }

  .selected-params {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    min-height: 80px;

    .el-tag {
      height: 32px;
      line-height: 30px;
    }
  }
}

.attribute-config-container {
  .attribute-item {
    .attr-values-container {
      .value-tags {
        margin-bottom: 10px;
        min-height: 32px;

        .el-tag {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }

      .add-value {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }
  }
}
</style>

