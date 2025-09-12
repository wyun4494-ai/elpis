<template>
  <h1>page1</h1>
  <el-input
    v-model="content" 
    style="width: 300px;"
    placeholder="请输入内容"
  />
  <div>{{ content }}</div>
  <div>{{ name }}</div>
  <el-table
    :data="tableData" 
    style="width: 100%"
    border 
  >
    <el-table-column
      prop="name"
      label="Name"
      width="180"
    />
    <el-table-column
      prop="desc"
      label="desc"
      width="180"
    />
  </el-table>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import curl from '$common/curl'
const content = ref('')
console.log('page1 init')

const tableData = ref([])

onMounted(async () => { 
  const res = await curl({
    method: 'get',
    url: '/api/project/list',
    params:{
      proj_key: 'test'
    }
  })
  tableData.value = res.data
})

</script>

<style lang="less" scoped>
h1 {
  color: red;
}
</style>