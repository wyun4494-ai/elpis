<template>
  <el-dialog
    v-model="visible"
    title="批量库存补货"
    width="700px"
    :before-close="handleClose"
  >
    <el-alert
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <template #title>
        已选中 <strong>{{ selectedItems.length }}</strong> 个 SKU，请为每个 SKU 设置补货数量
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
        width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="sku_name"
        label="SKU"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        prop="inventory"
        label="当前库存"
        width="100"
        align="center"
      />
      <el-table-column
        label="补货数量"
        width="150"
      >
        <template #default="scope">
          <el-input-number
            v-model="scope.row.restock_quantity"
            :min="0"
            :max="99999"
            size="small"
            style="width: 100%"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="补货后库存"
        width="120"
        align="center"
      >
        <template #default="scope">
          <el-tag
            :type="getTagType(scope.row)"
            size="small"
          >
            {{ (scope.row.inventory || 0) + (scope.row.restock_quantity || 0) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-form
      style="margin-top: 20px"
      label-width="100px"
    >
      <el-form-item label="统一补货数量">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-input-number
              v-model="batchQuantity"
              :min="0"
              :max="99999"
              placeholder="输入数量"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="12">
            <el-button
              type="primary"
              @click="applyBatchQuantity"
            >
              应用到所有
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="补货备注">
        <el-input
          v-model="note"
          type="textarea"
          :rows="3"
          placeholder="补货备注（可选）"
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
          :disabled="!hasValidQuantity"
          @click="handleSubmit"
        >
          确认补货（{{ validCount }} 个）
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

const name = ref('batchRestockDialog')
const visible = ref(false)
const selectedItems = ref([])
const batchQuantity = ref(0)
const note = ref('')

/**
 * 计算有效的补货数量
 */
const validCount = computed(() => {
  return selectedItems.value.filter(item => item.restock_quantity > 0).length
})

/**
 * 是否有有效的补货数量
 */
const hasValidQuantity = computed(() => {
  return validCount.value > 0
})

/**
 * 获取标签类型（根据补货后库存和预警值）
 */
const getTagType = (row) => {
  const afterStock = (row.inventory || 0) + (row.restock_quantity || 0)
  const stockAlert = row.stock_alert || 50
  
  if (afterStock >= stockAlert) {
    return 'success'
  } else if (afterStock >= stockAlert * 0.5) {
    return 'warning'
  } else {
    return 'danger'
  }
}

/**
 * 应用统一补货数量到所有 SKU
 */
const applyBatchQuantity = () => {
  if (!batchQuantity.value || batchQuantity.value <= 0) {
    ElMessage.warning('请输入有效的补货数量')
    return
  }
  
  selectedItems.value.forEach(item => {
    item.restock_quantity = batchQuantity.value
  })
  
  ElMessage.success(`已将补货数量 ${batchQuantity.value} 应用到所有 SKU`)
}

/**
 * 显示对话框
 */
const show = (rowsData) => {
  if (!rowsData || rowsData.length === 0) {
    ElMessage.warning('请先选择要补货的 SKU')
    return
  }
  
  visible.value = true
  
  // 初始化选中的数据，添加 restock_quantity 字段
  selectedItems.value = rowsData.map(row => ({
    ...row,
    restock_quantity: 0
  }))
  
  batchQuantity.value = 0
  note.value = ''
}

/**
 * 提交批量补货
 */
const handleSubmit = async () => {
  // 过滤出补货数量大于 0 的 SKU
  const restockList = selectedItems.value
    .filter(item => item.restock_quantity > 0)
    .map(item => ({
      sku_id: item.sku_id,
      restock_quantity: item.restock_quantity
    }))
  
  if (restockList.length === 0) {
    ElMessage.warning('请至少为一个 SKU 设置补货数量')
    return
  }
  
  try {
    // 确认操作
    await ElMessageBox.confirm(
      `确定要为 ${restockList.length} 个 SKU 补货吗？`,
      '批量补货确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用批量补货 API
    const res = await $curl({
      method: 'post',
      url: '/api/proj/stock-alert/batch-restock',
      data: {
        restock_list: restockList,
        note: note.value
      },
      successMessage: '批量补货成功',
      errorMessage: '批量补货失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch restock error:', error)
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

