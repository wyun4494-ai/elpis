<template>
  <h1>page1</h1>
  <input
    v-model="content" 
    type="text" 
    placeholder="请输入内容"
  >
  <div>{{ content }}</div>
  <div>{{ name }}</div>
</template>

<script setup>
import { ref } from 'vue'
const content = ref('')
const name = ref('xiaowu')
console.log('page1 init')
</script>

<style lang="less" scoped>
h1 {
  color: red;
}
</style>