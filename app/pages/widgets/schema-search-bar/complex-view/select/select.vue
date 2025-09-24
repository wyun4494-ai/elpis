<template>
  <el-select
    v-model="dtoValue"
    v-bind="schema.option"
    class="select"
  >
    <el-option
      v-for="item in schema.option?.enumList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
import { ref, onMounted} from 'vue'

const { schema, schemaKey} = defineProps({
  schema: {
    type: Object,
    default: () => ({})
  },
  schemaKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['loaded'])

const dtoValue = ref()

const getValue = () => {
  return dtoValue.value !== undefined ? {
    [schemaKey]: dtoValue.value
  } : {}
}

const reset = () => {
  dtoValue.value = schema?.option?.default ?? schema.option?.enumList?.[0]?.value ?? '';
  return
}

onMounted(() => {
  reset()
  emit('loaded')
})

defineExpose({
  getValue,
  reset
})
</script>

<style lang="less" scoped>

</style>