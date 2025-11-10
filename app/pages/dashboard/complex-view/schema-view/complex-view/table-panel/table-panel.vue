<template>
  <el-card class="table-panel">
    <!-- operation-panel -->
    <el-row
      v-if="tableConfig?.headerButtons?.length > 0"
      justify="end"
      class="operation-panel"
    >
      <el-button
        v-for="item in tableConfig?.headerButtons"
        v-bind="item"
        @click="operationHandler({ btnConfig : item})"
      >
        {{ item.label }}
      </el-button>
    </el-row>
    <!-- schema-table（组件 ） -->
    <schema-table
      ref="schemaTableRef"
      :api="api"
      :schema="tableSchema"
      :api-params="apiParams"
      :buttons="tableConfig?.rowButtons ?? []"
      :selectable="tableConfig?.selectable ?? false"
      :batch-buttons="tableConfig?.batchButtons ?? []"
      @operate="operationHandler"
      @selection-change="handleSelectionChange"
    >
      <!--  -->
    </schema-table>
  </el-card>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import $curl from '$elpisCommon/curl.js'
import {  ElMessageBox, ElNotification } from 'element-plus'
import SchemaTable from '$elpisWidgets/schema-table/schema-table.vue'

const router = useRouter()
const route = useRoute()

const {
  api,
  apiParams,
  tableSchema,
  tableConfig,
} = inject('schemaViewData')

const schemaTableRef = ref(null)
const emit = defineEmits(['operate', 'selection-change'])

const eventHandlerMap = {
  remove: removeData,
  restore: restoreData,
  permanentDelete: permanentDeleteData,
  viewSubCategories: viewSubCategories,
  navigate: navigateToPage
}

/**
 * 处理表格多选变化
 * @param {Array} selection - 选中的行数据数组
 */
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

// 获取按钮事件名
const operationHandler = ({ btnConfig, rowData, selectedRows }) => {

  const { eventKey } = btnConfig

  if (eventHandlerMap[eventKey]){
    eventHandlerMap[eventKey]({ btnConfig, rowData, selectedRows })
  } else {
     emit('operate', { btnConfig, rowData, selectedRows })
  }
}

// 删除数据
function removeData({ btnConfig, rowData })  {
  const { eventOption } = btnConfig
  if (!eventOption?.params) return;

  const { params } = eventOption

  const removeKey = Object.keys(params)[0]
  let removeValue = params[removeKey];

  const removeValueList = removeValue.split('::')
  if (removeValueList[0] === 'schema' && removeValueList[1]) {
    removeValue = rowData[removeValueList[1]]
  }

  // 先输入删除原因
  ElMessageBox.prompt(
    `确认删除 ${removeKey}: ${rowData[removeKey]} 数据吗？请输入删除原因：`,
    '删除商品',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      inputPlaceholder: '请输入删除原因',
      inputType: 'textarea',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '删除原因不能为空';
        }
        return true;
      },
      inputErrorMessage: '删除原因不能为空'
    }
  ).then( async ({ value }) => {
    schemaTableRef.value.showLoading()

    // 构建请求数据，包含权限验证所需的参数
    const requestData = {
      delete_reason: value  // 添加删除原因
    }

    // 添加权限验证参数
    if (route.query.key) {
      requestData.menu_key = route.query.key
    }
    if (route.query.proj_key) {
      requestData.proj_key = route.query.proj_key
    }

    // 构建删除 URL：将主键值添加到 URL 路径中
    const deleteUrl = `${api.value}/${removeValue}`

    const res = await $curl({
      method: 'delete',
      url: deleteUrl,
      data: requestData,
      errorMessage: '删除失败'
    })
    schemaTableRef.value.hideLoading()

    if (!res || !res.success || !res.data) {
      return
    }
    ElNotification.success({
      title: '删除成功',
      message: `${removeKey}: ${removeValue} 删除成功`,
      type: 'success'
    })

    await initTableData()
  })
  .catch(() => {
    ElNotification.info({
      title: '取消删除',
      message: '已取消删除操作',
      type: 'info'
    })
  })
}

// 恢复数据
function restoreData({ btnConfig, rowData }) {
  const { eventOption } = btnConfig
  if (!eventOption?.params) return;

  const { params } = eventOption

  const restoreKey = Object.keys(params)[0]
  let restoreValue = params[restoreKey];

  const restoreValueList = restoreValue.split('::')
  if (restoreValueList[0] === 'schema' && restoreValueList[1]) {
    restoreValue = rowData[restoreValueList[1]]
  }

  ElMessageBox.confirm(
    `确认恢复 ${restoreKey}: ${rowData[restoreKey]} 数据吗？`,
    'warning',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then( async () => {
    schemaTableRef.value.showLoading()
    const res = await $curl({
      method: 'post',
      url: '/api/proj/product/recycle/restore',
      data: {
        [restoreKey] : restoreValue
      },
      errorMessage: '恢复失败'
    })
    schemaTableRef.value.hideLoading()

    if (!res || !res.success || !res.data) {
      return
    }
    ElNotification.success({
      title: '恢复成功',
      message: `${restoreKey}: ${restoreValue} 恢复成功`,
      type: 'success'
    })

    await initTableData()
  })
  .catch(() => {
    ElNotification.info({
      title: '取消恢复',
      message: '已取消恢复操作',
      type: 'info'
    })
  })
}

// 永久删除数据
function permanentDeleteData({ btnConfig, rowData }) {
  const { eventOption } = btnConfig
  if (!eventOption?.params) return;

  const { params } = eventOption

  const deleteKey = Object.keys(params)[0]
  let deleteValue = params[deleteKey];

  const deleteValueList = deleteValue.split('::')
  if (deleteValueList[0] === 'schema' && deleteValueList[1]) {
    deleteValue = rowData[deleteValueList[1]]
  }

  ElMessageBox.confirm(
    `确认永久删除 ${deleteKey}: ${rowData[deleteKey]} 数据吗？此操作不可恢复！`,
    'error',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then( async () => {
    schemaTableRef.value.showLoading()
    const res = await $curl({
      method: 'delete',
      url: '/api/proj/product/recycle/permanent',
      data: {
        [deleteKey] : deleteValue
      },
      errorMessage: '永久删除失败'
    })
    schemaTableRef.value.hideLoading()

    if (!res || !res.success || !res.data) {
      return
    }
    ElNotification.success({
      title: '永久删除成功',
      message: `${deleteKey}: ${deleteValue} 永久删除成功`,
      type: 'success'
    })

    await initTableData()
  })
  .catch(() => {
    ElNotification.info({
      title: '取消删除',
      message: '已取消永久删除操作',
      type: 'info'
    })
  })
}

// 查看子分类
function viewSubCategories({ btnConfig, rowData }) {
  const { eventOption } = btnConfig
  if (!eventOption?.params) return;

  const { params } = eventOption
  
  // 获取参数值
  const getParamValue = (paramKey, paramValue) => {
    const valueList = paramValue.split('::')
    if (valueList[0] === 'schema' && valueList[1]) {
      return rowData[valueList[1]]
    }
    return paramValue
  }

  const parentId = getParamValue('parent_id', params.parent_id)
  const parentName = getParamValue('parent_name', params.parent_name)
  const hasChildren = getParamValue('has_children', params.has_children)

  // 检查是否有子分类
  if (hasChildren === 0 || hasChildren === '0') {
    ElNotification({
      title: '提示',
      message: `"${parentName}" 分类下暂无子分类`,
      type: 'info'
    })
    return
  }

  // 如果有子分类，触发事件让父组件更新搜索条件
  emit('operate', {
    btnConfig: {
      ...btnConfig,
      eventKey: 'viewSubCategories'
    },
    rowData: {
      parent_id: parentId,
      parent_name: parentName
    }
  })
}

// 导航到其他页面（带参数）
function navigateToPage({ btnConfig, rowData }) {
  const { eventOption } = btnConfig
  if (!eventOption || !eventOption.sider_key) return

  // 构建查询参数
  const query = {
    key: route.query.key || 'product',
    sider_key: eventOption.sider_key,
    proj_key: route.query.proj_key
  }

  // 添加自定义参数
  if (eventOption.params) {
    Object.keys(eventOption.params).forEach(key => {
      let value = eventOption.params[key]
      
      // 处理 schema::xxx 格式（从rowData中获取）
      const valueList = value.split('::')
      if (valueList[0] === 'schema' && valueList[1]) {
        value = rowData[valueList[1]]
      }
      
      query[key] = value
    })
  }

  // 导航
  router.push({
    path: route.path,
    query
  })
}

const initTableData = async () => { 
  await schemaTableRef.value.initData()
}
const loadTableData = async () => { 
  await schemaTableRef.value.loadTableData()
}

defineExpose({
  loadTableData,
  initTableData
})
</script>

<style lang="less" scoped>
.table-panel {
  flex: 1;
  margin: 0;
  width: 100%;
  height: 100%;

  .operation-panel {
    margin-bottom: 10px;
  }
}
:deep(.el-card__body) {
  height: 98%;
  display: flex;
  flex-direction: column;
}
</style>