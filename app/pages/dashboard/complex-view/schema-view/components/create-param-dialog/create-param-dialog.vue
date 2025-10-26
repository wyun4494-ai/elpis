<template>
  <el-dialog
    v-model="visible"
    title="新建参数"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="100px"
    >
      <el-form-item
        label="参数名称"
        required
      >
        <el-input
          v-model="formData.param_name"
          placeholder="请输入参数名称"
        />
      </el-form-item>

      <el-form-item label="参数分类">
        <el-select
          v-model="formData.param_category"
          placeholder="请选择参数分类"
        >
          <el-option label="基本参数" value="基本参数" />
          <el-option label="服装参数" value="服装参数" />
          <el-option label="数码参数" value="数码参数" />
          <el-option label="家电参数" value="家电参数" />
          <el-option label="通用参数" value="通用参数" />
          <el-option label="自定义参数" value="自定义参数" />
        </el-select>
      </el-form-item>

      <el-form-item label="参数类型">
        <el-radio-group v-model="formData.param_type">
          <el-radio value="input">
            输入框
          </el-radio>
          <el-radio value="select">
            下拉框
          </el-radio>
          <el-radio value="checkbox">
            多选框
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="formData.param_type === 'select' || formData.param_type === 'checkbox'"
        label="预定义值"
      >
        <div class="tag-input-area">
          <div class="tags-list">
            <el-tag
              v-for="(value, index) in formData.param_values"
              :key="index"
              closable
              @close="removeValue(index)"
            >
              {{ value }}
            </el-tag>
          </div>
          <div class="input-row">
            <el-input
              v-model="inputValue"
              placeholder="输入后回车添加"
              @keyup.enter="addValue"
            />
            <el-button
              size="small"
              type="primary"
              @click="addValue"
            >
              添加
            </el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="是否必填">
        <el-switch
          v-model="formData.is_required"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>

      <el-form-item label="允许自定义">
        <el-switch
          v-model="formData.allow_custom"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import $curl from '$elpisCommon/curl.js'

const route = useRoute()

const emit = defineEmits(['command'])

const name = ref('createParam')
const visible = ref(false)
const formRef = ref(null)
const inputValue = ref('')

const formData = ref({
  param_name: '',
  param_type: 'input',
  param_category: '自定义参数',
  param_values: [],
  is_required: 0,
  allow_custom: 1
})

// 显示对话框
const show = (rowData) => {
  visible.value = true
  formData.value = {
    param_name: '',
    param_type: 'input',
    param_category: '自定义参数',
    param_values: [],
    is_required: 0,
    allow_custom: 1,
    category_id: rowData?.category_id || route.query.category_id || ''
  }
  inputValue.value = ''
}

// 添加值
const addValue = () => {
  const value = inputValue.value.trim()
  
  if (!value) {
    return
  }
  
  if (formData.value.param_values.includes(value)) {
    ElMessage.warning('该值已存在')
    return
  }
  
  formData.value.param_values.push(value)
  inputValue.value = ''
}

// 删除值
const removeValue = (index) => {
  formData.value.param_values.splice(index, 1)
}

// 保存
const handleSave = async () => {
  if (!formData.value.param_name || !formData.value.param_name.trim()) {
    ElMessage.error('请输入参数名称')
    return
  }
  
  if (!formData.value.category_id) {
    ElMessage.error('缺少类型ID')
    return
  }
  
  try {
    const res = await $curl({
      method: 'post',
      url: '/api/proj/category-param/create-new',
      data: formData.value,
      successMessage: '创建成功',
      errorMessage: '创建失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    console.error('Create param error:', error)
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
    gap: 12px;
    
    .el-checkbox {
      margin: 0;
      padding: 10px;
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
  
  .tag-input-area {
    width: 100%;
    
    .tags-list {
      margin-bottom: 10px;
      min-height: 32px;
      
      .el-tag {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
    
    .input-row {
      display: flex;
      gap: 10px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

