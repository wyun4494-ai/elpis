<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    size="60%"
    :before-close="handleClose"
  >
    <div class="param-list-container">
      <!-- 参数库分类标签 -->
      <el-tabs v-model="activeCategory">
        <el-tab-pane 
          v-for="category in categories" 
          :key="category"
          :label="category" 
          :name="category"
        >
          <!-- 参数列表（checkbox 形式） -->
          <div class="param-list">
            <div
              v-for="param in getParamsByCategory(category)"
              :key="param.param_id"
              class="param-item"
            >
              <el-checkbox
                :label="param.param_id"
                :model-value="isParamSelected(param.param_id)"
                @change="(checked) => toggleParam(param, checked)"
              >
                <span class="param-name">{{ param.param_name }}</span>
                <el-tag size="small" class="param-type-tag" type="info">
                  {{ getParamTypeLabel(param.param_type) }}
                </el-tag>
              </el-checkbox>
              
              <!-- 如果参数已选中，显示额外配置 -->
              <div 
                v-if="isParamSelected(param.param_id)"
                class="param-config"
              >
                <el-form-item label="是否必填" size="small">
                  <el-switch
                    :model-value="getParamConfig(param.param_id).is_required"
                    :active-value="1"
                    :inactive-value="0"
                    size="small"
                    @change="(val) => updateParamConfig(param.param_id, 'is_required', val)"
                  />
                </el-form-item>
                
                <el-form-item label="允许自定义" size="small">
                  <el-switch
                    :model-value="getParamConfig(param.param_id).allow_custom"
                    :active-value="1"
                    :inactive-value="0"
                    size="small"
                    @change="(val) => updateParamConfig(param.param_id, 'allow_custom', val)"
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 已选参数预览 -->
      <el-divider content-position="left">已选参数 ({{ selectedParams.length }})</el-divider>
      <div v-if="selectedParams.length > 0" class="selected-params">
        <el-tag
          v-for="param in selectedParams"
          :key="param.param_id"
          closable
          @close="removeParam(param.param_id)"
        >
          {{ param.param_name }}
          <el-badge 
            v-if="param.is_required" 
            value="必填" 
            class="required-badge"
          />
        </el-tag>
      </div>
      <el-empty v-else description="暂未选择参数" :image-size="80" />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存参数</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import $curl from '$elpisCommon/curl.js'

const emit = defineEmits(['command'])

const name = ref('paramConfig')
const visible = ref(false)
const categoryId = ref('')
const categoryName = ref('')
const paramLibrary = ref([])  // 参数库
const selectedParams = ref([])  // 已选参数
const activeCategory = ref('基本参数')

const drawerTitle = computed(() => {
  return categoryName.value ? `${categoryName.value} - 参数列表` : '参数列表'
})

// 参数分类列表
const categories = computed(() => {
  const cats = [...new Set(paramLibrary.value.map(p => p.param_category))]
  return cats.length > 0 ? cats : ['基本参数']
})

// 显示抽屉
const show = async (rowData) => {
  visible.value = true
  categoryId.value = rowData.category_id
  categoryName.value = rowData.type_name || rowData.full_name
  
  // 加载参数库
  await loadParamLibrary()
  
  // 加载已选参数
  await loadSelectedParams()
}

// 加载参数库
const loadParamLibrary = async () => {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/param-library/list',
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

// 加载已选参数
const loadSelectedParams = async () => {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/type/by-category',
      params: { category_id: categoryId.value }
    })
    
    if (res && res.success && res.data && res.data.params) {
      selectedParams.value = res.data.params.map(p => ({
        param_id: p.param_id,
        param_name: p.param_name,
        param_type: p.param_type,
        param_category: p.param_category,
        is_required: p.is_required || 0,
        allow_custom: p.allow_custom !== undefined ? p.allow_custom : 1
      }))
    } else {
      selectedParams.value = []
    }
  } catch (error) {
    console.error('Load selected params error:', error)
    selectedParams.value = []
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

// 获取参数配置
const getParamConfig = (paramId) => {
  const param = selectedParams.value.find(p => p.param_id === paramId)
  return param || { is_required: 0, allow_custom: 1 }
}

// 更新参数配置
const updateParamConfig = (paramId, key, value) => {
  const param = selectedParams.value.find(p => p.param_id === paramId)
  if (param) {
    param[key] = value
  }
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
      allow_custom: 1
    })
  } else {
    // 移除参数
    removeParam(param.param_id)
  }
}

// 移除参数
const removeParam = (paramId) => {
  const index = selectedParams.value.findIndex(p => p.param_id === paramId)
  if (index !== -1) {
    selectedParams.value.splice(index, 1)
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

// 保存
const handleSave = async () => {
  try {
    const saveData = selectedParams.value.map((param, index) => ({
      param_id: param.param_id,
      is_required: param.is_required,
      allow_custom: param.allow_custom,
      sort_order: index
    }))
    
    const res = await $curl({
      method: 'post',
      url: '/api/proj/type/params',
      data: {
        category_id: categoryId.value,
        params: saveData
      },
      successMessage: '保存成功',
      errorMessage: '保存失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    console.error('Save params error:', error)
  }
}

// 关闭
const handleClose = () => {
  visible.value = false
}

defineExpose({
  show,
  name
})
</script>

<style lang="less" scoped>
.param-list-container {
  padding: 20px;
  
  .param-list {
    .param-item {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 4px;
      
      &:hover {
        border-color: #409eff;
        background: #f5f9ff;
      }
      
      .el-checkbox {
        margin-bottom: 10px;
        
        .param-name {
          margin-right: 10px;
          font-weight: 500;
        }

        .param-type-tag {
          font-size: 12px;
        }
      }
      
      .param-config {
        margin-left: 24px;
        padding: 10px;
        background: #fafafa;
        border-radius: 4px;
        display: flex;
        gap: 20px;
        
        .el-form-item {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          
          :deep(.el-form-item__label) {
            margin: 0;
            padding: 0;
          }
        }
      }
    }
  }

  .selected-params {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
    min-height: 80px;

    .el-tag {
      height: 32px;
      line-height: 30px;
      
      .required-badge {
        margin-left: 5px;
      }
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

