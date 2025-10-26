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

<script setup>
import { ref, toRefs, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

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

const name = ref('tagInput')
const tags = ref([])
const inputValue = ref('')
const validTips = ref('')

// 初始化数据
const initData = () => {
  if (model.value && Array.isArray(model.value)) {
    tags.value = [...model.value]
  } else {
    tags.value = []
  }
  inputValue.value = ''
  validTips.value = ''
}

// 添加标签
const addTag = () => {
  const value = inputValue.value.trim()
  
  if (!value) {
    return
  }
  
  if (tags.value.includes(value)) {
    ElMessage.warning('该值已存在')
    return
  }
  
  tags.value.push(value)
  inputValue.value = ''
  validate()
}

// 删除标签
const removeTag = (index) => {
  tags.value.splice(index, 1)
  validate()
}

// 获取表单值
const getValue = () => {
  return {
    [schemaKey.value]: tags.value
  }
}

// 表单校验
const validate = () => {
  validTips.value = ''
  
  if (schema.value.option?.required && tags.value.length === 0) {
    validTips.value = '请至少添加一个值'
    return false
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

