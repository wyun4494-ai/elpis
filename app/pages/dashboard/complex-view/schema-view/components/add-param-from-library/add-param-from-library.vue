<template>
  <el-drawer
    v-model="visible"
    title="从参数库添加"
    size="50%"
    :before-close="handleClose"
  >
    <div class="add-param-container">
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
            <el-checkbox
              v-for="param in getParamsByCategory(category)"
              :key="param.param_id"
              :label="param.param_id"
              v-model="selectedParamIds"
            >
              <span class="param-name">{{ param.param_name }}</span>
              <el-tag size="small" class="param-type-tag" type="info">
                {{ getParamTypeLabel(param.param_type) }}
              </el-tag>
            </el-checkbox>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 已选参数预览 -->
      <el-divider content-position="left">
        已选参数 ({{ selectedParamIds.length }})
      </el-divider>
      <div v-if="selectedParamIds.length > 0" class="selected-params">
        <el-tag
          v-for="paramId in selectedParamIds"
          :key="paramId"
          closable
          @close="removeParam(paramId)"
        >
          {{ getParamName(paramId) }}
        </el-tag>
      </div>
      <el-empty v-else description="暂未选择参数" :image-size="60" />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSave"
        >
          添加
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import $curl from '$elpisCommon/curl.js'

const route = useRoute()

const emit = defineEmits(['command'])

const name = ref('addFromLibrary')
const visible = ref(false)
const categoryId = ref('')
const paramLibrary = ref([])
const selectedParamIds = ref([])
const activeCategory = ref('基本参数')

// 参数分类列表
const categories = computed(() => {
  const cats = [...new Set(paramLibrary.value.map(p => p.param_category))]
  return cats.length > 0 ? cats : ['基本参数']
})

// 显示组件
const show = async (rowData) => {
  visible.value = true
  categoryId.value = rowData?.category_id || route.query.category_id || ''
  selectedParamIds.value = []
  
  // 加载参数库
  await loadParamLibrary()
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

// 根据分类获取参数
const getParamsByCategory = (category) => {
  return paramLibrary.value.filter(p => p.param_category === category)
}

// 获取参数名称
const getParamName = (paramId) => {
  const param = paramLibrary.value.find(p => p.param_id === paramId)
  return param ? param.param_name : paramId
}

// 移除参数
const removeParam = (paramId) => {
  const index = selectedParamIds.value.indexOf(paramId)
  if (index !== -1) {
    selectedParamIds.value.splice(index, 1)
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
  if (selectedParamIds.value.length === 0) {
    ElMessage.warning('请至少选择一个参数')
    return
  }
  
  try {
    const res = await $curl({
      method: 'post',
      url: '/api/proj/category-param/add-from-library',
      data: {
        category_id: categoryId.value,
        param_ids: selectedParamIds.value
      },
      successMessage: '添加成功',
      errorMessage: '添加失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    console.error('Add params error:', error)
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
.add-param-container {
  padding: 20px;
  
  .param-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    .el-checkbox {
      margin: 0;
      padding: 12px;
      border: 1px solid #eee;
      border-radius: 4px;
      
      &:hover {
        border-color: #409eff;
        background: #f5f9ff;
      }
      
      .param-name {
        margin-right: 10px;
        font-weight: 500;
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
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
    min-height: 60px;

    .el-tag {
      height: 28px;
      line-height: 26px;
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

