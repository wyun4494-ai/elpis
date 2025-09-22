<template>
  <el-row
    v-loading="loading"
    class="schema-view"
  >
    <search-panel />
    <table-panel />
  </el-row>
</template>

<script setup>
import { provide, computed } from 'vue';
import SearchPanel from './complex-view/search-panel/search-panel.vue'
import TablePanel from './complex-view/table-panel/table-panel.vue'
import { useSchema } from './hook/schema';

const {
  api,
  tableSchema,
  tableConfig
} = useSchema();

const loading = computed(() => {
  return !tableSchema.value || Object.keys(tableSchema.value).length === 0
})
// 跨层级传递数据
provide('schemaViewData', {
  api,
  tableSchema,
  tableConfig
});
</script>

<style lang="less" scoped>
.schema-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.loading-container {
    flex: 1;
    position: relative;
    min-height: 400px;
  }
</style>