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

<script setup>
import { ref, toRefs, watch, onMounted } from 'vue'

const props = defineProps({
  schema: {
    type: Object,
    default: () => ({})
  },
  schemaKey: {
    type: String,
    default: ''
  },
  model: {
    type: Array,
    default: () => []
  }
})

const { schema, schemaKey, model } = toRefs(props)

const name = ref('attributeConfig')
const attributes = ref([])
const validTips = ref('')

// 初始化数据
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

// 添加属性
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

// 删除属性
const removeAttribute = (index) => {
  attributes.value.splice(index, 1)
  onValueChange()
}

// 属性类型改变
const onAttributeTypeChange = (index) => {
  const attr = attributes.value[index]
  // 如果改为动态输入，清空预定义值
  if (attr.attr_type === 'input_add') {
    attr.attr_values = []
  }
  onValueChange()
}

// 添加属性值
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

// 删除属性值
const removeAttrValue = (attrIndex, valueIndex) => {
  attributes.value[attrIndex].attr_values.splice(valueIndex, 1)
  onValueChange()
}

// 值变化
const onValueChange = () => {
  validate()
}

// 获取表单值
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

// 表单校验
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

onMounted(() => {
  initData()
})

watch([model, schema], () => {
  initData()
}, {
  deep: true,
  immediate: false
})

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

