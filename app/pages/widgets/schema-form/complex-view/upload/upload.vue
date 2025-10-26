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
      <el-upload
        :file-list="fileList"
        class="component upload-component"
        :class="validTips ? 'valid-border' : ''"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :limit="schema.option?.limit || 1"
        :accept="schema.option?.accept || 'image/*'"
        :disabled="schema.option?.disabled"
        list-type="picture-card"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :on-preview="handlePreview"
        :before-upload="beforeUpload"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
      
      <!-- 图片预览对话框 -->
      <el-dialog
        v-model="dialogVisible"
        title="图片预览"
      >
        <img
          :src="dialogImageUrl"
          alt="预览图片"
          style="width: 100%"
        >
      </el-dialog>
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
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
    type: [String, Array, Object],
    default: undefined
  }
})

const { schema, schemaKey } = props
const { model } = toRefs(props)

const name = ref('upload')
const fileList = ref([])
const dotValue = ref('')
const validTips = ref('')
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

// 上传地址（暂时使用模拟地址，实际需要后端上传接口）
const uploadUrl = computed(() => {
  return schema.option?.uploadUrl || '/api/upload/image'
})

// 上传请求头
const uploadHeaders = computed(() => {
  return {
    'proj_key': localStorage.getItem('proj_key') || '',
    ...schema.option?.headers
  }
})

// 初始化数据
const initData = () => {
  validTips.value = ''
  
  // 如果有初始值，转换为文件列表格式
  if (model.value) {
    if (typeof model.value === 'string') {
      // 单个URL
      fileList.value = model.value ? [{
        name: 'image',
        url: model.value
      }] : []
      dotValue.value = model.value
    } else if (Array.isArray(model.value)) {
      // 多个URL
      fileList.value = model.value.map((url, index) => ({
        name: `image_${index}`,
        url: url
      }))
      dotValue.value = model.value[0] || ''
    }
  } else if (schema.option?.default !== undefined) {
    dotValue.value = schema.option.default
  } else {
    dotValue.value = ''
    fileList.value = []
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

// 上传成功回调
const handleSuccess = (response, file, fileListData) => {
  if (response && response.success && response.data) {
    // 假设后端返回 { success: true, data: 'http://xxx/image.jpg' }
    dotValue.value = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
  validate()
}

// 上传失败回调
const handleError = (error) => {
  console.error('Upload error:', error)
  ElMessage.error('上传失败，请重试')
}

// 移除图片
const handleRemove = (file, fileListData) => {
  dotValue.value = ''
  fileList.value = []
}

// 预览图片
const handlePreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

// 上传前校验
const beforeUpload = (file) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  // 检查文件大小（默认500KB）
  const maxSize = schema.option?.maxSize || 500
  const isLtMaxSize = file.size / 1024 < maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${maxSize}KB!`)
    return false
  }
  
  return true
}

// 获取表单值
const getValue = () => {
  return dotValue.value ? {
    [schemaKey]: dotValue.value
  } : {}
}

// 表单校验
const validate = () => {
  validTips.value = ''
  
  if (schema.option?.required && !dotValue.value) {
    validTips.value = '请上传图片'
    return false
  }
  
  return true
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
    .upload-component {
      :deep(.el-upload-list--picture-card) {
        display: flex;
        flex-wrap: wrap;
      }
      
      :deep(.el-upload--picture-card) {
        width: 148px;
        height: 148px;
      }
      
      :deep(.el-upload-list__item) {
        width: 148px;
        height: 148px;
      }
      
      &.valid-border {
        :deep(.el-upload--picture-card) {
          border-color: #f56c6c;
        }
      }
    }
  }
}
</style>

