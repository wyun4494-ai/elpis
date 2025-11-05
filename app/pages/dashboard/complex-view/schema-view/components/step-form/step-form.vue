<template>
  <el-drawer
    v-model="visible"
    :title="title"
    size="70%"
    :before-close="handleClose"
  >
    <!-- 步骤条 -->
    <steps-indicator
      :active="currentStep"
      :steps="stepConfig"
    />

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1：商品基本信息 -->
      <div
        v-show="currentStep === 0"
        class="step-panel"
      >
        <schema-form
          ref="basicFormRef"
          :schema="basicInfoSchema"
          :model="basicInfo"
        />
      </div>

      <!-- 步骤2：商品属性（嵌套抽屉） -->
      <el-drawer
        v-model="showAttributeDrawer"
        :title="title"
        size="90%"
        append-to-body
        :before-close="handleAttributeDrawerClose"
      >
        <!-- 嵌套抽屉中的步骤条 -->
        <steps-indicator
          :active="currentStep"
          :steps="stepConfig"
          custom-class="nested"
        />

        <div class="attribute-step-content">
          <!-- SKU规格配置 -->
          <el-card
            shadow="never"
            class="sku-config-card"
          >
            <template #header>
              <div class="card-header-title">
                商品规格
              </div>
            </template>
            <div v-if="productTypeConfig">
              <p class="type-info">
                属性类型：{{ productTypeConfig.type_name }}
              </p>
              <!-- SKU生成器组件 -->
              <sku-generator
                ref="skuGeneratorRef"
                v-model="skuData"
                :attributes="productTypeConfig.attributes"
                @change="handleSkuChange"
              />
              <!-- 库存统计组件 -->
              <inventory-stats
                :total-inventory="basicInfo.inventory || 0"
                :skus="skuData"
              />
            </div>
            <el-empty
              v-else
              description="请先选择商品分类"
            />
          </el-card>

          <!-- 商品参数配置 -->
          <el-card
            shadow="never"
            class="param-config-card"
          >
            <template #header>
              <div class="card-header-title">
                商品参数
              </div>
            </template>
            <div v-if="productTypeConfig">
              <product-params
                ref="productParamsRef"
                :params="productTypeConfig.params"
                @change="handleParamsChange"
              />
            </div>
            <el-empty
              v-else
              description="请先选择商品分类"
            />
          </el-card>

          <!-- 商品图片上传 -->
          <el-card
            shadow="never"
            class="image-upload-card"
          >
            <template #header>
              <div class="card-header-title">
                商品相册
              </div>
            </template>
            <schema-form
              ref="imageFormRef"
              :schema="imageUploadSchema"
              :model="imageData"
            />
          </el-card>

          <!-- 商品详情 -->
          <el-card
            shadow="never"
            class="detail-editor-card"
          >
            <template #header>
              <div class="card-header-title">
                商品详情
              </div>
            </template>
            <schema-form
              ref="detailFormRef"
              :schema="productDetailSchema"
              :model="detailData"
            />
          </el-card>
        </div>

        <!-- 嵌套抽屉底部按钮 -->
        <template #footer>
          <div class="drawer-footer">
            <el-button @click="handleAttributeDrawerClose">
              取消
            </el-button>
            <el-button @click="prevStep">
              上一步
            </el-button>
            <el-button
              type="primary"
              :disabled="isInventoryOverLimit"
              @click="handleSubmit"
            >
              保存商品
            </el-button>
          </div>
        </template>
      </el-drawer>
    </div>

    <!-- 主抽屉底部按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button 
          v-if="currentStep === 0" 
          type="primary" 
          @click="nextStep"
        >
          下一步，填写商品属性
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, inject, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import $curl from '$elpisCommon/curl.js'
import schemaForm from '$elpisWidgets/schema-form/schema-form.vue'
import stepsIndicator from '$elpisWidgets/steps-indicator/steps-indicator.vue'
import skuGenerator from './sku-generator.vue'
import productParams from './product-params.vue'
import inventoryStats from '$elpisWidgets/inventory-stats/inventory-stats.vue'

// 从 schema-view 注入数据
const schemaViewData = inject('schemaViewData', {})
const api = computed(() => schemaViewData.api?.value || '')
// stepForm 使用 createForm 的 schema（因为 model.js 中没有定义 stepFormOption）
const schema = computed(() => schemaViewData.components?.value?.createForm?.schema || {})

const emit = defineEmits(['command'])

const name = ref('stepForm')
const visible = ref(false)
const title = ref('添加商品')
const currentStep = ref(0)
const showAttributeDrawer = ref(false)
const isEditMode = ref(false)
const editProductId = ref('')

const basicFormRef = ref(null)
const skuGeneratorRef = ref(null)
const productParamsRef = ref(null)
const imageFormRef = ref(null)
const detailFormRef = ref(null)

const basicInfo = ref({})
const skuData = ref([])
const paramsData = ref({})
const imageData = ref({})
const detailData = ref({})
const productTypeConfig = ref(null)

// 步骤定义
const stepConfig = [
  { title: '填写商品信息' },
  { title: '填写商品属性' }
]

// 商品图片上传Schema
const imageUploadSchema = computed(() => {
  if (!schema.value || !schema.value.properties || !schema.value.properties.product_images) {
    return { type: 'object', properties: {} }
  }

  return {
    type: 'object',
    properties: {
      product_images: schema.value.properties.product_images
    }
  }
})

// 商品详情Schema
const productDetailSchema = computed(() => {
  if (!schema.value || !schema.value.properties || !schema.value.properties.product_detail) {
    return { type: 'object', properties: {} }
  }

  return {
    type: 'object',
    properties: {
      product_detail: schema.value.properties.product_detail
    }
  }
})

// 基本信息 Schema（从完整 schema 中提取）
const basicInfoSchema = computed(() => {
  if (!schema.value || !schema.value.properties) {
    return { type: 'object', properties: {} }
  }

  const properties = {}
  
  // 提取基本信息字段（schema 已由 buildDtoSchema 处理过，字段已包含 option）
  const basicFields = [
    'product_name',
    'category_id',
    'brand_id',
    'item_number',
    'price',
    'inventory',
    'shelf_status',
    'sort_order'
  ]
  
  basicFields.forEach(field => {
    if (schema.value.properties[field]) {
      properties[field] = schema.value.properties[field]
    }
  })
  
  return {
    type: 'object',
    properties
  }
})

// 计算库存是否超限
const isInventoryOverLimit = computed(() => {
  const totalInventory = basicInfo.value.inventory || 0
  const allocatedInventory = skuData.value.reduce((sum, sku) => {
    return sum + (parseInt(sku.inventory) || 0)
  }, 0)
  return allocatedInventory > totalInventory
})

// 显示表单
const show = async (rowData = null) => {
  currentStep.value = 0
  showAttributeDrawer.value = false
  skuData.value = []
  paramsData.value = {}
  imageData.value = {}
  detailData.value = {}
  productTypeConfig.value = null
  
  if (rowData && rowData.product_id) {
    isEditMode.value = true
    editProductId.value = rowData.product_id
    title.value = '编辑商品'
    basicInfo.value = {}
    
    // 先加载数据，再显示表单
    await loadProductDetail(rowData.product_id)
    await nextTick()
    visible.value = true
  } else {
    isEditMode.value = false
    editProductId.value = ''
    title.value = '添加商品'
    basicInfo.value = {}
    visible.value = true
  }
}

// 加载商品类型配置
const loadProductType = async (categoryId) => {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/type/by-category',
      params: { category_id: categoryId }
    })
    
    if (res && res.success && res.data) {
      productTypeConfig.value = res.data
    } else {
      productTypeConfig.value = null
      ElMessage.warning('该分类暂无商品类型配置，将跳过商品规格和参数配置')
    }
  } catch (error) {
    console.error('Load product type error:', error)
    productTypeConfig.value = null
  }
}

// 下一步
const nextStep = async () => {
  // 验证基本信息
  if (!basicFormRef.value || !basicFormRef.value.validate()) {
    ElMessage.error('请填写必填项')
    return
  }
  
  const formData = basicFormRef.value.getValue()
  basicInfo.value = formData
  
  if (!formData.category_id) {
    ElMessage.error('请选择商品分类')
    return
  }
  
  await loadProductType(formData.category_id)
  
  // 打开嵌套抽屉
  currentStep.value = 1
  showAttributeDrawer.value = true
}

// 上一步
const prevStep = () => {
  showAttributeDrawer.value = false
  currentStep.value = 0
}

// SKU数据变化
const handleSkuChange = (data) => {
  skuData.value = data
}

// 参数数据变化
const handleParamsChange = (data) => {
  paramsData.value = data
}

// 加载商品详情（编辑时）
const loadProductDetail = async (productId) => {
  try {
    // 1. 加载商品基本信息
    const res = await $curl({
      method: 'get',
      url: api.value,
      params: { product_id: productId }
    })

    if (res && res.success && res.data) {
      const product = res.data

      // 直接设置完整数据,避免先设置空对象导致级联选择器重复初始化
      basicInfo.value = {
        product_name: product.product_name,
        category_id: product.category_id,
        brand_id: product.brand_id,
        price: product.price,
        item_number: product.item_number,
        inventory: product.inventory,
        shelf_status: product.shelf_status,
        sort_order: product.sort_order
      }

      // 设置商品图片数据
      imageData.value = {
        product_images: product.product_images || []
      }

      // 设置商品详情数据
      detailData.value = {
        product_detail: product.product_detail || ''
      }

      await nextTick()

      // 2. 加载商品类型配置
      if (product.category_id) {
        await loadProductType(product.category_id)

        // 等待类型配置加载完成后，再加载 SKU 和参数数据
        // 这样可以确保 SKU 生成器组件已经渲染
        await nextTick()
      }

      // 3. 加载 SKU 数据（移到 loadProductType 之后，确保组件已渲染）
      try {
        const skuRes = await $curl({
          method: 'get',
          url: `/api/proj/product/${productId}/skus`
        })

        if (skuRes && skuRes.success && Array.isArray(skuRes.data)) {
          skuData.value = skuRes.data

          // 等待下一个 tick，确保 SKU 生成器组件已经渲染和 v-model 绑定生效
          await nextTick()

          // 手动调用 SKU 生成器的 setSkuList 方法（作为备用方案）
          if (skuGeneratorRef.value && typeof skuGeneratorRef.value.setSkuList === 'function') {
            skuGeneratorRef.value.setSkuList(skuRes.data)
          }
        } else {
          skuData.value = []
        }
      } catch (error) {
        console.error('Load SKU data error:', error)
        skuData.value = []
      }

      // 4. 加载商品参数数据
      try {
        const paramsRes = await $curl({
          method: 'get',
          url: `/api/proj/product/${productId}/params`
        })

        if (paramsRes && paramsRes.success && paramsRes.data) {
          paramsData.value = paramsRes.data
        } else {
          paramsData.value = {}
        }
      } catch (error) {
        console.error('Load params data error:', error)
        paramsData.value = {}
      }
    }
  } catch (error) {
    console.error('Load product detail error:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 获取图片数据
    const imageFormData = imageFormRef.value ? imageFormRef.value.getValue() : {}
    // 获取商品详情数据
    const detailFormData = detailFormRef.value ? detailFormRef.value.getValue() : {}

    const submitData = {
      ...basicInfo.value,
      ...imageFormData,
      ...detailFormData,
      skus: skuData.value,
      params: paramsData.value
    }

    if (isEditMode.value) {
      submitData.product_id = editProductId.value
    }

    const res = await $curl({
      method: isEditMode.value ? 'put' : 'post',
      url: api.value,
      data: submitData,
      successMessage: isEditMode.value ? '商品修改成功' : '商品创建成功',
      errorMessage: isEditMode.value ? '更新失败' : '添加失败'
    })

    if (res && res.success) {
      visible.value = false
      showAttributeDrawer.value = false
      emit('command', { event: 'loadTableData' })
    }
  } catch (error) {
    console.error('Submit error:', error)
  }
}

// 关闭嵌套抽屉（同时关闭主抽屉）
const handleAttributeDrawerClose = () => {
  showAttributeDrawer.value = false
  visible.value = false
}

// 关闭主抽屉
const handleClose = () => {
  visible.value = false
  showAttributeDrawer.value = false
  currentStep.value = 0
}

defineExpose({
  show,
  name
})
</script>

<style lang="less" scoped>
.step-content {
  padding: 0 20px;
  
  .step-panel {
    min-height: 400px;
  }
}

.attribute-step-content {
  padding: 20px;
  
  .type-info {
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
  }
  
  .sku-config-card {
    margin-bottom: 20px;
    min-height: 600px;
  }
  
  .param-config-card {
    margin-bottom: 20px;
  }

  .image-upload-card {
    margin-bottom: 20px;
  }

  .detail-editor-card {
    margin-bottom: 20px;
  }

  .card-header-title {
    font-weight: bold;
    font-size: 16px;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

