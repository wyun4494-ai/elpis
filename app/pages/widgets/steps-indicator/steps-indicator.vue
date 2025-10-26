<template>
  <el-steps 
    :active="active" 
    :finish-status="finishStatus"
    :align-center="alignCenter"
    :class="['unified-steps', customClass]"
  >
    <el-step 
      v-for="(step, index) in steps"
      :key="index"
      :title="step.title"
      :description="step.description"
      :icon="step.icon"
    />
  </el-steps>
</template>

<script setup>
defineProps({
  active: {
    type: Number,
    default: 0
  },
  steps: { 
    type: Array, 
    default: () => []
  },
  finishStatus: {
    type: String,
    default: 'success'
  },
  alignCenter: {
    type: Boolean,
    default: true
  },
  customClass: {
    type: String,
    default: ''
  }
})
</script>

<style lang="less" scoped>
.unified-steps {
  margin: 20px 0 30px 0;
  padding: 0 50px;
  
  // 嵌套抽屉样式
  &.nested {
    background: #f5f7fa;
    padding: 20px 50px;
    margin: 0 0 20px 0;
    border-radius: 4px;
  }
  
  // 紧凑模式
  &.compact {
    margin: 10px 0 20px 0;
    padding: 0 20px;
  }
}
</style>

