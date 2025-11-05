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
      :max-height="500"
    >
      <!-- 属性列（动态生成） -->
      <el-table-column
        v-for="attr in attributes"
        :key="attr.attr_id"
        :label="attr.attr_name"
        :prop="'attr_' + attr.attr_id"
        width="100"
      />
      
      <el-table-column label="销售价格" width="140">
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

      <el-table-column label="促销价格" width="140">
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

      <el-table-column label="商品库存" width="140">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.inventory"
            :min="0"
            size="small"
            @change="onSkuChange"
          />
        </template>
      </el-table-column>

      <el-table-column label="库存预警值" width="140">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.stock_alert"
            :min="0"
            size="small"
            @change="onSkuChange"
          />
        </template>
      </el-table-column>

      <el-table-column label="SKU编号" width="200">
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

/**
 * SKU 生成器组件
 * 通过笛卡尔积算法自动生成 SKU 组合，支持预定义值和自定义值
 *
 * 核心功能：
 * - 支持预定义值勾选（checkbox）
 * - 支持自定义值输入（tag-input）
 * - 笛卡尔积生成所有 SKU 组合
 * - 支持批量设置价格、库存、预警值
 * - 自动生成 SKU 编号
 * - 保留已有 SKU 数据（重新生成时）
 *
 * @component SkuGenerator
 */
<script setup>
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  /**
   * 属性配置列表
   * @type {Array}
   * @required
   * @example
   * [
   *   {
   *     attr_id: 'ATTR001',
   *     attr_name: '颜色',
   *     predefined_values: ['金色', '白色', '黑色'],
   *     allow_custom: 1
   *   },
   *   {
   *     attr_id: 'ATTR002',
   *     attr_name: '内存',
   *     predefined_values: ['128GB', '256GB', '512GB'],
   *     allow_custom: 0
   *   }
   * ]
   */
  attributes: {
    type: Array,
    default: () => []
  },

  /**
   * 初始 SKU 数据（用于编辑模式回显）
   * @type {Array}
   * @example
   * [
   *   {
   *     sku_name: '金色-128GB',
   *     sku_code: 'SKU001',
   *     attributes: { '颜色': '金色', '内存': '128GB' },
   *     price: 5999,
   *     promotion_price: null,
   *     inventory: 100,
   *     stock_alert: 50
   *   }
   * ]
   */
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change', 'update:modelValue'])

const selectedAttrValues = ref({})  // 预定义值中选中的
const customAttrValues = ref({})  // 用户自定义的值
const inputValues = ref({})  // 输入框的值
const skuList = ref([])  // SKU列表

/**
 * 监听属性配置变化，初始化数据结构
 */
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

/**
 * 监听 modelValue 变化，回显 SKU 数据（编辑模式）
 */
watch(() => props.modelValue, (newSkus) => {
  if (newSkus && newSkus.length > 0) {

    // 1. 设置 SKU 列表
    skuList.value = newSkus.map(sku => ({
      sku_name: sku.sku_name,
      sku_code: sku.sku_code,
      price: parseFloat(sku.price) || 0,
      promotion_price: sku.promotion_price ? parseFloat(sku.promotion_price) : null,
      inventory: parseInt(sku.inventory) || 0,
      stock_alert: parseInt(sku.stock_alert) || 50,
      attributes: sku.attributes || {},
      ...sku.attributes  // 展开属性用于表格显示
    }))

    // 2. 根据 SKU 数据反推选中的属性值
    if (props.attributes && props.attributes.length > 0) {
      // 收集每个属性的所有值
      const attrValuesMap = {}

      newSkus.forEach(sku => {
        if (sku.attributes) {
          Object.entries(sku.attributes).forEach(([attrName, attrValue]) => {
            // 找到对应的属性ID
            const attr = props.attributes.find(a => a.attr_name === attrName)
            if (attr) {
              if (!attrValuesMap[attr.attr_id]) {
                attrValuesMap[attr.attr_id] = new Set()
              }
              // 过滤掉以 attr_ 开头的属性（这些是用于表格显示的）
              if (!attrName.startsWith('attr_')) {
                attrValuesMap[attr.attr_id].add(attrValue)
              }
            }
          })
        }
      })

      // 3. 将收集到的值分配到预定义值和自定义值
      Object.entries(attrValuesMap).forEach(([attrId, valuesSet]) => {
        const attr = props.attributes.find(a => a.attr_id === attrId)
        if (attr) {
          const values = Array.from(valuesSet)
          const predefinedValues = attr.predefined_values || []

          // 分离预定义值和自定义值
          selectedAttrValues.value[attrId] = values.filter(v => predefinedValues.includes(v))
          customAttrValues.value[attrId] = values.filter(v => !predefinedValues.includes(v))
        }
      })
    }

  }
}, { immediate: true, deep: true })

/**
 * 获取某个属性的所有已选值（预定义 + 自定义）
 * @param {string} attrId - 属性ID
 * @returns {Array} 所有已选值
 */
const getAllSelectedValues = (attrId) => {
  const predefined = selectedAttrValues.value[attrId] || []
  const custom = customAttrValues.value[attrId] || []
  return [...predefined, ...custom]
}

/**
 * 添加自定义值
 * @param {string} attrId - 属性ID
 */
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

/**
 * 删除自定义值
 * @param {string} attrId - 属性ID
 * @param {number} index - 要删除的索引
 */
const removeCustomValue = (attrId, index) => {
  customAttrValues.value[attrId].splice(index, 1)
  generateSku()
}

/**
 * 属性值变化处理（预定义值勾选）
 * 触发 SKU 重新生成
 */
const onAttrChange = () => {
  generateSku()
}

/**
 * 生成 SKU（笛卡尔积算法）
 *
 * 算法说明：
 * 1. 获取所有已选属性值（预定义 + 自定义）
 * 2. 使用笛卡尔积算法生成所有组合
 * 3. 为每个组合生成 SKU 对象
 * 4. 保留已存在的 SKU 数据（价格、库存等）
 *
 * 示例：
 * 属性1：颜色 = ['金色', '白色']
 * 属性2：内存 = ['128GB', '256GB']
 * 生成 4 个 SKU：
 * - 金色-128GB
 * - 金色-256GB
 * - 白色-128GB
 * - 白色-256GB
 */
const generateSku = () => {
  // 1. 获取所有已选属性值（预定义 + 自定义）
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

  // 2. 笛卡尔积生成所有组合
  const cartesian = (...args) => {
    return args.reduce((acc, curr) => {
      return acc.flatMap(a => curr.map(b => [...(Array.isArray(a) ? a : [a]), b]))
    })
  }

  const combinations = cartesian(...attrArrays)

  // 3. 生成 SKU 列表
  const newSkuList = combinations.map((combo, index) => {
    // 确保 combo 是数组类型（处理只有一个属性的情况）
    const comboArray = Array.isArray(combo) ? combo : [combo]

    // 生成 SKU 名称（属性值用 - 连接）
    const skuName = comboArray.map(c => c.value).join('-')

    // 生成 SKU 编号（时间戳 + 索引）
    const skuCode = `${Date.now()}${String(index).padStart(4, '0')}`

    // 构建属性对象
    const skuAttrs = {}
    comboArray.forEach(c => {
      skuAttrs[c.attrName] = c.value
      skuAttrs[`attr_${c.attrId}`] = c.value  // 用于表格显示
    })

    // 4. 查找是否已存在同样的 SKU（保留原有数据）
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

/**
 * SKU 数据变化处理
 * 触发 change 事件，通知父组件
 */
const onSkuChange = () => {
  emit('change', skuList.value)
}

/**
 * 同步价格
 * 批量设置所有 SKU 的价格
 */
const syncPrice = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入统一价格', '同步价格', {
      inputPattern: /^\d+(\.\d{1,2})?$/,
      inputErrorMessage: '请输入有效的价格'
    })

    const price = parseFloat(value)
    skuList.value.forEach(sku => {
      sku.price = price
    })
    onSkuChange()
  } catch (error) {
    // 用户取消操作，不做任何处理
  }
}

/**
 * 同步库存
 * 批量设置所有 SKU 的库存
 */
const syncInventory = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入统一库存', '同步库存', {
      inputPattern: /^\d+$/,
      inputErrorMessage: '请输入有效的库存数量'
    })

    const inventory = parseInt(value)
    skuList.value.forEach(sku => {
      sku.inventory = inventory
    })
    onSkuChange()
  } catch (error) {
    // 用户取消操作，不做任何处理
  }
}

/**
 * 同步预警值
 * 批量设置所有 SKU 的库存预警值
 */
const syncStockAlert = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入统一预警值', '同步预警值', {
      inputPattern: /^\d+$/,
      inputErrorMessage: '请输入有效的预警值'
    })

    const stockAlert = parseInt(value)
    skuList.value.forEach(sku => {
      sku.stock_alert = stockAlert
    })
    onSkuChange()
  } catch (error) {
    // 用户取消操作，不做任何处理
  }
}

/**
 * 暴露给父组件的方法
 * - getSku: 获取 SKU 列表
 * - setSkuList: 设置 SKU 列表（用于外部初始化）
 */
defineExpose({
  getSku: () => skuList.value,
  setSkuList: (skus) => {
    if (skus && Array.isArray(skus)) {
      skuList.value = skus
    }
  }
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

    :deep(.el-table__cell) {
      padding: 12px 8px;
    }

    :deep(.el-input-number) {
      width: 100%;
    }

    :deep(.el-input) {
      width: 100%;
    }
  }
  
  .batch-operations {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
}
</style>

