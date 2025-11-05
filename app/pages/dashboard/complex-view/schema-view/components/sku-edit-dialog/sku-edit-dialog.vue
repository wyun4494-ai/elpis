<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="70%"
    :before-close="handleClose"
  >
    <div class="sku-edit-container">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索SKU编号"
          clearable
          style="width: 300px"
          prefix-icon="Search"
        />
        <span class="info-text">
          商品货号：{{ productInfo.item_number || '-' }}
        </span>
      </div>

      <!-- 库存统计 -->
      <inventory-stats
        :total-inventory="productInfo.inventory"
        :skus="skuList"
      />

      <!-- SKU表格 -->
      <el-table
        :data="filteredSkuList"
        border
        size="small"
        class="sku-table"
        max-height="500"
      >
        <!-- SKU编号 -->
        <el-table-column
          label="SKU编号"
          prop="sku_code"
          width="140"
          show-overflow-tooltip
          fixed
        />

        <!-- 动态属性列 -->
        <el-table-column
          v-for="attrName in attributeNames"
          :key="attrName"
          :label="attrName"
          width="90"
        >
          <template #default="scope">
            {{ getAttrValue(scope.row, attrName) }}
          </template>
        </el-table-column>

        <!-- 销售价格 -->
        <el-table-column
          label="销售价"
          width="110"
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.price"
              :min="0"
              :precision="2"
              :controls="false"
              size="small"
              @change="markAsModified(scope.row.sku_id)"
            />
          </template>
        </el-table-column>

        <!-- 促销价格 -->
        <el-table-column
          label="促销价"
          width="110"
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.promotion_price"
              :min="0"
              :precision="2"
              :controls="false"
              size="small"
              @change="markAsModified(scope.row.sku_id)"
            />
          </template>
        </el-table-column>

        <!-- 商品库存 -->
        <el-table-column
          label="库存"
          width="100"
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.inventory"
              :min="0"
              :controls="false"
              size="small"
              @change="markAsModified(scope.row.sku_id)"
            />
          </template>
        </el-table-column>

        <!-- 库存预警值 -->
        <el-table-column
          label="预警值"
          width="100"
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.stock_alert"
              :min="0"
              :controls="false"
              size="small"
              @change="markAsModified(scope.row.sku_id)"
            />
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column
          label="状态"
          width="80"
        >
          <template #default="scope">
            <div class="status-cell">
              <el-tag
                v-if="modifiedSkuIds.has(scope.row.sku_id)"
                type="warning"
                size="small"
              >
                已改
              </el-tag>
              <span v-else>
                {{ scope.row.stock_status }}
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div class="batch-operations">
        <el-button
          size="small"
          @click="syncPrice"
        >
          同步销售价格
        </el-button>
        <el-button
          size="small"
          @click="syncPromotionPrice"
        >
          同步促销价格
        </el-button>
        <el-button
          size="small"
          @click="syncInventory"
        >
          同步库存
        </el-button>
        <el-button
          size="small"
          @click="syncStockAlert"
        >
          同步预警值
        </el-button>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button
          type="primary"
          :disabled="isInventoryOverLimit"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import $curl from '$elpisCommon/curl.js'
import inventoryStats from '$elpisWidgets/inventory-stats/inventory-stats.vue'

const emit = defineEmits(['command'])

const name = ref('skuEditDialog')
const visible = ref(false)
const searchKeyword = ref('')
const skuList = ref([])
const modifiedSkuIds = ref(new Set())

const productInfo = ref({
  product_id: '',
  product_name: '',
  item_number: ''
})

const dialogTitle = computed(() => {
  return productInfo.value.product_name 
    ? `编辑SKU - ${productInfo.value.product_name}`
    : '编辑SKU'
})

// 过滤后的SKU列表
const filteredSkuList = computed(() => {
  if (!searchKeyword.value) {
    return skuList.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return skuList.value.filter(sku => 
    (sku.sku_code || '').toLowerCase().includes(keyword)
  )
})

// 动态属性名列表
const attributeNames = computed(() => {
  if (skuList.value.length === 0) {
    return []
  }
  
  // 从第一个SKU的attributes中提取属性名
  const firstSku = skuList.value[0]
  if (!firstSku.attributes) {
    return []
  }
  
  try {
    const attrs = typeof firstSku.attributes === 'string' 
      ? JSON.parse(firstSku.attributes)
      : firstSku.attributes
    
    // 过滤掉 attr_xxx 这种内部字段
    return Object.keys(attrs).filter(key => !key.startsWith('attr_'))
  } catch (e) {
    return []
  }
})

// 计算库存是否超限
const isInventoryOverLimit = computed(() => {
  const totalInventory = productInfo.value.inventory || 0
  const allocatedInventory = skuList.value.reduce((sum, sku) => {
    return sum + (parseInt(sku.inventory) || 0)
  }, 0)
  return allocatedInventory > totalInventory
})

// 获取属性值
const getAttrValue = (row, attrName) => {
  if (!row.attributes) {
    return '-'
  }
  
  try {
    const attrs = typeof row.attributes === 'string' 
      ? JSON.parse(row.attributes)
      : row.attributes
    
    return attrs[attrName] || '-'
  } catch (e) {
    return '-'
  }
}

// 标记为已修改
const markAsModified = (skuId) => {
  modifiedSkuIds.value.add(skuId)
}

// 显示对话框
const show = async (rowData) => {
  visible.value = true
  searchKeyword.value = ''
  modifiedSkuIds.value = new Set()
  
  productInfo.value = {
    product_id: rowData.product_id,
    product_name: rowData.product_name,
    item_number: rowData.item_number || '',
    inventory: rowData.inventory || 0
  }
  
  // 加载SKU列表
  await loadSkuList(rowData.product_id)
}

// 加载SKU列表
const loadSkuList = async (productId) => {
  try {
    const res = await $curl({
      method: 'get',
      url: `/api/proj/product/${productId}/skus`
    })
    
    if (res && res.success && Array.isArray(res.data)) {
      skuList.value = res.data.map(sku => ({
        ...sku,
        price: parseFloat(sku.price),
        promotion_price: sku.promotion_price ? parseFloat(sku.promotion_price) : null,
        inventory: parseInt(sku.inventory),
        stock_alert: parseInt(sku.stock_alert)
      }))
    } else {
      skuList.value = []
    }
  } catch (error) {
    console.error('Load SKU list error:', error)
    skuList.value = []
  }
}

// 同步销售价格
const syncPrice = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入统一销售价格', '同步销售价格', {
      inputPattern: /^\d+(\.\d{1,2})?$/,
      inputErrorMessage: '请输入有效的价格'
    })

    const price = parseFloat(value)
    skuList.value.forEach(sku => {
      sku.price = price
      markAsModified(sku.sku_id)
    })
  } catch (error) {
    // 用户取消操作，不做任何处理
  }
}

// 同步促销价格
const syncPromotionPrice = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入统一促销价格', '同步促销价格', {
      inputPattern: /^\d+(\.\d{1,2})?$/,
      inputErrorMessage: '请输入有效的价格'
    })

    const price = parseFloat(value)
    skuList.value.forEach(sku => {
      sku.promotion_price = price
      markAsModified(sku.sku_id)
    })
  } catch (error) {
    // 用户取消操作，不做任何处理
  }
}

// 同步库存
const syncInventory = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入统一库存', '同步库存', {
      inputPattern: /^\d+$/,
      inputErrorMessage: '请输入有效的库存数量'
    })

    const inventory = parseInt(value)
    skuList.value.forEach(sku => {
      sku.inventory = inventory
      markAsModified(sku.sku_id)
    })
  } catch (error) {
    // 用户取消操作，不做任何处理
  }
}

// 同步预警值
const syncStockAlert = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入统一预警值', '同步预警值', {
      inputPattern: /^\d+$/,
      inputErrorMessage: '请输入有效的预警值'
    })

    const stockAlert = parseInt(value)
    skuList.value.forEach(sku => {
      sku.stock_alert = stockAlert
      markAsModified(sku.sku_id)
    })
  } catch (error) {
    // 用户取消操作，不做任何处理
  }
}

// 保存
const handleSave = async () => {
  if (modifiedSkuIds.value.size === 0) {
    ElMessage.warning('没有修改的SKU')
    return
  }
  
  try {
    // 只保存修改过的SKU
    const modifiedSkus = skuList.value.filter(sku => 
      modifiedSkuIds.value.has(sku.sku_id)
    ).map(sku => ({
      sku_id: sku.sku_id,
      price: sku.price,
      promotion_price: sku.promotion_price,
      inventory: sku.inventory,
      stock_alert: sku.stock_alert
    }))
    
    const res = await $curl({
      method: 'put',
      url: `/api/proj/product/${productInfo.value.product_id}/skus`,
      data: {
        skus: modifiedSkus
      },
      successMessage: `成功更新 ${modifiedSkus.length} 个SKU`,
      errorMessage: '保存失败'
    })
    
    if (res && res.success) {
      visible.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    console.error('Save SKUs error:', error)
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
.sku-edit-container {
  .search-bar {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding: 12px 15px;
    background: #f5f7fa;
    border-radius: 4px;
    
    .info-text {
      color: #606266;
      font-size: 13px;
    }
  }
  
  .sku-table {
    margin-bottom: 15px;
    
    :deep(.el-input-number) {
      width: 100%;
      
      .el-input__inner {
        text-align: left;
      }
    }
  }
  
  .batch-operations {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

