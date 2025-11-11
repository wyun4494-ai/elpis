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
      <el-input
        v-model="dotValue"
        :type="showPassword ? 'text' : 'password'"
        class="component"
        :class="validTips ? 'valid-border' : ''"
        :placeholder="schema.option?.placeholder || '请输入密码'"
        :minlength="schema.option?.minLength"
        :maxlength="schema.option?.maxLength"
        @focus="onFocus"
        @blur="onBlur"
      >
        <template #suffix>
          <el-icon
            class="password-toggle"
            @click="togglePasswordVisibility"
          >
            <View v-if="showPassword" />
            <Hide v-else />
          </el-icon>
        </template>
      </el-input>
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
 * 密码输入框组件
 * 专门用于密码输入，支持显示/隐藏密码功能
 *
 * 核心功能：
 * - 支持密码输入
 * - 支持显示/隐藏密码切换
 * - 支持必填校验
 * - 支持长度校验（minLength/maxLength）
 * - 支持格式校验（pattern 正则）
 * - 自动生成 placeholder（显示校验规则）
 *
 * 使用场景：
 * - 用户登录密码
 * - 用户注册密码
 * - 修改密码
 * - 确认密码
 *
 * @component PasswordInput
 */
<script setup>
import { ref, toRefs, watch, onMounted, inject } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'

const ajv = inject('ajv')

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
   * 输入值（用于数据回显）
   * @type {string}
   */
  model: {
    type: [String, Number],
    default: undefined
  },
})

const { schema, schemaKey } = props
const { model } = toRefs(props)

const name = ref('passwordInput')
const dotValue = ref()
const validTips = ref(null)
const showPassword = ref(false)

/**
 * 初始化数据
 */
const initData = () => {
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
}, {
  deep: true,
  immediate: true
})

/**
 * 切换密码显示/隐藏
 */
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

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
 * 2. 类型校验（type）
 * 3. 长度校验（minLength/maxLength）
 * 4. 格式校验（pattern 正则）
 *
 * @returns {boolean} 校验结果
 */
const validate = () => {
  validTips.value = null

  const { type } = schema

  if (schema.option?.required && !dotValue.value) {
    validTips.value = '请输入密码'
    return false
  }

  // 调用ajv校验schema
  if (dotValue.value) {
    const validateFn = ajv.compile(schema)
    const valid = validateFn(dotValue.value)
    if (!valid && validateFn.errors && validateFn.errors[0]) {
      const { keyword, params } = validateFn.errors[0]
      if (keyword === 'type') {
        validTips.value = `类型必须为${type}，请检查输入`
      } else if (keyword === 'minLength') {
        validTips.value = `密码长度不能少于${params.limit}个字符`
      } else if (keyword === 'maxLength') {
        validTips.value = `密码长度不能超过${params.limit}个字符`
      } else if (keyword === 'pattern') {
        validTips.value = `密码格式错误，请检查输入`
      } else {
        validTips.value = '密码格式错误，请检查输入'
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
 */
defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>
.password-toggle {
  cursor: pointer;
  color: #909399;
  transition: color 0.3s;

  &:hover {
    color: #606266;
  }
}
</style>

