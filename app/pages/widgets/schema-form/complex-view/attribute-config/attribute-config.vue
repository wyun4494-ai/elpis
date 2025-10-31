<template>
  <el-row
    type="flex"
    align="top"
    class="form-item"
  >
    <!-- label -->
    <el-row
      class="item-label"
      justify="start"
    >
      <el-row 
        v-if="schema.option?.required"
        type="flex"
        class="required"
      >
        *
      </el-row>
      {{ schema.label }}
    </el-row>
    <!-- value -->
    <el-row
      class="item-value"
    >
      <div class="attribute-config-container">
        <!-- 属性列表 -->
        <div 
          v-for="(attr, index) in attributes" 
          :key="index"
          class="attribute-item"
        >
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>规格 {{ index + 1 }}</span>
                <el-button 
                  type="danger" 
                  size="small"
                  text
                  @click="removeAttribute(index)"
                >
                  删除
                </el-button>
              </div>
            </template>

            <!-- 属性名称 -->
            <el-form-item
              label="属性名称"
              required
            >
              <el-input
                v-model="attr.attr_name"
                placeholder="如：颜色、尺寸"
                @input="onValueChange"
              />
            </el-form-item>

            <!-- 属性类型 -->
            <el-form-item
              label="属性类型"
              required
            >
              <el-radio-group 
                v-model="attr.attr_type"
                @change="onAttributeTypeChange(index)"
              >
                <el-radio value="input_add">
                  动态输入（用户添加值）
                </el-radio>
                <el-radio value="select">
                  单选（预定义值）
                </el-radio>
                <el-radio value="checkbox">
                  多选（预定义值）
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 属性值配置（仅当类型为 select 或 checkbox 时显示） -->
            <el-form-item 
              v-if="attr.attr_type === 'select' || attr.attr_type === 'checkbox'"
              label="属性值"
            >
              <div class="attr-values-container">
                <!-- 已添加的值 -->
                <div class="value-tags">
                  <el-tag
                    v-for="(value, vIndex) in attr.attr_values"
                    :key="vIndex"
                    closable
                    @close="removeAttrValue(index, vIndex)"
                  >
                    {{ value }}
                  </el-tag>
                </div>
                <!-- 添加新值 -->
                <div class="add-value">
                  <el-input
                    v-model="attr.newValue"
                    placeholder="输入属性值"
                    style="width: 200px"
                    @keyup.enter="addAttrValue(index)"
                  />
                  <el-button 
                    type="primary"
                    size="small"
                    @click="addAttrValue(index)"
                  >
                    添加
                  </el-button>
                </div>
              </div>
            </el-form-item>

            <!-- 是否必填 -->
            <el-form-item label="是否必填">
              <el-switch
                v-model="attr.is_required"
                :active-value="1"
                :inactive-value="0"
                @change="onValueChange"
              />
            </el-form-item>
          </el-card>
        </div>

        <!-- 添加属性按钮 -->
        <el-button 
          type="primary"
          plain
          class="add-btn"
          @click="addAttribute"
        >
          + 添加规格
        </el-button>
      </div>
    </el-row>
    <el-row
      v-if="validTips"
      class="valid-tips"
    >
      {{ validTips }}
    </el-row>
  </el-row>
</template>

/**
 * 属性配置器组件
 * 用于配置商品属性（SKU 规格），支持多种属性类型和预定义值
 *
 * 核心功能：
 * - 支持添加/删除属性
 * - 支持三种属性类型：动态输入、单选、多选
 * - 支持预定义属性值（单选/多选类型）
 * - 支持必填标记
 * - 自动校验属性配置
 *
 * 属性类型说明：
 * - input_add：动态输入（用户在 SKU 生成器中添加值）
 * - select：单选（预定义值，用户只能选择一个）
 * - checkbox：多选（预定义值，用户可以选择多个）
 *
 * @component AttributeConfig
 */
<script setup>
import { ref, toRefs, watch, onMounted } from 'vue'

const props = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @required
   */
  schema: {
    type: Object,
    default: () => ({})
  },

  /**
   * Schema 键名
   * @type {string}
   */
  schemaKey: {
    type: String,
    default: ''
  },

  /**
   * 属性配置数据（用于数据回显）
   * @type {Array}
   * @example
   * [
   *   {
   *     attr_name: '颜色',
   *     attr_type: 'checkbox',
   *     attr_values: ['金色', '白色', '黑色'],
   *     is_required: 1
   *   },
   *   {
   *     attr_name: '内存',
   *     attr_type: 'select',
   *     attr_values: ['128GB', '256GB', '512GB'],
   *     is_required: 1
   *   }
   * ]
   */
  model: {
    type: Array,
    default: () => []
  }
})

const { schema, schemaKey, model } = toRefs(props)

const name = ref('attributeConfig')
const attributes = ref([])
const validTips = ref('')

/**
 * 初始化数据
 * 从 model 中加载属性配置，用于数据回显
 */
const initData = () => {
  if (model.value && Array.isArray(model.value) && model.value.length > 0) {
    attributes.value = model.value.map(attr => ({
      ...attr,
      attr_values: attr.attr_values || [],
      newValue: ''
    }))
  } else {
    attributes.value = []
  }
  validTips.value = ''
}

/**
 * 添加属性
 * 添加一个新的属性配置项
 */
const addAttribute = () => {
  attributes.value.push({
    attr_name: '',
    attr_type: 'input_add',
    attr_values: [],
    is_required: 1,
    sort_order: attributes.value.length,
    newValue: ''
  })
  onValueChange()
}

/**
 * 删除属性
 * @param {number} index - 属性索引
 */
const removeAttribute = (index) => {
  attributes.value.splice(index, 1)
  onValueChange()
}

/**
 * 属性类型改变处理
 * 如果改为动态输入类型，清空预定义值
 *
 * @param {number} index - 属性索引
 */
const onAttributeTypeChange = (index) => {
  const attr = attributes.value[index]
  // 如果改为动态输入，清空预定义值
  if (attr.attr_type === 'input_add') {
    attr.attr_values = []
  }
  onValueChange()
}

/**
 * 添加属性值
 * 为单选/多选类型的属性添加预定义值
 *
 * @param {number} index - 属性索引
 */
const addAttrValue = (index) => {
  const attr = attributes.value[index]
  if (attr.newValue && attr.newValue.trim()) {
    if (!attr.attr_values) {
      attr.attr_values = []
    }
    attr.attr_values.push(attr.newValue.trim())
    attr.newValue = ''
    onValueChange()
  }
}

/**
 * 删除属性值
 * @param {number} attrIndex - 属性索引
 * @param {number} valueIndex - 属性值索引
 */
const removeAttrValue = (attrIndex, valueIndex) => {
  attributes.value[attrIndex].attr_values.splice(valueIndex, 1)
  onValueChange()
}

/**
 * 值变化处理
 * 触发校验
 */
const onValueChange = () => {
  validate()
}

/**
 * 获取表单值
 * 返回属性配置数据（过滤掉临时字段 newValue）
 *
 * @returns {Object} 表单值对象
 */
const getValue = () => {
  const value = attributes.value.map(attr => ({
    attr_name: attr.attr_name,
    attr_type: attr.attr_type,
    attr_values: attr.attr_values || [],
    is_required: attr.is_required,
    sort_order: attr.sort_order
  }))

  return {
    [schemaKey.value]: value
  }
}

/**
 * 表单校验
 *
 * 校验规则：
 * 1. 如果必填，至少添加一个属性
 * 2. 属性名称不能为空
 * 3. 单选/多选类型必须添加属性值
 *
 * @returns {boolean} 校验结果
 */
const validate = () => {
  validTips.value = ''

  if (schema.value.option?.required && attributes.value.length === 0) {
    validTips.value = '请至少添加一个规格属性'
    return false
  }

  for (let i = 0; i < attributes.value.length; i++) {
    const attr = attributes.value[i]
    if (!attr.attr_name || !attr.attr_name.trim()) {
      validTips.value = `规格${i + 1}：属性名称不能为空`
      return false
    }

    if ((attr.attr_type === 'select' || attr.attr_type === 'checkbox') &&
        (!attr.attr_values || attr.attr_values.length === 0)) {
      validTips.value = `规格${i + 1}：请添加属性值`
      return false
    }
  }

  return true
}

/**
 * 组件挂载时初始化数据
 */
onMounted(() => {
  initData()
})

/**
 * 监听 model 和 schema 变化，重新初始化数据
 */
watch([model, schema], () => {
  initData()
}, {
  deep: true,
  immediate: false
})

/**
 * 暴露给父组件的方法
 * - getValue: 获取属性配置数据
 * - validate: 校验属性配置
 * - name: 组件名称
 */
defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>
.attribute-config-container {
  width: 100%;

  .attribute-item {
    margin-bottom: 15px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    :deep(.el-card__body) {
      padding: 15px;
    }

    .el-form-item {
      margin-bottom: 12px;
    }

    .attr-values-container {
      .value-tags {
        margin-bottom: 10px;
        min-height: 32px;

        .el-tag {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }

      .add-value {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }
  }

  .add-btn {
    width: 100%;
    margin-top: 10px;
  }
}
</style>

