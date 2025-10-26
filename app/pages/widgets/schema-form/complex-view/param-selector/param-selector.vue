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
                :label="param.param_id"
                :model-value="isParamSelected(param.param_id)"
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

<script setup>
import { ref, toRefs, watch, onMounted, computed } from 'vue'
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

// 参数分类列表
const categories = computed(() => {
  const cats = [...new Set(paramLibrary.value.map(p => p.param_category))]
  return cats.length > 0 ? cats : ['基本参数']
})

// 初始化数据
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

// 加载参数库
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

// 根据分类获取参数
const getParamsByCategory = (category) => {
  return paramLibrary.value.filter(p => p.param_category === category)
}

// 判断参数是否已选
const isParamSelected = (paramId) => {
  return selectedParams.value.some(p => p.param_id === paramId)
}

// 切换参数选中状态
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

// 移除参数
const removeParam = (paramId) => {
  const index = selectedParams.value.findIndex(p => p.param_id === paramId)
  if (index !== -1) {
    selectedParams.value.splice(index, 1)
    onValueChange()
  }
}

// 参数类型标签
const getParamTypeLabel = (type) => {
  const typeMap = {
    'input': '输入框',
    'select': '下拉框',
    'checkbox': '多选框'
  }
  return typeMap[type] || type
}

// 分类切换
const handleCategoryChange = () => {
  // 切换分类时不需要特殊处理
}

// 值变化
const onValueChange = () => {
  validate()
}

// 获取表单值
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

// 表单校验
const validate = () => {
  validTips.value = ''
  
  if (schema.value.option?.required && selectedParams.value.length === 0) {
    validTips.value = '请至少选择一个参数'
    return false
  }
  
  return true
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

