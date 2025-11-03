<template>
  <el-dialog
    v-model="visible"
    title="批量永久删除商品"
    width="700px"
    :before-close="handleClose"
  >
    <el-alert
      type="error"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <template #title>
        <strong>⚠️ 警告：</strong>已选中 <strong>{{ selectedItems.length }}</strong> 个商品，永久删除后将无法恢复！
      </template>
    </el-alert>

    <el-table
      :data="selectedItems"
      border
      max-height="400px"
      style="width: 100%"
    >
      <el-table-column
        prop="product_id"
        label="商品编号"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="product_name"
        label="商品名称"
        width="200"
        show-overflow-tooltip
      />
      <el-table-column
        prop="delete_time"
        label="删除时间"
        width="180"
      />
      <el-table-column
        prop="delete_reason"
        label="删除原因"
        show-overflow-tooltip
      />
    </el-table>

    <el-form
      style="margin-top: 20px"
      label-width="120px"
    >
      <el-form-item
        label="确认删除"
        required
      >
        <el-input
          v-model="confirmText"
          placeholder="请输入 '确认永久删除' 以继续"
        />
        <div style="color: #909399; font-size: 12px; margin-top: 5px">
          为防止误操作，请输入"确认永久删除"以继续
        </div>
      </el-form-item>

      <el-form-item label="删除备注">
        <el-input
          v-model="note"
          type="textarea"
          :rows="3"
          placeholder="永久删除备注（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button
          type="danger"
          :disabled="!isConfirmValid"
          @click="handleSubmit"
        >
          永久删除（{{ selectedItems.length }} 个）
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

const name = ref('batchPermanentDeleteDialog')
const visible = ref(false)
const selectedItems = ref([])
const confirmText = ref('')
const note = ref('')

/**
 * 验证确认文本是否正确
 */
const isConfirmValid = computed(() => {
  return confirmText.value === '确认永久删除'
})

/**
 * 显示对话框
 * @param {Array} rowsData - 选中的行数据
 */
const show = (rowsData) => {
  if (!rowsData || rowsData.length === 0) {
    ElMessage.warning('请先选择要永久删除的商品')
    return
  }
  
  visible.value = true
  selectedItems.value = rowsData
  confirmText.value = ''
  note.value = ''
}

/**
 * 提交批量永久删除
 */
const handleSubmit = async () => {
  // 验证确认文本
  if (!isConfirmValid.value) {
    ElMessage.error('请输入"确认永久删除"以继续')
    return
  }
  
  try {
    // 二次确认
    await ElMessageBox.confirm(
      `您即将永久删除 ${selectedItems.value.length} 个商品，此操作不可恢复！确定要继续吗？`,
      '永久删除最终确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true
      }
    )
    
    // 提取商品 ID 列表
    const productIds = selectedItems.value.map(item => item.product_id)
    
    // 调用批量永久删除 API
    const res = await $curl({
      method: 'post',
      url: '/api/proj/product/batch-permanent-delete',
      data: {
        product_ids: productIds,
        note: note.value
      },
      successMessage: '批量永久删除成功',
      errorMessage: '批量永久删除失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch permanent delete error:', error)
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

<style lang="less" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

