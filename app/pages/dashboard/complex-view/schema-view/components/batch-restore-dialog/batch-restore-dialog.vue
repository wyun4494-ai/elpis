<template>
  <el-dialog
    v-model="visible"
    title="批量恢复商品"
    width="700px"
    :before-close="handleClose"
  >
    <el-alert
      type="warning"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <template #title>
        已选中 <strong>{{ selectedItems.length }}</strong> 个商品，确定要恢复这些商品吗？
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
      label-width="100px"
    >
      <el-form-item label="恢复备注">
        <el-input
          v-model="note"
          type="textarea"
          :rows="3"
          placeholder="恢复备注（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button
          type="success"
          @click="handleSubmit"
        >
          确认恢复（{{ selectedItems.length }} 个）
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import $curl from '$elpisCommon/curl.js'

const emit = defineEmits(['command'])

const name = ref('batchRestoreDialog')
const visible = ref(false)
const selectedItems = ref([])
const note = ref('')

/**
 * 显示对话框
 * @param {Array} rowsData - 选中的行数据
 */
const show = (rowsData) => {
  if (!rowsData || rowsData.length === 0) {
    ElMessage.warning('请先选择要恢复的商品')
    return
  }
  
  visible.value = true
  selectedItems.value = rowsData
  note.value = ''
}

/**
 * 提交批量恢复
 */
const handleSubmit = async () => {
  try {
    // 确认操作
    await ElMessageBox.confirm(
      `确定要恢复 ${selectedItems.value.length} 个商品吗？恢复后商品将重新上架。`,
      '批量恢复确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 提取商品 ID 列表
    const productIds = selectedItems.value.map(item => item.product_id)
    
    // 调用批量恢复 API
    const res = await $curl({
      method: 'post',
      url: '/api/proj/product/batch-restore',
      data: {
        product_ids: productIds,
        note: note.value
      },
      successMessage: '批量恢复成功',
      errorMessage: '批量恢复失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch restore error:', error)
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

