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
      <el-select
        v-model="dotValue"
        v-bind="schema.option"
        class="component"
        :class="validTips ? 'valid-border' : '' "
        @change="onChange"
      >
        <el-option 
          v-for="item in schema.option?.enumList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
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
 * 下拉选择组件
 * 基础表单控件，支持下拉选择
 *
 * 核心功能：
 * - 支持下拉选择（单选）
 * - 支持必填校验
 * - 支持枚举值配置（enumList）
 * - 支持数据回显
 *
 * 使用场景：
 * - 商品状态选择
 * - 分类类型选择
 * - 其他枚举值选择场景
 *
 * @component Select
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
   *   label: '商品状态',
   *   option: {
   *     enumList: [
   *       { label: '上架', value: 1 },
   *       { label: '下架', value: 0 }
   *     ],
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
   * 选中值（用于数据回显）
   * @type {string|number|boolean|Object}
   */
  model: {
    type: [String, Number, Boolean, Object],
    default: undefined
  },
})

const { schema, schemaKey} = props
const { model } = toRefs(props)

const name = ref('select')
const dotValue = ref()
const validTips = ref(null)

/**
 * 初始化数据
 * 从 model 或 schema.option.default 加载初始值
 */
const initData = () => {
  // 如果有model值，使用model值，否则使用schema中定义的默认值
  dotValue.value = model.value !== undefined ? model.value : schema.option?.default
  validTips.value = null
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
 * 2. 枚举值校验（enum）
 *
 * @returns {boolean} 校验结果
 */
const validate = () => {
  validTips.value = null

  if(schema.option?.required && !dotValue.value){
    validTips.value = '请输入内容'
    return false
  }

  // 调用ajv校验schema
  if(dotValue.value) {
    let dtoEnum = []
    if(schema.option?.enumList) {
      dtoEnum = schema.option.enumList.map(item => item.value)
    }
    const validate = ajv.compile({
      schema,
      ...{ enum : dtoEnum }
    })
    const valid = validate(dotValue.value)
    if(!valid && validate.errors && validate.errors[0]) {
      if(validate.errors[0].keyword === 'enum') {
        validTips.value = `请选择正确的选项`
      } else {
        console.log(validate.errors[0])
        validTips.value = '不符合要求'
      }
      return false
    }
  }
  return true
}

/**
 * 值变化事件处理
 * 触发校验
 */
const onChange = () => {
  validate()
}

/**
 * 暴露给父组件的方法
 * - getValue: 获取选中值
 * - validate: 校验选中值
 * - name: 组件名称
 */
defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>

</style>