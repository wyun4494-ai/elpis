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

/**
 * 图片上传组件
 * 支持单图/多图上传，支持图片预览和删除
 *
 * 核心功能：
 * - 支持单图/多图上传（通过 limit 配置）
 * - 支持拖拽上传
 * - 支持图片预览（点击放大）
 * - 支持文件类型和大小校验
 * - 支持数据回显（编辑模式）
 * - 支持必填校验
 *
 * 使用场景：
 * - 品牌 Logo 上传
 * - 商品主图上传
 * - 商品详情图上传（多图）
 * - SKU 图片上传
 *
 * @component Upload
 */
<script setup>
import { ref, toRefs, watch, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @required
   * @example
   * {
   *   label: '品牌Logo',
   *   option: {
   *     uploadUrl: '/api/upload/brand-logo',
   *     accept: 'image/*',
   *     limit: 1,
   *     maxSize: 500,
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
   * 图片 URL（用于数据回显）
   * @type {string|Array|Object}
   * @example
   * 单图：'http://xxx/image.jpg'
   * 多图：['http://xxx/image1.jpg', 'http://xxx/image2.jpg']
   * 逗号分隔：'http://xxx/image1.jpg,http://xxx/image2.jpg'
   */
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

/**
 * 是否为多图模式
 * @type {ComputedRef<boolean>}
 */
const isMultiple = computed(() => (schema.option?.limit || 1) > 1)

/**
 * 上传地址
 * @type {ComputedRef<string>}
 */
const uploadUrl = computed(() => {
  return schema.option?.uploadUrl || '/api/upload/image'
})

/**
 * 上传请求头
 * @type {ComputedRef<Object>}
 */
const uploadHeaders = computed(() => {
  return {
    'proj_key': localStorage.getItem('proj_key') || '',
    ...schema.option?.headers
  }
})

/**
 * 初始化数据
 * 从 model 中加载图片 URL，转换为文件列表格式用于回显
 *
 * 支持的数据格式：
 * - 单个 URL 字符串：'http://xxx/image.jpg'
 * - 逗号分隔字符串：'http://xxx/image1.jpg,http://xxx/image2.jpg'
 * - URL 数组：['http://xxx/image1.jpg', 'http://xxx/image2.jpg']
 */
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

/**
 * 组件挂载时初始化数据
 */
onMounted(() => {
  initData()
})

/**
 * 监听 model 变化，重新初始化数据
 * 注意：只在 model 真正变化时才重新初始化，避免覆盖用户上传的图片
 */
watch(model, (newVal, oldVal) => {
  // 只有当 model 真正变化时才重新初始化
  // 避免在用户上传图片后被重置
  if (newVal !== oldVal) {
    initData()
  }
}, {
  deep: true,
  immediate: false
})

/**
 * 上传成功回调
 *
 * 处理流程：
 * 1. 从后端响应中提取图片 URL
 * 2. 更新文件列表
 * 3. 直接设置 dotValue（不依赖 fileList 的 url 字段）
 * 4. 触发校验
 *
 * @param {Object} response - 后端响应 { success: true, data: { url: 'http://xxx/image.jpg' } }
 * @param {Object} file - 上传的文件对象
 * @param {Array} fileListData - Element Plus 传入的文件列表
 */
const handleSuccess = (response, file, fileListData) => {
  if (response && response.success && response.data) {
    // 后端返回 { success: true, data: { url: 'http://xxx/image.jpg' } }
    const url = typeof response.data === 'string' ? response.data : response.data.url

    // 使用 Element Plus 传入的 fileListData 来更新 fileList
    fileList.value = fileListData

    // 直接设置 dotValue，不依赖 fileList 的 url 字段
    // 因为 Element Plus 的 fileList 在上传成功时可能还没有更新 url
    if (isMultiple.value) {
      // 多图模式：从 fileListData 中提取所有 URL
      const urls = fileListData.map(f => f.url || f.response?.data || '').filter(u => u)
      dotValue.value = urls
    } else {
      // 单图模式：直接使用当前上传的 URL
      dotValue.value = url
    }
    
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

/**
 * 上传失败回调
 * @param {Error} error - 错误对象
 */
const handleError = (error) => {
  console.error('Upload error:', error)
  ElMessage.error('上传失败，请重试')
}

/**
 * 移除图片回调
 * @param {Object} file - 被移除的文件对象
 * @param {Array} fileListData - 文件列表
 */
const handleRemove = (file, fileListData) => {
  updateDotValue()
}

/**
 * 更新表单值（根据当前文件列表）
 * 单图模式返回字符串，多图模式返回数组
 */
const updateDotValue = () => {
  const urls = fileList.value.map(f => f.url).filter(url => url)

  if (isMultiple.value) {
    dotValue.value = urls
  } else {
    dotValue.value = urls[0] || ''
  }
}

/**
 * 预览图片
 * 点击图片时放大显示
 *
 * @param {Object} file - 文件对象
 */
const handlePreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

/**
 * 上传前校验
 *
 * 校验规则：
 * 1. 文件类型必须为图片
 * 2. 文件大小不能超过限制（默认 500KB）
 *
 * @param {File} file - 待上传的文件
 * @returns {boolean} 校验结果
 */
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

/**
 * 获取表单值
 * 单图模式返回字符串，多图模式返回数组
 *
 * @returns {Object} 表单值对象
 */
const getValue = () => {
  // 多图模式返回数组，单图模式返回字符串
  let value = isMultiple.value ? dotValue.value : dotValue.value

  // 如果值为空（空字符串或空数组），返回 undefined，这样后端不会更新该字段
  // 这样可以保留数据库中已有的图片 URL
  if (isMultiple.value) {
    // 多图模式：空数组返回 undefined
    if (!value || value.length === 0) {
      value = undefined
    }
  } else {
    // 单图模式：空字符串返回 undefined
    if (!value || value === '') {
      value = undefined
    }
  }

  return {
    [schemaKey]: value
  }
}

/**
 * 表单校验
 * 如果必填，检查是否已上传图片
 *
 * @returns {boolean} 校验结果
 */
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

/**
 * 暴露给父组件的方法
 * - getValue: 获取图片 URL
 * - validate: 校验图片
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

