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
      <el-input-number
        v-model="dotValue"
        v-bind="schema.option"
        :controls="false"
        class="component"
        :class=" validTips ? 'valid-border' : '' "
        :placeholder="placeholder"
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
 * 数字输入组件
 * 基础表单控件，支持数字输入和校验
 *
 * 核心功能：
 * - 支持数字输入（整数/小数）
 * - 支持必填校验
 * - 支持范围校验（minimum/maximum）
 * - 支持类型校验（使用 ajv）
 * - 自动生成 placeholder（显示校验规则）
 *
 * 使用场景：
 * - 商品价格输入
 * - 库存数量输入
 * - 预警值输入
 * - 其他数字输入场景
 *
 * @component InputNumber
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
   *   type: 'number',
   *   label: '商品价格',
   *   minimum: 0,
   *   maximum: 999999,
   *   option: {
   *     placeholder: '请输入价格',
   *     required: true,
   *     precision: 2
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
   * 输入值（用于数据回显）
   * @type {string|number|boolean|Object}
   */
  model: {
    type: [String, Number, Boolean, Object],
    default: undefined
  },
})

const { schema, schemaKey} = props
const { model } = toRefs(props)

const name = ref('inputNumber')
const dotValue = ref()
const validTips = ref(null)
const placeholder = ref('')

/**
 * 初始化数据
 *
 * 处理流程：
 * 1. 从 model 或 schema.option.default 加载初始值
 * 2. 根据 schema 配置生成 placeholder（显示校验规则）
 */
const initData = () => {
  // 如果有model值，使用model值，否则使用schema中定义的默认值
  dotValue.value = model.value !== undefined ? model.value : schema.option?.default
  validTips.value = null

  const {
    minium,
    maximum
  } = schema

  const ruleList = []
  if(schema.option?.placeholder){
    ruleList.value = schema.option.placeholder
  }
  if(minium !== undefined) {
    ruleList.push(`最小值: ${minium}`)
  }
  if(maximum !== undefined) {
    ruleList.push(`最大值:${maximum}`)
  }

  placeholder.value = ruleList.join('|')
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
},{
  deep: true,
  immediate: true
})

/**
 * 获取表单值
 * @returns {Object} 表单值对象
 */
const getValue = () => {
  return dotValue.value !== null ? {
    [schemaKey]: dotValue.value
  } : {}
}

/**
 * 表单校验
 *
 * 校验规则：
 * 1. 必填校验（required）
 * 2. 类型校验（type: number）
 * 3. 范围校验（minimum/maximum）
 *
 * @returns {boolean} 校验结果
 */
const validate = () => {
  validTips.value = null

  const { type } = schema

  if(schema.option?.required && !dotValue.value){
    validTips.value = '请输入内容'
    return false
  }

  // 调用ajv校验schema
  if(dotValue.value) {
    const validate = ajv.compile(schema)
    const valid = validate(dotValue.value)
    if(!valid && validate.errors && validate.errors[0]) {
      const { keyword, params} = validate.errors[0]
      if(keyword === 'type') {
        validTips.value = `类型必须为${type}，请检查输入`
      } else if(keyword === 'minimum') {
        validTips.value = `数值不能小于${params.limit}`
      } else if(keyword === 'maximum') {
        validTips.value = `数值不能大于${params.limit}`
      } else {
        console.log(validate.errors[0])
        validTips.value = '格式错误，请检查输入'
      }
      return false
    }
  }
  return true
}

/**
 * 输入框聚焦事件处理
 * 清空校验提示
 */
const onFocus = () => {
  validTips.value = null
}

/**
 * 输入框失焦事件处理
 * 触发校验
 */
const onBlur = () => {
  validate()
}

/**
 * 暴露给父组件的方法
 * - getValue: 获取输入值
 * - validate: 校验输入值
 * - name: 组件名称
 */
defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>