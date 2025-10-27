<template>
  <el-dialog
    v-model="visible"
    title="库存补货"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="120px"
    >
      <el-form-item label="商品名称">
        <el-input
          :model-value="productInfo.product_name"
          disabled
        />
      </el-form-item>

      <el-form-item label="SKU">
        <el-input
          :model-value="productInfo.sku_name"
          disabled
        />
      </el-form-item>

      <el-form-item label="当前库存">
        <el-input-number
          :model-value="productInfo.inventory"
          disabled
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="预警值">
        <el-input-number
          :model-value="productInfo.stock_alert"
          disabled
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item
        label="补货数量"
        required
      >
        <el-input-number
          v-model="formData.restock_quantity"
          :min="1"
          :max="99999"
          placeholder="请输入补货数量"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="补货后库存">
        <el-tag
          type="success"
          size="large"
        >
          {{ (productInfo.inventory || 0) + (formData.restock_quantity || 0) }}
        </el-tag>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.note"
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
          @click="handleSubmit"
        >
          确认补货
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import $curl from '$elpisCommon/curl.js'

const emit = defineEmits(['command'])

const name = ref('restockDialog')
const visible = ref(false)
const formRef = ref(null)

const productInfo = ref({
  product_name: '',
  sku_name: '',
  sku_id: '',
  inventory: 0,
  stock_alert: 50
})

const formData = ref({
  restock_quantity: 0,
  note: ''
})

// 显示对话框
const show = (rowData) => {
  visible.value = true
  
  productInfo.value = {
    product_name: rowData.product_name || '',
    sku_name: rowData.sku_name || '',
    sku_id: rowData.sku_id || '',
    inventory: rowData.inventory || 0,
    stock_alert: rowData.stock_alert || 50
  }
  
  formData.value = {
    restock_quantity: 0,
    note: ''
  }
}

// 提交补货
const handleSubmit = async () => {
  if (!formData.value.restock_quantity || formData.value.restock_quantity <= 0) {
    ElMessage.error('请输入补货数量')
    return
  }
  
  try {
    const res = await $curl({
      method: 'post',
      url: '/api/proj/stock-alert/restock',
      data: {
        sku_id: productInfo.value.sku_id,
        restock_quantity: formData.value.restock_quantity,
        note: formData.value.note
      },
      successMessage: '补货成功',
      errorMessage: '补货失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    console.error('Restock error:', error)
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

