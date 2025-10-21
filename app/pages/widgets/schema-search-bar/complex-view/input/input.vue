<template>
  <el-input
    v-model="dtoValue"
    v-bind="schema.option"
    class="input"
  />
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
  // 如果值为空字符串或undefined，则不传递该参数
  if (dtoValue.value === undefined || dtoValue.value === '') {
    return {}
  }
  return {
    [schemaKey]: dtoValue.value
  }
}

const reset = () => {
  dtoValue.value = schema?.option?.default;
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