<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    size="60%"
    :before-close="handleClose"
  >
    <div class="attribute-list-container">
      <!-- 属性列表 -->
      <div 
        v-for="(attr, index) in attributes" 
        :key="index"
        class="attribute-item"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>属性 {{ index + 1 }}</span>
              <el-button 
                type="danger" 
                size="small"
                text
                @click="removeAttribute(index)"
              >
                删除
              </el-button>
            </div>
          </template>

          <!-- 属性名称 -->
          <el-form-item
            label="属性名称"
            required
          >
            <el-input
              v-model="attr.attr_name"
              placeholder="如：颜色、尺寸、内存"
            />
          </el-form-item>

          <!-- 预定义值 -->
          <el-form-item label="预定义值">
            <div class="predefined-values-container">
              <div class="value-tags">
                <el-tag
                  v-for="(value, vIndex) in attr.predefined_values"
                  :key="vIndex"
                  closable
                  @close="removePreValue(index, vIndex)"
                >
                  {{ value }}
                </el-tag>
              </div>
              <div class="add-value">
                <el-input
                  v-model="attr.newValue"
                  placeholder="输入预定义值"
                  style="width: 200px"
                  size="small"
                  @keyup.enter="addPreValue(index)"
                />
                <el-button 
                  type="primary"
                  size="small"
                  @click="addPreValue(index)"
                >
                  添加
                </el-button>
              </div>
            </div>
          </el-form-item>

          <!-- 允许用户自定义 -->
          <el-form-item label="允许用户自定义">
            <el-switch
              v-model="attr.allow_custom"
              :active-value="1"
              :inactive-value="0"
            />
            <span class="help-text">开启后，用户添加商品时可以输入自定义值</span>
          </el-form-item>

          <!-- 是否必填 -->
          <el-form-item label="是否必填">
            <el-switch
              v-model="attr.is_required"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
        </el-card>
      </div>

      <!-- 添加属性按钮 -->
      <el-button 
        type="primary"
        plain
        class="add-btn"
        @click="addAttribute"
      >
        + 添加属性
      </el-button>
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
          保存属性
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import $curl from '$elpisCommon/curl.js'

const emit = defineEmits(['command'])

const name = ref('attributeConfig')
const visible = ref(false)
const categoryId = ref('')
const categoryName = ref('')
const attributes = ref([])

const drawerTitle = computed(() => {
  return categoryName.value ? `${categoryName.value} - 属性列表` : '属性列表'
})

// 显示抽屉
const show = async (rowData) => {
  visible.value = true
  categoryId.value = rowData.category_id
  categoryName.value = rowData.type_name || rowData.full_name
  
  // 加载现有属性配置
  await loadAttributes()
}

// 加载属性
const loadAttributes = async () => {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/type/by-category',
      params: { category_id: categoryId.value }
    })
    
    if (res && res.success && res.data && res.data.attributes) {
      attributes.value = res.data.attributes.map(attr => ({
        ...attr,
        newValue: ''
      }))
    } else {
      attributes.value = []
    }
  } catch (error) {
    console.error('Load attributes error:', error)
    attributes.value = []
  }
}

// 添加属性
const addAttribute = () => {
  attributes.value.push({
    attr_name: '',
    predefined_values: [],
    allow_custom: 1,
    is_required: 1,
    sort_order: attributes.value.length,
    newValue: ''
  })
}

// 删除属性
const removeAttribute = (index) => {
  attributes.value.splice(index, 1)
}

// 添加预定义值
const addPreValue = (index) => {
  const attr = attributes.value[index]
  if (attr.newValue && attr.newValue.trim()) {
    if (!attr.predefined_values) {
      attr.predefined_values = []
    }
    if (attr.predefined_values.includes(attr.newValue.trim())) {
      ElMessage.warning('该值已存在')
      return
    }
    attr.predefined_values.push(attr.newValue.trim())
    attr.newValue = ''
  }
}

// 删除预定义值
const removePreValue = (attrIndex, valueIndex) => {
  attributes.value[attrIndex].predefined_values.splice(valueIndex, 1)
}

// 保存
const handleSave = async () => {
  // 验证
  for (let i = 0; i < attributes.value.length; i++) {
    const attr = attributes.value[i]
    if (!attr.attr_name || !attr.attr_name.trim()) {
      ElMessage.error(`属性${i + 1}：属性名称不能为空`)
      return
    }
  }
  
  try {
    const saveData = attributes.value.map((attr, index) => ({
      attr_name: attr.attr_name,
      predefined_values: attr.predefined_values || [],
      allow_custom: attr.allow_custom,
      is_required: attr.is_required,
      sort_order: index
    }))
    
    const res = await $curl({
      method: 'post',
      url: '/api/proj/type/attributes',
      data: {
        category_id: categoryId.value,
        attributes: saveData
      },
      successMessage: '保存成功',
      errorMessage: '保存失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    console.error('Save attributes error:', error)
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
.attribute-list-container {
  padding: 20px;
  
  .attribute-item {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    .el-form-item {
      margin-bottom: 18px;
    }

    .predefined-values-container {
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
    
    .help-text {
      margin-left: 10px;
      font-size: 12px;
      color: #999;
    }
  }

  .add-btn {
    width: 100%;
    margin-top: 10px;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

