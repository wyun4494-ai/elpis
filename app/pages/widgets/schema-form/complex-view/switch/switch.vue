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
      <el-switch
        v-model="dotValue"
        v-bind="schema.option"
        class="component"
        :class=" validTips ? 'valid-border' : '' "
        :active-value="schema.option?.activeValue ?? true"
        :inactive-value="schema.option?.inactiveValue ?? false"
        :active-text="schema.option?.activeText"
        :inactive-text="schema.option?.inactiveText"
        :disabled="schema.option?.disabled"
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
      />
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
import { ref, toRefs, watch, onMounted, inject} from 'vue'
const ajv = inject('ajv')
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
    type: [String, Number, Boolean, Object],
    default: undefined
  }
})

const { schema, schemaKey } = props
const { model } = toRefs(props)

const name = ref('switch')
const dotValue = ref()
const validTips = ref('')

// 初始化数据
const initData = () => {
  // 如果有model值，使用model值，否则使用schema中定义的默认值
  dotValue.value = model.value !== undefined ? model.value : schema.option?.default
  validTips.value = ''
}

onMounted(() => {
  initData()
})

watch([model, schema], () => {
  initData()
}, {
  deep: true,
  immediate: true
})

// 获取表单值
const getValue = () => {
  return dotValue.value !== undefined ? {
    [schemaKey]: dotValue.value
  } : {}
}

// 表单校验
const validate = () => {
  validTips.value = ''

  const { type } = schema

  if (schema.option?.required && dotValue.value === undefined) {
    validTips.value = '请选择'
    return false
  }

  // 调用ajv校验schema
  if (dotValue.value !== undefined) {
    try {
      const validate = ajv.compile(schema)
      const valid = validate(dotValue.value)
      if (!valid && validate.errors && validate.errors[0]) {
        const { keyword } = validate.errors[0]
        if (keyword === 'type') {
          validTips.value = `类型必须为${type}，请检查输入`
        } else {
          validTips.value = '格式错误，请检查输入'
        }
        return false
      }
    } catch (error) {
      console.error('Switch validation error:', error)
    }
  }
  return true
}

// 输入框聚焦事件
const onFocus = () => {
  validTips.value = ''
}

// 输入框失焦事件
const onBlur = () => {
  validate()
}

// 值变化事件
const onChange = (value) => {
  validate()
}

defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>
.form-item {
  width: 100%;
  margin-bottom: 20px;

  .item-label {
    width: 120px;
    font-size: 14px;
    color: #606266;
    margin-right: 10px;
    flex-shrink: 0;

    .required {
      color: #f56c6c;
      margin-right: 4px;
    }
  }

  .item-value {
    flex: 1;
    min-width: 0;

    .component {
      width: 100%;

      &.valid-border {
        :deep(.el-switch__core) {
          border-color: #f56c6c;
        }
      }
    }
  }

  .valid-tips {
    width: 100%;
    font-size: 12px;
    color: #f56c6c;
    margin-top: 5px;
    margin-left: 130px;
  }
}
</style>

