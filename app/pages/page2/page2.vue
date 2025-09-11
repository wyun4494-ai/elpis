<template>
  <h1>page2</h1>
  <input
    v-model="content"
    type="text"
    placeholder="请输入内容"
  >
  <div>{{ content }}</div>
</template>

<script setup>
  import { ref } from 'vue'
  const content = ref('')
  console.log('page2 init')
</script>

<style lang="less" scoped>
h1{
  color: green;
}
</style>