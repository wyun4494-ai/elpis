<template>
  <el-select
    v-model="dtoValue"
    v-bind="schema.option"
    class="dynamic-select"
  >
    <el-option
      v-for="item in enumList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import $curl from '$elpisCommon/curl'

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



const enumList = ref([])
const fetchEnumList = async () => {
  try{
    const res = await $curl({
      method: 'get',
      url: schema.option?.api,
      params: {}
    })
    if(res?.data && Array.isArray(res.data) && res.data.length > 0){
      enumList.value.push(...res.data)
    }

  }catch(error) {
    console.log(error)
  }
}
const reset = () => {
  dtoValue.value = schema?.option?.default ?? enumList?.value[0]?.value;
  return
}
onMounted(async () => {
  await fetchEnumList()
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