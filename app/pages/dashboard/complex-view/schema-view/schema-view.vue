<template>
  <el-row
    v-loading="loading"
    class="schema-view"
  >
    <search-panel
      v-if="searchSchema?.properties && Object.keys(searchSchema.properties).length > 0"
      @search="onSearch"
    />
    <table-panel
      @operate="onTableOperate"
    />
  </el-row>
</template>

<script setup>
import { ref, provide, computed } from 'vue';
import SearchPanel from './complex-view/search-panel/search-panel.vue'
import TablePanel from './complex-view/table-panel/table-panel.vue'
import { useSchema } from './hook/schema';

const apiParams = ref({});
// 从menulist中获取各种配置
const {
  api,
  tableSchema,
  tableConfig,
  searchSchema,
  searchConfig
} = useSchema();

const loading = computed(() => {
  return !tableSchema.value || Object.keys(tableSchema.value).length === 0
})
// 跨层级传递数据
provide('schemaViewData', {
  api,
  apiParams,
  tableSchema,
  tableConfig,
  searchSchema,
  searchConfig
});


const onSearch = (searchValObj) => {
  apiParams.value = searchValObj;
}

const onTableOperate = () => { 
}
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