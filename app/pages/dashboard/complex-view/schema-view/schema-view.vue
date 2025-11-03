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
      ref="tablePanelRef"
      @operate="onTableOperate"
    />
    <component
      :is="ComponentConfig[key]?.component"
      v-for="(componentItem, key) in components"
      :key="key"
      ref="comListRef"
      @command="handleComCommand"
    />
  </el-row>
</template>

<script setup>
import { ref, provide, computed, } from 'vue';
import SearchPanel from './complex-view/search-panel/search-panel.vue'
import TablePanel from './complex-view/table-panel/table-panel.vue'
import ComponentConfig from './components/component-config';
import { useSchema } from './hook/schema';

const apiParams = ref({});
// 从menulist中获取各种配置
const {
  api,
  tableSchema,
  tableConfig,
  searchSchema,
  searchConfig,
  components
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
  searchConfig,
  components,
  showComponent: ref(showComponent)
});

const comListRef = ref([]);
const tablePanelRef = ref(null);

const onSearch = (searchValObj) => {
  apiParams.value = searchValObj;
}

const eventHandlerMap = {
  showComponent: showComponent,
  viewSubCategories: viewSubCategories,
  batchRestock: batchRestock,
  batchRestore: batchRestore,
  batchPermanentDelete: batchPermanentDelete
}

// 表格操作
const onTableOperate = ({ btnConfig, rowData, selectedRows }) => {
  const { eventKey } = btnConfig;
  if(eventHandlerMap[eventKey]){
    eventHandlerMap[eventKey]({ btnConfig, rowData, selectedRows })
  } else {
    // 未处理的事件，打印日志
    console.log('未处理的事件:', eventKey, { btnConfig, rowData, selectedRows })
  }
}

// 显示组件
function showComponent({ btnConfig, rowData }) {
  const { comName } = btnConfig.eventOption;
  if(!comName) {
    console.error('请配置组件名称');
    return
  };

  const comRef = comListRef.value.find(item => item.name === comName);
  if(!comRef || typeof comRef.show !== 'function') {
    console.error('配置不正确');
    return
  };
  
  comRef.show(rowData);
}

// 查看子分类
function viewSubCategories({ btnConfig, rowData }) {
  const { parent_id, parent_name } = rowData;

  // 更新搜索条件：按 parent_id 筛选
  apiParams.value = {
    parent_id: parent_id,
    _parent_name: parent_name  // 用于面包屑显示（前端使用）
  };

  // 刷新表格
  tablePanelRef.value.loadTableData();
}

/**
 * 批量补货
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
function batchRestock({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    console.warn('未选中任何数据');
    return;
  }

  // 2. 显示批量补货对话框
  const comRef = comListRef.value.find(item => item.name === 'batchRestockDialog');
  if (!comRef || typeof comRef.show !== 'function') {
    console.error('批量补货对话框组件未找到');
    return;
  }

  comRef.show(selectedRows);
}

/**
 * 批量恢复商品
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
function batchRestore({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    console.warn('未选中任何数据');
    return;
  }

  // 2. 显示批量恢复对话框
  const comRef = comListRef.value.find(item => item.name === 'batchRestoreDialog');
  if (!comRef || typeof comRef.show !== 'function') {
    console.error('批量恢复对话框组件未找到');
    return;
  }

  comRef.show(selectedRows);
}

/**
 * 批量永久删除商品
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
function batchPermanentDelete({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    console.warn('未选中任何数据');
    return;
  }

  // 2. 显示批量永久删除对话框
  const comRef = comListRef.value.find(item => item.name === 'batchPermanentDeleteDialog');
  if (!comRef || typeof comRef.show !== 'function') {
    console.error('批量永久删除对话框组件未找到');
    return;
  }

  comRef.show(selectedRows);
}

// 处理来自子组件的命令
const handleComCommand = (data) => {
  const { event } = data;
  if(event === 'loadTableData'){
    tablePanelRef.value.loadTableData();
  }
}
</script>

<style lang="less" scoped>
.schema-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}
.loading-container {
    flex: 1;
    position: relative;
    min-height: 400px;
  }
</style>