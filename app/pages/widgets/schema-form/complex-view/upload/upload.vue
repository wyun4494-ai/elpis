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
        drag
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
const isMultiple = computed(() => (schema.option?.limit || 1) > 1)

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
      // 单个URL或逗号分隔的字符串
      if (model.value.includes(',')) {
        const urls = model.value.split(',').filter(url => url.trim())
        fileList.value = urls.map((url, index) => ({
          name: `image_${index}`,
          url: url.trim(),
          uid: Date.now() + index
        }))
        dotValue.value = urls
      } else {
        fileList.value = model.value ? [{
          name: 'image',
          url: model.value,
          uid: Date.now()
        }] : []
        dotValue.value = model.value
      }
    } else if (Array.isArray(model.value)) {
      // 数组格式
      fileList.value = model.value.map((url, index) => ({
        name: `image_${index}`,
        url: url,
        uid: Date.now() + index
      }))
      dotValue.value = model.value
    }
  } else if (schema.option?.default !== undefined) {
    dotValue.value = schema.option.default
  } else {
    dotValue.value = isMultiple.value ? [] : ''
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
    // 后端返回 { success: true, data: { url: 'http://xxx/image.jpg' } }
    const url = typeof response.data === 'string' ? response.data : response.data.url
    
    // 更新文件的url
    const fileIndex = fileList.value.findIndex(f => f.uid === file.uid)
    if (fileIndex !== -1) {
      fileList.value[fileIndex].url = url
    }
    
    // 更新dotValue
    updateDotValue()
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
    // 上传失败，移除该文件
    const fileIndex = fileList.value.findIndex(f => f.uid === file.uid)
    if (fileIndex !== -1) {
      fileList.value.splice(fileIndex, 1)
    }
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
  updateDotValue()
}

// 更新dotValue（根据当前fileList）
const updateDotValue = () => {
  const urls = fileList.value.map(f => f.url).filter(url => url)
  
  if (isMultiple.value) {
    dotValue.value = urls
  } else {
    dotValue.value = urls[0] || ''
  }
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
  
  // 检查文件大小（默认500KB，单位KB）
  const maxSize = schema.option?.maxSize || 500
  const fileSizeKB = file.size / 1024
  if (fileSizeKB > maxSize) {
    ElMessage.error(`图片大小不能超过 ${maxSize >= 1024 ? (maxSize/1024).toFixed(0) + 'MB' : maxSize + 'KB'}!`)
    return false
  }
  
  return true
}

// 获取表单值
const getValue = () => {
  if (!dotValue.value) return {}
  
  // 多图模式返回数组，单图模式返回字符串
  const value = isMultiple.value ? dotValue.value : dotValue.value
  
  return value ? {
    [schemaKey]: value
  } : {}
}

// 表单校验
const validate = () => {
  validTips.value = ''
  
  if (schema.option?.required) {
    if (isMultiple.value) {
      if (!dotValue.value || dotValue.value.length === 0) {
        validTips.value = '请上传图片'
        return false
      }
    } else {
      if (!dotValue.value) {
        validTips.value = '请上传图片'
        return false
      }
    }
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

