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
      <div class="tag-input-container">
        <!-- 已添加的标签 -->
        <div class="tags-list">
          <el-tag
            v-for="(tag, index) in tags"
            :key="index"
            closable
            @close="removeTag(index)"
          >
            {{ tag }}
          </el-tag>
        </div>
        
        <!-- 输入框 -->
        <div class="input-row">
          <el-input
            v-model="inputValue"
            :placeholder="schema.option?.placeholder || '输入后回车添加'"
            @keyup.enter="addTag"
          />
          <el-button 
            type="primary"
            size="small"
            @click="addTag"
          >
            添加
          </el-button>
        </div>
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
 * 标签输入组件
 * 支持多标签输入，用于输入多个值的场景
 *
 * 核心功能：
 * - 支持添加/删除标签
 * - 支持回车快速添加
 * - 自动去重（不允许添加重复值）
 * - 支持必填校验
 *
 * 使用场景：
 * - 商品标签输入
 * - 关键词输入
 * - 多值输入
 *
 * @component TagInput
 */
<script setup>
import { ref, toRefs, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

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
   * 标签数组（用于数据回显）
   * @type {Array}
   * @example ['标签1', '标签2', '标签3']
   */
  model: {
    type: Array,
    default: () => []
  }
})

const { schema, schemaKey, model } = toRefs(props)

const name = ref('tagInput')
const tags = ref([])
const inputValue = ref('')
const validTips = ref('')

/**
 * 初始化数据
 * 从 model 中加载标签数据，用于数据回显
 */
const initData = () => {
  if (model.value && Array.isArray(model.value)) {
    tags.value = [...model.value]
  } else {
    tags.value = []
  }
  inputValue.value = ''
  validTips.value = ''
}

/**
 * 添加标签
 * 检查是否为空和是否重复，通过后添加到标签列表
 */
const addTag = () => {
  const value = inputValue.value.trim()

  if (!value) {
    return
  }

  // 检查是否重复
  if (tags.value.includes(value)) {
    ElMessage.warning('该值已存在')
    return
  }

  tags.value.push(value)
  inputValue.value = ''
  validate()
}

/**
 * 删除标签
 * @param {number} index - 标签索引
 */
const removeTag = (index) => {
  tags.value.splice(index, 1)
  validate()
}

/**
 * 获取表单值
 * @returns {Object} 表单值对象
 */
const getValue = () => {
  return {
    [schemaKey.value]: tags.value
  }
}

/**
 * 表单校验
 * @returns {boolean} 校验结果
 */
const validate = () => {
  validTips.value = ''

  if (schema.value.option?.required && tags.value.length === 0) {
    validTips.value = '请至少添加一个值'
    return false
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
 * - getValue: 获取标签数组
 * - validate: 校验标签
 * - name: 组件名称
 */
defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>
.tag-input-container {
  width: 100%;
  
  .tags-list {
    margin-bottom: 10px;
    min-height: 32px;
    
    .el-tag {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }
  
  .input-row {
    display: flex;
    gap: 10px;
    
    .el-input {
      flex: 1;
    }
  }
}
</style>

