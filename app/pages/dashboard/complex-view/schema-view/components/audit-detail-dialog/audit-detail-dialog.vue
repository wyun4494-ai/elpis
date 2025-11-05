<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="900px"
    :before-close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <!-- 商品基本信息 -->
      <el-tab-pane label="商品信息" name="basic">
        <!-- 商品图片 -->
        <div v-if="productDetail.product_images && productDetail.product_images.length > 0" style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 10px;">商品图片：</div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <el-image
              v-for="(img, index) in productDetail.product_images"
              :key="index"
              :src="img"
              :preview-src-list="productDetail.product_images"
              :initial-index="index"
              fit="cover"
              style="width: 100px; height: 100px; border-radius: 4px; cursor: pointer;"
            />
          </div>
        </div>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品名称">
            {{ productDetail.product_name }}
          </el-descriptions-item>
          <el-descriptions-item label="商品分类">
            {{ productDetail.category_name }}
          </el-descriptions-item>
          <el-descriptions-item label="品牌">
            {{ productDetail.brand_name }}
          </el-descriptions-item>
          <el-descriptions-item label="价格">
            ¥{{ productDetail.price }}
          </el-descriptions-item>
          <el-descriptions-item label="货号">
            {{ productDetail.item_number }}
          </el-descriptions-item>
          <el-descriptions-item label="库存">
            {{ productDetail.inventory }}
          </el-descriptions-item>
          <el-descriptions-item label="上架状态">
            <el-tag :type="productDetail.shelf_status === 1 ? 'success' : 'info'">
              {{ productDetail.shelf_status === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getAuditStatusType(productDetail.audit_status)">
              {{ getAuditStatusText(productDetail.audit_status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ productDetail.create_time }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ productDetail.update_time }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 商品详情 -->
        <div v-if="productDetail.product_detail" style="margin-top: 20px;">
          <div style="font-weight: bold; margin-bottom: 10px;">商品详情：</div>
          <!-- 使用 v-html 渲染富文本内容，已使用 DOMPurify 过滤 HTML，防止 XSS 攻击 -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="product-detail-content"
            v-html="sanitizeHtml(productDetail.product_detail)"
          />
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </el-tab-pane>

      <!-- SKU 列表 -->
      <el-tab-pane label="SKU 列表" name="sku">
        <el-table :data="productDetail.skus" border max-height="400px">
          <el-table-column prop="sku_name" label="SKU名称" width="200" show-overflow-tooltip />
          <el-table-column prop="sku_code" label="SKU编码" width="150" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="inventory" label="库存" width="100" />
          <el-table-column prop="stock_alert" label="预警值" width="100" />
          <el-table-column label="SKU属性">
            <template #default="{ row }">
              <el-tag
                v-for="(value, key) in row.sku_attributes"
                :key="key"
                size="small"
                style="margin-right: 5px"
              >
                {{ key }}: {{ value }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 商品参数 -->
      <el-tab-pane label="商品参数" name="params">
        <el-descriptions :column="1" border>
          <el-descriptions-item
            v-for="param in productDetail.params"
            :key="param.param_id"
            :label="param.param_name"
          >
            {{ param.param_value }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- 审核历史 -->
      <el-tab-pane label="审核历史" name="history">
        <el-timeline>
          <el-timeline-item
            v-for="record in auditHistory"
            :key="record.audit_id"
            :timestamp="record.audit_time"
            placement="top"
          >
            <el-card>
              <p>
                <strong>审核人：</strong>{{ record.auditor_name || '未知' }}
              </p>
              <p>
                <strong>审核类型：</strong>
                <el-tag size="small">
                  {{ record.audit_type === 1 ? '新建审核' : '编辑审核' }}
                </el-tag>
              </p>
              <p>
                <strong>审核结果：</strong>
                <el-tag :type="record.audit_status === 1 ? 'success' : 'danger'" size="small">
                  {{ record.audit_status === 1 ? '审核通过' : '审核不通过' }}
                </el-tag>
              </p>
              <p v-if="record.audit_reason">
                <strong>审核意见：</strong>{{ record.audit_reason }}
              </p>
              <!-- 编辑审核的数据对比 -->
              <div v-if="record.audit_type === 2 && record.old_data && record.new_data">
                <el-divider content-position="left">
                  数据变更
                </el-divider>
                <div v-for="(newValue, key) in record.new_data" :key="key">
                  <div v-if="record.old_data[key] !== newValue" style="margin-bottom: 10px">
                    <strong>{{ getFieldLabel(key) }}:</strong>
                    <div style="margin-left: 20px">
                      <div style="color: #67c23a; background-color: #f0f9ff; padding: 5px; border-radius: 4px; margin-bottom: 5px">
                        新值: {{ formatFieldValue(key, newValue) }}
                      </div>
                      <div style="color: #909399; text-decoration: line-through; padding: 5px">
                        旧值: {{ formatFieldValue(key, record.old_data[key]) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-if="auditHistory.length === 0" description="暂无审核历史" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          关闭
        </el-button>
        <el-button
          v-if="showAuditButtons"
          type="danger"
          @click="handleReject"
        >
          审核不通过
        </el-button>
        <el-button
          v-if="showAuditButtons"
          type="success"
          @click="handleApprove"
        >
          审核通过
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import $curl from '$elpisCommon/curl.js'
import DOMPurify from 'dompurify'

const emit = defineEmits(['command'])

const name = ref('auditDetailDialog')
const visible = ref(false)
const activeTab = ref('basic')
const productDetail = ref({
  skus: [],
  params: []
})
const auditHistory = ref([])
const mode = ref('view') // 'view' 或 'audit'

const dialogTitle = computed(() => {
  return mode.value === 'audit' ? '商品审核' : '审核详情'
})

const showAuditButtons = computed(() => {
  return mode.value === 'audit' && productDetail.value.audit_status === 0
})

/**
 * 显示对话框
 * @param {Object} rowData - 行数据
 * @param {string} displayMode - 显示模式（'view' 或 'audit'）
 */
const show = async (rowData, displayMode = 'audit') => {
  if (!rowData || !rowData.product_id) {
    ElMessage.warning('商品数据不完整')
    return
  }

  mode.value = displayMode
  visible.value = true
  activeTab.value = 'basic'

  // 加载商品详情
  await loadProductDetail(rowData.product_id)
  // 加载审核历史
  await loadAuditHistory(rowData.product_id)
}

/**
 * 加载商品详情
 */
const loadProductDetail = async (productId) => {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/product-audit',
      params: { product_id: productId }
    })

    if (res && res.success) {
      productDetail.value = res.data
    }
  } catch (error) {
    console.error('Load product detail error:', error)
    ElMessage.error('加载商品详情失败')
  }
}

/**
 * 加载审核历史
 */
const loadAuditHistory = async (productId) => {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/product-audit/history',
      params: { product_id: productId }
    })

    if (res && res.success) {
      auditHistory.value = res.data
    }
  } catch (error) {
    console.error('Load audit history error:', error)
  }
}

/**
 * 审核通过
 */
const handleApprove = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要审核通过该商品吗？',
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    const res = await $curl({
      method: 'post',
      url: '/api/proj/product-audit/audit',
      data: {
        product_id: productDetail.value.product_id,
        audit_status: 1
      },
      successMessage: '审核通过',
      errorMessage: '审核失败'
    })

    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Approve error:', error)
    }
  }
}

/**
 * 审核不通过
 */
const handleReject = async () => {
  try {
    const { value: auditReason } = await ElMessageBox.prompt(
      '请输入审核不通过的原因',
      '审核不通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputPlaceholder: '请输入不通过原因',
        inputType: 'textarea',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return '请输入不通过原因'
          }
          return true
        }
      }
    )

    const res = await $curl({
      method: 'post',
      url: '/api/proj/product-audit/audit',
      data: {
        product_id: productDetail.value.product_id,
        audit_status: 2,
        audit_reason: auditReason
      },
      successMessage: '审核不通过',
      errorMessage: '审核失败'
    })

    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Reject error:', error)
    }
  }
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  visible.value = false
}

/**
 * 获取审核状态文本
 */
const getAuditStatusText = (status) => {
  const map = {
    0: '未审核',
    1: '已审核',
    2: '审核不通过'
  }
  return map[status] || '未知'
}

/**
 * 获取审核状态类型
 */
const getAuditStatusType = (status) => {
  const map = {
    0: 'info',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}

/**
 * 字段名中文映射
 */
const fieldLabelMap = {
  product_name: '商品名称',
  product_images: '商品图片',
  product_detail: '商品详情',
  category_id: '商品分类',
  category_name: '商品分类',
  brand_id: '品牌',
  brand_name: '品牌',
  price: '价格',
  item_number: '货号',
  inventory: '库存',
  shelf_status: '上架状态',
  audit_status: '审核状态',
  sort_order: '排序',
  status: '状态'
}

/**
 * 获取字段中文名称
 */
const getFieldLabel = (fieldName) => {
  return fieldLabelMap[fieldName] || fieldName
}

/**
 * 格式化字段值
 */
const formatFieldValue = (fieldName, value) => {
  // 上架状态
  if (fieldName === 'shelf_status') {
    return value === 1 ? '已上架' : '已下架'
  }

  // 审核状态
  if (fieldName === 'audit_status') {
    const map = {
      0: '未审核',
      1: '已审核',
      2: '审核不通过'
    }
    return map[value] || value
  }

  // 状态
  if (fieldName === 'status') {
    return value === 1 ? '正常' : '已删除'
  }

  // 价格
  if (fieldName === 'price') {
    return `¥${value}`
  }

  // 图片数组
  if (fieldName === 'product_images' && Array.isArray(value)) {
    return `${value.length} 张图片`
  }

  return value
}

/**
 * 使用 DOMPurify 过滤 HTML 内容，防止 XSS 攻击
 * @param {string} html - 原始 HTML 字符串
 * @returns {string} 过滤后的安全 HTML 字符串
 */
const sanitizeHtml = (html) => {
  if (!html) {
    return '暂无内容'
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'pre'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'style', 'class', 'width', 'height', 'align', 'colspan', 'rowspan'],
    ALLOW_DATA_ATTR: false
  })
}

defineExpose({
  show,
  name
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 商品详情富文本样式 */
.product-detail-content {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  line-height: 1.8;
  color: #606266;
}

.product-detail-content :deep(p) {
  margin: 10px 0;
}

.product-detail-content :deep(h1),
.product-detail-content :deep(h2),
.product-detail-content :deep(h3) {
  margin: 15px 0 10px;
  font-weight: bold;
}

.product-detail-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

.product-detail-content :deep(ul),
.product-detail-content :deep(ol) {
  padding-left: 20px;
  margin: 10px 0;
}

.product-detail-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.product-detail-content :deep(table th),
.product-detail-content :deep(table td) {
  border: 1px solid #dcdfe6;
  padding: 8px;
  text-align: left;
}

.product-detail-content :deep(table th) {
  background-color: #f0f0f0;
  font-weight: bold;
}
</style>

