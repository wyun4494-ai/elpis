<template>
  <el-drawer
    v-model="visible"
    title="从参数库添加"
    size="50%"
    :before-close="handleClose"
  >
    <div class="add-param-container">
      <!-- 场景1：已有分类ID，显示只读的分类信息 -->
      <el-alert
        v-if="categoryId && categoryInfo.category_name"
        :title="`正在为【${categoryInfo.full_name || categoryInfo.category_name}】添加参数`"
        type="info"
        :closable="false"
        show-icon
        class="category-info-alert"
      >
        <template #default>
          <div class="category-info-detail">
            <span class="info-label">分类ID：</span>
            <span class="info-value">{{ categoryInfo.category_id }}</span>
            <el-divider direction="vertical" />
            <span class="info-label">分类层级：</span>
            <span class="info-value">第 {{ categoryInfo.level }} 级</span>
          </div>
        </template>
      </el-alert>

      <!-- 场景2：无分类ID，显示分类选择器 -->
      <el-form
        v-else
        label-width="100px"
        class="category-selector-form"
      >
        <el-form-item
          label="目标分类"
          required
        >
          <el-cascader
            v-model="selectedCategoryPath"
            :options="categoryTree"
            :props="cascaderProps"
            placeholder="请选择要添加参数的商品分类"
            clearable
            filterable
            style="width: 100%"
            @change="handleCategoryChange"
          />
          <div class="form-item-tip">
            请选择要为哪个商品分类添加参数（只能选择末级分类）
          </div>
        </el-form-item>
      </el-form>

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
            <el-checkbox-group v-model="selectedParamIds">
              <el-checkbox
                v-for="param in getParamsByCategory(category)"
                :key="param.param_id"
                :value="param.param_id"
              >
                <span class="param-name">{{ param.param_name }}</span>
                <el-tag size="small" class="param-type-tag" type="info">
                  {{ getParamTypeLabel(param.param_type) }}
                </el-tag>
              </el-checkbox>
            </el-checkbox-group>
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import $curl from '$elpisCommon/curl.js'

const route = useRoute()

const emit = defineEmits(['command'])

const name = ref('addFromLibrary')
const visible = ref(false)
const categoryId = ref('')
const categoryInfo = ref({
  category_id: '',
  category_name: '',
  full_name: '',
  level: 0
})
const paramLibrary = ref([])
const selectedParamIds = ref([])
const activeCategory = ref('基本参数')

// 分类选择器相关
const selectedCategoryPath = ref([])
const categoryTree = ref([])
const cascaderProps = {
  value: 'category_id',
  label: 'category_name',
  children: 'children',
  checkStrictly: false, // 只能选择末级
  emitPath: true
}

// 参数分类列表
const categories = computed(() => {
  const cats = [...new Set(paramLibrary.value.map(p => p.param_category))]
  return cats.length > 0 ? cats : ['基本参数']
})

// 显示组件
const show = async (rowData) => {
  categoryId.value = rowData?.category_id || route.query.category_id || ''
  selectedParamIds.value = []
  selectedCategoryPath.value = []

  // 如果有 categoryId，加载分类信息
  if (categoryId.value) {
    await loadCategoryInfo()
  } else {
    // 如果没有 categoryId，加载分类树供用户选择
    await loadCategoryTree()
  }

  // 加载参数库
  await loadParamLibrary()

  // 所有数据加载完成后再显示抽屉
  visible.value = true
}

// 加载分类信息
const loadCategoryInfo = async () => {
  if (!categoryId.value) {
    categoryInfo.value = {
      category_id: '',
      category_name: '',
      full_name: '',
      level: 0
    }
    return
  }

  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/category',
      params: {
        category_id: categoryId.value
      }
    })

    if (res && res.success && res.data) {
      categoryInfo.value = {
        category_id: res.data.category_id,
        category_name: res.data.category_name,
        full_name: res.data.full_name,
        level: res.data.level
      }
    } else {
      categoryInfo.value = {
        category_id: categoryId.value,
        category_name: '未知分类',
        full_name: '未知分类',
        level: 0
      }
    }
  } catch (error) {
    console.error('Load category info error:', error)
    categoryInfo.value = {
      category_id: categoryId.value,
      category_name: '未知分类',
      full_name: '未知分类',
      level: 0
    }
  }
}

// 加载分类树（用于级联选择器）
const loadCategoryTree = async () => {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/category/list',
      params: {
        page: 1,
        pageSize: 1000,
        status: 1
      }
    })

    if (res && res.success && Array.isArray(res.data)) {
      // 将扁平数据转换为树形结构
      categoryTree.value = buildCategoryTree(res.data)
    }
  } catch (error) {
    console.error('Load category tree error:', error)
    categoryTree.value = []
  }
}

// 构建分类树
const buildCategoryTree = (flatList) => {
  const map = {}
  const roots = []

  // 创建映射
  flatList.forEach(item => {
    map[item.category_id] = {
      category_id: item.category_id,
      category_name: item.category_name,
      parent_id: item.parent_id,
      level: item.level,
      has_children: item.has_children,
      children: []
    }
  })

  // 构建树形结构
  flatList.forEach(item => {
    const node = map[item.category_id]
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(node)
    } else {
      roots.push(node)
    }
  })

  // 移除没有子节点的 children 属性（末级分类）
  const removeEmptyChildren = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        removeEmptyChildren(node.children)
      } else {
        delete node.children
      }
    })
  }
  removeEmptyChildren(roots)

  return roots
}

// 处理分类选择变化
const handleCategoryChange = async (value) => {
  if (!value || value.length === 0) {
    categoryId.value = ''
    categoryInfo.value = {
      category_id: '',
      category_name: '',
      full_name: '',
      level: 0
    }
    return
  }

  // 获取选中的分类ID（数组最后一个元素）
  const selectedId = value[value.length - 1]
  categoryId.value = selectedId

  // 加载分类详细信息
  await loadCategoryInfo()
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
  // 验证是否选择了分类
  if (!categoryId.value) {
    ElMessage.warning('请先选择目标分类')
    return
  }

  // 验证是否选择了参数
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

  .category-info-alert {
    margin-bottom: 20px;

    :deep(.el-alert__content) {
      width: 100%;
    }

    .category-info-detail {
      display: flex;
      align-items: center;
      margin-top: 8px;
      font-size: 13px;
      color: #606266;

      .info-label {
        font-weight: 500;
        color: #909399;
      }

      .info-value {
        margin-right: 15px;
        color: #303133;
      }

      .el-divider--vertical {
        margin: 0 10px;
      }
    }
  }

  .category-selector-form {
    margin-bottom: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px dashed #dcdfe6;

    .form-item-tip {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      line-height: 1.5;
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
    }
  }

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

