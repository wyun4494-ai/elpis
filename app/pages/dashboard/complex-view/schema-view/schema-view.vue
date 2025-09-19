<template>
  <el-row class="schema-view">
    <search-panel>
      <!--  -->
    </search-panel>
    <table-panel>
      <!--  -->
    </table-panel>
  </el-row>
</template>

<script setup>
import SearchPanel from './complex-view/search-panel/search-panel.vue'
import TablePanel from './complex-view/table-panel/table-panel.vue'
import { useSchema } from './hook/schema';

const { api } = useSchema();
console.log('api', api);

</script>

<style lang="less" scoped>
.schema-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>