<template>
  <div class="sku-generator">
    <!-- 属性选择区域 -->
    <div class="attribute-selector">
      <div 
        v-for="attr in attributes" 
        :key="attr.attr_id"
        class="attribute-group"
      >
        <div class="attribute-label">{{ attr.attr_name }}：</div>
        
        <div class="attribute-values-container">
          <!-- 预定义值（checkbox）-->
          <div v-if="attr.predefined_values && attr.predefined_values.length > 0" class="predefined-values">
            <div class="section-title">预定义：</div>
            <el-checkbox-group
              v-model="selectedAttrValues[attr.attr_id]"
              @change="onAttrChange"
            >
              <el-checkbox 
                v-for="value in attr.predefined_values"
                :key="value"
                :label="value"
              >
                {{ value }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          
          <!-- 自定义值（如果允许） -->
          <div v-if="attr.allow_custom" class="custom-values">
            <div class="section-title">自定义：</div>
            <div class="custom-input">
              <el-tag
                v-for="(value, index) in customAttrValues[attr.attr_id]"
                :key="index"
                closable
                @close="removeCustomValue(attr.attr_id, index)"
              >
                {{ value }}
              </el-tag>
              <el-input
                v-model="inputValues[attr.attr_id]"
                placeholder="输入后回车或点击增加"
                style="width: 150px"
                size="small"
                @keyup.enter="addCustomValue(attr.attr_id)"
              />
              <el-button 
                size="small" 
                type="primary"
                @click="addCustomValue(attr.attr_id)"
              >
                增加
              </el-button>
            </div>
          </div>
          
          <!-- 已选值预览 -->
          <div v-if="getAllSelectedValues(attr.attr_id).length > 0" class="selected-preview">
            <div class="section-title">已选：</div>
            <div class="selected-tags">
              <el-tag
                v-for="value in getAllSelectedValues(attr.attr_id)"
                :key="value"
                size="small"
              >
                {{ value }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SKU列表 -->
    <el-divider content-position="left">SKU列表 ({{ skuList.length }})</el-divider>
    
    <el-table 
      v-if="skuList.length > 0"
      :data="skuList" 
      border
      class="sku-table"
    >
      <!-- 属性列（动态生成） -->
      <el-table-column
        v-for="attr in attributes"
        :key="attr.attr_id"
        :label="attr.attr_name"
        :prop="'attr_' + attr.attr_id"
        width="100"
      />
      
      <el-table-column label="销售价格" width="120">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.price"
            :min="0"
            :precision="2"
            size="small"
            @change="onSkuChange"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="促销价格" width="120">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.promotion_price"
            :min="0"
            :precision="2"
            size="small"
            @change="onSkuChange"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="商品库存" width="120">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.inventory"
            :min="0"
            size="small"
            @change="onSkuChange"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="库存预警值" width="120">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.stock_alert"
            :min="0"
            size="small"
            @change="onSkuChange"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="SKU编号" width="180">
        <template #default="scope">
          <el-input
            v-model="scope.row.sku_code"
            size="small"
            placeholder="自动生成"
            disabled
          />
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="请选择商品规格" :image-size="100" />

    <!-- 批量操作 -->
    <div v-if="skuList.length > 0" class="batch-operations">
      <el-button size="small" @click="syncPrice">同步价格</el-button>
      <el-button size="small" @click="syncInventory">同步库存</el-button>
      <el-button size="small" @click="syncStockAlert">同步预警值</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  attributes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change'])

const selectedAttrValues = ref({})  // 预定义值中选中的
const customAttrValues = ref({})  // 用户自定义的值
const inputValues = ref({})  // 输入框的值
const skuList = ref([])  // SKU列表

// 初始化
watch(() => props.attributes, (newAttrs) => {
  if (newAttrs && newAttrs.length > 0) {
    newAttrs.forEach(attr => {
      if (!selectedAttrValues.value[attr.attr_id]) {
        selectedAttrValues.value[attr.attr_id] = []
      }
      if (!customAttrValues.value[attr.attr_id]) {
        customAttrValues.value[attr.attr_id] = []
      }
      if (!inputValues.value[attr.attr_id]) {
        inputValues.value[attr.attr_id] = ''
      }
    })
  }
}, { immediate: true, deep: true })

// 获取某个属性的所有已选值（预定义 + 自定义）
const getAllSelectedValues = (attrId) => {
  const predefined = selectedAttrValues.value[attrId] || []
  const custom = customAttrValues.value[attrId] || []
  return [...predefined, ...custom]
}

// 添加自定义值
const addCustomValue = (attrId) => {
  const value = inputValues.value[attrId]
  if (!value || !value.trim()) {
    return
  }
  
  if (!customAttrValues.value[attrId]) {
    customAttrValues.value[attrId] = []
  }
  
  // 检查是否重复（包括预定义值和自定义值）
  const allValues = getAllSelectedValues(attrId)
  if (allValues.includes(value.trim())) {
    ElMessage.warning('该值已存在')
    return
  }
  
  customAttrValues.value[attrId].push(value.trim())
  inputValues.value[attrId] = ''
  
  generateSku()
}

// 删除自定义值
const removeCustomValue = (attrId, index) => {
  customAttrValues.value[attrId].splice(index, 1)
  generateSku()
}

// 属性值变化
const onAttrChange = () => {
  generateSku()
}

// 生成SKU（笛卡尔积）
const generateSku = () => {
  // 获取所有已选属性值（预定义 + 自定义）
  const attrArrays = []
  const attrNames = []
  
  props.attributes.forEach(attr => {
    const values = getAllSelectedValues(attr.attr_id)
    if (values && values.length > 0) {
      attrArrays.push(values.map(v => ({ attrId: attr.attr_id, attrName: attr.attr_name, value: v })))
      attrNames.push(attr.attr_name)
    }
  })
  
  if (attrArrays.length === 0) {
    skuList.value = []
    emit('change', [])
    return
  }
  
  // 笛卡尔积生成所有组合
  const cartesian = (...args) => {
    return args.reduce((acc, curr) => {
      return acc.flatMap(a => curr.map(b => [...(Array.isArray(a) ? a : [a]), b]))
    })
  }
  
  const combinations = cartesian(...attrArrays)
  
  // 生成SKU列表
  const newSkuList = combinations.map((combo, index) => {
    // 生成SKU名称
    const skuName = combo.map(c => c.value).join('-')
    
    // 生成SKU编号
    const skuCode = `${Date.now()}${String(index).padStart(4, '0')}`
    
    // 构建属性对象
    const skuAttrs = {}
    combo.forEach(c => {
      skuAttrs[c.attrName] = c.value
      skuAttrs[`attr_${c.attrId}`] = c.value  // 用于表格显示
    })
    
    // 查找是否已存在同样的SKU（保留原有数据）
    const existing = skuList.value.find(sku => sku.sku_name === skuName)
    
    return {
      sku_name: skuName,
      sku_code: existing ? existing.sku_code : skuCode,
      price: existing ? existing.price : 0,
      promotion_price: existing ? existing.promotion_price : null,
      inventory: existing ? existing.inventory : 0,
      stock_alert: existing ? existing.stock_alert : 50,
      attributes: skuAttrs,
      ...skuAttrs  // 展开属性用于表格显示
    }
  })
  
  skuList.value = newSkuList
  emit('change', newSkuList)
}

// SKU数据变化
const onSkuChange = () => {
  emit('change', skuList.value)
}

// 同步价格
const syncPrice = async () => {
  const { value } = await ElMessageBox.prompt('请输入统一价格', '同步价格', {
    inputPattern: /^\d+(\.\d{1,2})?$/,
    inputErrorMessage: '请输入有效的价格'
  })
  
  const price = parseFloat(value)
  skuList.value.forEach(sku => {
    sku.price = price
  })
  onSkuChange()
}

// 同步库存
const syncInventory = async () => {
  const { value } = await ElMessageBox.prompt('请输入统一库存', '同步库存', {
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入有效的库存数量'
  })
  
  const inventory = parseInt(value)
  skuList.value.forEach(sku => {
    sku.inventory = inventory
  })
  onSkuChange()
}

// 同步预警值
const syncStockAlert = async () => {
  const { value } = await ElMessageBox.prompt('请输入统一预警值', '同步预警值', {
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入有效的预警值'
  })
  
  const stockAlert = parseInt(value)
  skuList.value.forEach(sku => {
    sku.stock_alert = stockAlert
  })
  onSkuChange()
}

defineExpose({
  getSku: () => skuList.value
})
</script>

<style lang="less" scoped>
.sku-generator {
  .attribute-selector {
    margin-bottom: 20px;
    
    .attribute-group {
      margin-bottom: 25px;
      display: flex;
      align-items: flex-start;
      
      .attribute-label {
        min-width: 100px;
        font-weight: bold;
        padding-top: 8px;
        font-size: 14px;
      }
      
      .attribute-values-container {
        flex: 1;
        
        .section-title {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .predefined-values {
          margin-bottom: 15px;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 4px;
          
          .el-checkbox-group {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
          }
        }
        
        .custom-values {
          margin-bottom: 15px;
          padding: 10px;
          background: #fff7e6;
          border-radius: 4px;
          
          .custom-input {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            
            .el-tag {
              margin-right: 8px;
              margin-bottom: 8px;
            }
          }
        }
        
        .selected-preview {
          padding: 10px;
          background: #e6f7ff;
          border-radius: 4px;
          
          .selected-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      }
    }
  }
  
  .sku-table {
    margin-bottom: 15px;
  }
  
  .batch-operations {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
}
</style>

