<template>
  <el-drawer
    v-model="isShow"
    directory="rtl"
    size="550"
    destroy-on-close
  >
  <!--  -->
  </el-drawer>
</template>

<script setup>
import { ref } from 'vue';

const  name = ref('editForm')
const isShow = ref(false)

const show = (rowData) => {
  isShow.value = true
}

defineExpose({
  name,
  show
})
</script>

<style lang="less" scoped>

</style>