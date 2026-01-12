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
import { ElMessageBox, ElNotification } from 'element-plus';
import $curl from '$elpisCommon/curl.js';
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
  batchPermanentDelete: batchPermanentDelete,
  batchShelfOn: batchShelfOn,
  batchShelfOff: batchShelfOff,
  batchDelete: batchDelete,
  batchApprove: batchApprove,
  batchReject: batchReject,
  batchEnable: (params) => handleGenericBatchAction(params),
  batchDisable: (params) => handleGenericBatchAction(params),
  // 订单管理自定义事件
  exportOrders: (params) => handleCustomComponentEvent('orderListHandler', 'exportOrders', params),
  batchDeliver: (params) => handleCustomComponentEvent('orderListHandler', 'batchDeliver', params),
  batchCancel: (params) => handleCustomComponentEvent('orderListHandler', 'batchCancel', params)
}

// 表格操作
const onTableOperate = ({ btnConfig, rowData, selectedRows }) => {
  const { eventKey } = btnConfig;
  if(eventHandlerMap[eventKey]){
    eventHandlerMap[eventKey]({ btnConfig, rowData, selectedRows })
  } else {
    // 未处理的事件，尝试调用自定义组件方法
    const handled = tryHandleCustomEvent(eventKey, { btnConfig, rowData, selectedRows });
    if (!handled) {
      console.log('未处理的事件:', eventKey, { btnConfig, rowData, selectedRows })
    }
  }
}

/**
 * 处理自定义组件事件
 * @param {string} componentName - 组件名称
 * @param {string} methodName - 方法名称
 * @param {Object} params - 参数
 */
function handleCustomComponentEvent(componentName, methodName, params) {
  const comRef = comListRef.value.find(item => item.name === componentName);
  if (!comRef) {
    console.error(`组件 ${componentName} 未找到`);
    return false;
  }

  if (typeof comRef[methodName] !== 'function') {
    console.error(`组件 ${componentName} 没有 ${methodName} 方法`);
    return false;
  }

  // 传递搜索参数和选中行
  comRef[methodName]({
    searchParams: apiParams.value,
    selectedRows: params.selectedRows,
    loadTableData: () => tablePanelRef.value?.loadTableData()
  });
  return true;
}

/**
 * 尝试处理自定义事件（通用方法）
 * @param {string} eventKey - 事件键
 * @param {Object} params - 参数
 */
function tryHandleCustomEvent(eventKey, params) {
  // 遍历所有注册的组件，查找是否有对应的方法
  for (const comRef of comListRef.value) {
    if (typeof comRef[eventKey] === 'function') {
      comRef[eventKey]({
        searchParams: apiParams.value,
        selectedRows: params.selectedRows,
        loadTableData: () => tablePanelRef.value?.loadTableData()
      });
      return true;
    }
  }
  return false;
}

// 显示组件
function showComponent({ btnConfig, rowData }) {
  const { comName, mode } = btnConfig.eventOption;
  if(!comName) {
    console.error('请配置组件名称');
    return
  };

  const comRef = comListRef.value.find(item => item.name === comName);
  if(!comRef || typeof comRef.show !== 'function') {
    console.error('配置不正确');
    return
  };

  // 如果配置了 mode 参数，传递给组件的 show 方法
  if (mode) {
    comRef.show(rowData, mode);
  } else {
    comRef.show(rowData);
  }
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

/**
 * 批量审核通过
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
function batchApprove({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    console.warn('未选中任何数据');
    return;
  }

  // 2. 显示批量审核对话框
  const comRef = comListRef.value.find(item => item.name === 'batchAuditDialog');
  if (!comRef || typeof comRef.show !== 'function') {
    console.error('批量审核对话框组件未找到');
    return;
  }

  comRef.show(selectedRows, 'approve');
}

/**
 * 批量审核拒绝
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
function batchReject({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    console.warn('未选中任何数据');
    return;
  }

  // 2. 显示批量审核对话框
  const comRef = comListRef.value.find(item => item.name === 'batchAuditDialog');
  if (!comRef || typeof comRef.show !== 'function') {
    console.error('批量审核对话框组件未找到');
    return;
  }

  comRef.show(selectedRows, 'reject');
}

/**
 * 通用批量操作处理函数
 * 用于处理简单的批量操作（如批量启用、批量禁用等）
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
async function handleGenericBatchAction({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    ElNotification({
      title: '警告',
      message: '请先选择要操作的数据',
      type: 'warning'
    });
    return;
  }

  // 2. 从 btnConfig 中获取配置
  const { label, eventKey, eventOption } = btnConfig;
  const api = eventOption?.api;
  const dataKey = eventOption?.dataKey || 'ids';
  const primaryKey = eventOption?.primaryKey || 'id';

  if (!api) {
    console.error('批量操作缺少 API 配置:', eventKey);
    return;
  }

  try {
    // 3. 确认操作
    await ElMessageBox.confirm(
      `确定要${label} ${selectedRows.length} 条数据吗？`,
      '批量操作确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 4. 提取主键列表
    const ids = selectedRows.map(item => item[primaryKey]);

    // 5. 调用批量操作 API
    const res = await $curl({
      method: 'post',
      url: api,
      data: {
        [dataKey]: ids
      },
      successMessage: `${label}成功`,
      errorMessage: `${label}失败`
    });

    if (res && res.success) {
      // 6. 刷新表格数据
      tablePanelRef.value.loadTableData();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Generic batch action error:', error);
    }
  }
}

/**
 * 批量上架商品
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
async function batchShelfOn({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    ElNotification({
      title: '警告',
      message: '请先选择要上架的商品',
      type: 'warning'
    });
    return;
  }

  try {
    // 2. 确认操作
    await ElMessageBox.confirm(
      `确定要上架 ${selectedRows.length} 个商品吗？`,
      '批量上架确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 3. 提取商品 ID 列表
    const productIds = selectedRows.map(item => item.product_id);

    // 4. 调用批量上架 API
    const res = await $curl({
      method: 'post',
      url: '/api/proj/product/batch/shelf-on',
      data: {
        product_ids: productIds
      },
      successMessage: '批量上架成功',
      errorMessage: '批量上架失败'
    });

    if (res && res.success) {
      // 5. 刷新表格数据
      tablePanelRef.value.loadTableData();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch shelf on error:', error);
    }
  }
}

/**
 * 批量下架商品
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
async function batchShelfOff({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    ElNotification({
      title: '警告',
      message: '请先选择要下架的商品',
      type: 'warning'
    });
    return;
  }

  try {
    // 2. 确认操作
    await ElMessageBox.confirm(
      `确定要下架 ${selectedRows.length} 个商品吗？`,
      '批量下架确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 3. 提取商品 ID 列表
    const productIds = selectedRows.map(item => item.product_id);

    // 4. 调用批量下架 API
    const res = await $curl({
      method: 'post',
      url: '/api/proj/product/batch/shelf-off',
      data: {
        product_ids: productIds
      },
      successMessage: '批量下架成功',
      errorMessage: '批量下架失败'
    });

    if (res && res.success) {
      // 5. 刷新表格数据
      tablePanelRef.value.loadTableData();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch shelf off error:', error);
    }
  }
}

/**
 * 批量删除商品
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Array} params.selectedRows - 选中的行数据
 */
async function batchDelete({ btnConfig, selectedRows }) {
  // 1. 检查是否选中了数据
  if (!selectedRows || selectedRows.length === 0) {
    ElNotification({
      title: '警告',
      message: '请先选择要删除的商品',
      type: 'warning'
    });
    return;
  }

  try {
    // 2. 确认操作（带输入框，可选填删除原因）
    const { value: deleteReason } = await ElMessageBox.prompt(
      `确定要删除 ${selectedRows.length} 个商品吗？删除后可在回收站中恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputPlaceholder: '请输入删除原因（可选）',
        inputType: 'textarea'
      }
    );

    // 3. 提取商品 ID 列表
    const productIds = selectedRows.map(item => item.product_id);

    // 4. 调用批量删除 API
    const res = await $curl({
      method: 'post',
      url: '/api/proj/product/batch/delete',
      data: {
        product_ids: productIds,
        delete_reason: deleteReason || ''
      },
      successMessage: '批量删除成功',
      errorMessage: '批量删除失败'
    });

    if (res && res.success) {
      // 5. 刷新表格数据
      tablePanelRef.value.loadTableData();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch delete error:', error);
    }
  }
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