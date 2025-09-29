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
    type: Object,
    default: () => ({})
  },
})
const { schema, schemaKey} = props
const { model } = toRefs(props)

const name = ref('select')
const dotValue = ref()
const validTips = ref(null)

// 初始化数据
const initData = () => { 
  dotValue.value = model.value && schema.option?.default
  validTips.value = null
}


onMounted(() => { 
  initData()
})
watch([model, schema], () => { 
  initData()
},{
  deep: true,
  immediate: true
})

// 获取表单值
const getValue = () => {
  return dotValue.value !== null ? {
    [schemaKey]: dotValue.value
  } : {}
}

// 表单校验
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

const onChange = () => { 
  validate()
}

defineExpose({
  getValue,
  validate,
  name
})
</script>

<style lang="less" scoped>

</style>