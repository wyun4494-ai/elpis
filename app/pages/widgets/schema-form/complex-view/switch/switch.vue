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

/**
 * 开关组件
 * 基础表单控件，支持布尔值切换
 *
 * 核心功能：
 * - 支持开关切换（true/false）
 * - 支持自定义激活值和非激活值（activeValue/inactiveValue）
 * - 支持必填校验
 * - 支持类型校验（使用 ajv）
 *
 * 使用场景：
 * - 商品上架/下架
 * - 功能开启/关闭
 * - 状态启用/禁用
 *
 * @component Switch
 */
<script setup>
import { ref, toRefs, watch, onMounted, inject} from 'vue'
const ajv = inject('ajv')

const props = defineProps({
  /**
   * Schema 配置
   * @type {Object}
   * @required
   * @example
   * {
   *   label: '上架状态',
   *   option: {
   *     activeValue: 1,
   *     inactiveValue: 0,
   *     activeText: '上架',
   *     inactiveText: '下架',
   *     required: true
   *   }
   * }
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
   * 开关值（用于数据回显）
   * @type {string|number|boolean|Object}
   */
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

/**
 * 初始化数据
 * 从 model 或 schema.option.default 加载初始值
 */
const initData = () => {
  // 如果有model值，使用model值，否则使用schema中定义的默认值
  dotValue.value = model.value !== undefined ? model.value : schema.option?.default
  validTips.value = ''
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
  immediate: true
})

/**
 * 获取表单值
 * @returns {Object} 表单值对象
 */
const getValue = () => {
  return dotValue.value !== undefined ? {
    [schemaKey]: dotValue.value
  } : {}
}

/**
 * 表单校验
 *
 * 校验规则：
 * 1. 必填校验（required）
 * 2. 类型校验（type）
 *
 * @returns {boolean} 校验结果
 */
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

/**
 * 输入框聚焦事件处理
 * 清空校验提示
 */
const onFocus = () => {
  validTips.value = ''
}

/**
 * 输入框失焦事件处理
 * 触发校验
 */
const onBlur = () => {
  validate()
}

/**
 * 值变化事件处理
 * 触发校验
 *
 * @param {any} value - 新值
 */
const onChange = (value) => {
  validate()
}

/**
 * 暴露给父组件的方法
 * - getValue: 获取开关值
 * - validate: 校验开关值
 * - name: 组件名称
 */
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

