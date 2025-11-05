<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="700px"
    :before-close="handleClose"
  >
    <el-alert
      :type="auditType === 'approve' ? 'success' : 'warning'"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <template #title>
        <strong>{{ auditType === 'approve' ? '✅ 批量审核通过' : '⚠️ 批量审核拒绝' }}</strong>：已选中 <strong>{{ selectedItems.length }}</strong> 个商品
      </template>
    </el-alert>

    <el-table
      :data="selectedItems"
      border
      max-height="400px"
      style="width: 100%"
    >
      <el-table-column
        prop="product_name"
        label="商品名称"
        width="200"
        show-overflow-tooltip
      />
      <el-table-column
        prop="category_name"
        label="商品分类"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        prop="brand_name"
        label="品牌"
        width="100"
        show-overflow-tooltip
      />
      <el-table-column
        prop="price"
        label="价格"
        width="100"
      >
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column
        prop="audit_status"
        label="当前状态"
        width="100"
      >
        <template #default="{ row }">
          <el-tag :type="getAuditStatusType(row.audit_status)" size="small">
            {{ getAuditStatusText(row.audit_status) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-form
      style="margin-top: 20px"
      label-width="100px"
    >
      <el-form-item :label="auditType === 'approve' ? '审核意见' : '拒绝原因'" :required="auditType === 'reject'">
        <el-input
          v-model="auditReason"
          type="textarea"
          :rows="3"
          :placeholder="auditType === 'approve' ? '审核意见（可选）' : '请输入拒绝原因（必填）'"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button
          :type="auditType === 'approve' ? 'success' : 'danger'"
          :disabled="auditType === 'reject' && !auditReason"
          @click="handleSubmit"
        >
          {{ auditType === 'approve' ? '确认审核通过' : '确认审核拒绝' }}（{{ selectedItems.length }} 个）
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import $curl from '$elpisCommon/curl.js'

const emit = defineEmits(['command'])

const name = ref('batchAuditDialog')
const visible = ref(false)
const selectedItems = ref([])
const auditReason = ref('')
const auditType = ref('approve') // 'approve' 或 'reject'

/**
 * 对话框标题
 */
const dialogTitle = computed(() => {
  return auditType.value === 'approve' ? '批量审核通过' : '批量审核拒绝'
})

/**
 * 获取审核状态文本
 */
const getAuditStatusText = (status) => {
  const statusMap = {
    0: '未审核',
    1: '已审核',
    2: '审核不通过'
  }
  return statusMap[status] || '未知'
}

/**
 * 获取审核状态标签类型
 */
const getAuditStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return typeMap[status] || 'info'
}

/**
 * 显示对话框
 * @param {Array} rowsData - 选中的行数据
 * @param {string} type - 审核类型（'approve' 或 'reject'）
 */
const show = (rowsData, type = 'approve') => {
  if (!rowsData || rowsData.length === 0) {
    ElMessage.warning('请先选择要审核的商品')
    return
  }
  
  // 过滤出未审核的商品
  const pendingItems = rowsData.filter(item => item.audit_status === 0)
  
  if (pendingItems.length === 0) {
    ElMessage.warning('所选商品中没有待审核的商品')
    return
  }
  
  if (pendingItems.length < rowsData.length) {
    ElMessage.info(`已过滤 ${rowsData.length - pendingItems.length} 个已审核的商品`)
  }
  
  visible.value = true
  selectedItems.value = pendingItems
  auditType.value = type
  auditReason.value = ''
}

/**
 * 提交批量审核
 */
const handleSubmit = async () => {
  // 验证拒绝原因
  if (auditType.value === 'reject' && !auditReason.value) {
    ElMessage.error('请输入拒绝原因')
    return
  }
  
  try {
    // 确认操作
    const confirmMessage = auditType.value === 'approve'
      ? `确定要审核通过 ${selectedItems.value.length} 个商品吗？`
      : `确定要拒绝 ${selectedItems.value.length} 个商品吗？`
    
    await ElMessageBox.confirm(
      confirmMessage,
      '批量审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 提取商品 ID 列表
    const productIds = selectedItems.value.map(item => item.product_id)
    
    // 调用批量审核 API
    const apiUrl = auditType.value === 'approve'
      ? '/api/proj/product-audit/batch-approve'
      : '/api/proj/product-audit/batch-reject'
    
    const res = await $curl({
      method: 'post',
      url: apiUrl,
      data: {
        product_ids: productIds,
        audit_reason: auditReason.value
      },
      successMessage: auditType.value === 'approve' ? '批量审核通过成功' : '批量审核拒绝成功',
      errorMessage: auditType.value === 'approve' ? '批量审核通过失败' : '批量审核拒绝失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch audit error:', error)
    }
  }
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  visible.value = false
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
</style>

