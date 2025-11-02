<template>
  <el-card class="search-panel">
    <schema-search-bar
      :schema="searchSchema"
      @reset="onReset"
      @load="onLoad"
      @search="onSearch"
    />
  </el-card>
</template>

<script setup>
import { inject} from 'vue'
import schemaSearchBar from '$elpisWidgets/schema-search-bar/schema-search-bar.vue'
const {
  searchSchema
} = inject('schemaViewData')

const emit = defineEmits(['search'])

const onLoad = (searchValObj) => {
  emit('search', searchValObj)
}
const onSearch = (searchValObj) => {
  emit('search', searchValObj)
}
const onReset = () => {
  emit('search', {})
}
</script>

<style lang="less" scoped>
.search-panel {
  margin: 0 0 10px 0;
}
:deep(.el-card__body) {
  padding-bottom: 2px;
}

// 搜索框网格布局：每行3个，按钮在右下角
:deep(.schema-search-bar) {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0;

  .el-form-item {
    width: calc(33.333% - 10px);
    margin-right: 15px;
    margin-bottom: 15px;

    // 每行第3个元素不需要右边距
    &:nth-child(3n) {
      margin-right: 0;
    }
  }

  // 统一所有输入框宽度
  .input,
  .select,
  .dynamic-select,
  .remote-select,
  .el-input,
  .el-select {
    width: 100% !important;
  }

  // 按钮区域放在右下角
  .el-form-item:last-child {
    width: auto;
    margin-left: auto;
    margin-right: 0;

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>