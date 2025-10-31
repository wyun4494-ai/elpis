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

/**
 * 步骤条组件
 * 基于 Element Plus Steps 组件封装，用于显示多步骤流程
 *
 * 核心功能：
 * - 显示当前步骤进度
 * - 支持自定义步骤标题、描述、图标
 * - 支持多种样式模式（默认/嵌套/紧凑）
 *
 * @component StepsIndicator
 */
<script setup>
defineProps({
  /**
   * 当前激活步骤的索引（从 0 开始）
   * @type {number}
   * @default 0
   */
  active: {
    type: Number,
    default: 0
  },

  /**
   * 步骤配置列表
   * @type {Array}
   * @required
   * @example
   * [
   *   { title: '填写基本信息', description: '商品名称、分类、品牌等' },
   *   { title: '配置SKU规格', description: '设置商品规格和库存' },
   *   { title: '完成', description: '提交保存' }
   * ]
   */
  steps: {
    type: Array,
    default: () => []
  },

  /**
   * 完成步骤的状态
   * @type {string}
   * @default 'success'
   * @values 'wait' | 'process' | 'finish' | 'error' | 'success'
   */
  finishStatus: {
    type: String,
    default: 'success'
  },

  /**
   * 是否居中对齐
   * @type {boolean}
   * @default true
   */
  alignCenter: {
    type: Boolean,
    default: true
  },

  /**
   * 自定义样式类名
   * @type {string}
   * @default ''
   * @values '' | 'nested' | 'compact'
   */
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

