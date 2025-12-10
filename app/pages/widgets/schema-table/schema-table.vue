<template>
  <div class="search-panel">
    <!-- 表格  -->
    <el-table
      v-if="schema && schema.properties"
      ref="tableRef"
      v-loading="loading"
      class="table"
      :data="tableData"
      :row-key="getRowKey"
      fit
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 多选列（如果启用） -->
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
        fixed="left"
        :reserve-selection="false"
      />

      <template v-for="(schemaItem, key) in schema.properties">
        <el-table-column
          v-if="schemaItem?.option?.visible !== false"
          :key="key"
          :prop="key"
          :label="schemaItem.label"
          v-bind="schemaItem?.option"
        >
          <!-- 自定义列渲染 -->
          <template
            v-if="schemaItem?.option?.comType"
            #default="scope"
          >
            <component
              :is="getColumnComponent(schemaItem.option.comType)"
              :schema="schemaItem"
              :model-value="scope.row[key]"
              :row-data="scope.row"
              @change="(value, rowData) => handleColumnChange(key, value, rowData)"
            />
          </template>
        </el-table-column>
      </template>
      <!-- 行为按钮组 -->
      <el-table-column
        v-if="buttons?.length > 0"
        fixed="right"
        label="操作"
        :width="operationWidth"
      >
        <template #default="scope">
          <el-button
            v-for="item in buttons"
            link
            v-bind="item"
            @click="operationHandler({ btnConfig: item, rowData: scope.row })"
          >
            {{ item.label }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 批量操作和分页 -->
    <el-row
      justify="space-between"
      align="middle"
      class="pagination"
    >
      <!-- 批量操作 -->
      <div
        v-if="selectable && batchButtons?.length > 0"
        class="batch-operation"
      >
        <el-select
          v-model="batchOperationType"
          placeholder="请选择批量操作"
          style="width: 160px"
        >
          <el-option
            v-for="item in batchButtons"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button
          type="primary"
          style="margin-left: 10px"
          @click="handleBatchOperation"
        >
          确定
        </el-button>
      </div>
      <div v-else />

      <!-- 分页 -->
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange"
        @current-change="onCurrentPageChange"
      />
    </el-row>
  </div>
</template>

/**
 * Schema 表格组件
 * 根据 tableSchema 配置自动渲染表格，支持分页、排序、筛选、操作列等功能
 *
 * 核心功能：
 * - 自动解析 tableSchema 生成表格列
 * - 支持自定义列组件（switch/image/priceItemNumber/textFormat）
 * - 支持分页和排序
 * - 支持操作列（编辑/删除/自定义按钮）
 * - 支持列内编辑（如 switch 组件快速切换状态）
 * - 自动调用 API 获取数据
 *
 * @component SchemaTable
 */
<script setup>
import { ref, toRefs, onMounted, computed, watch, nextTick, provide } from 'vue'
import { ElNotification } from 'element-plus'
import $curl from '$elpisCommon/curl'
import TableItemConfig from './table-item-config'

const props =  defineProps({
  /**
   * 表格 Schema 配置
   * @type {Object}
   * @required
   * @example
   * {
   *   type: 'object',
   *   properties: {
   *     product_name: {
   *       type: 'string',
   *       label: '商品名称',
   *       option: {
   *         width: 200,
   *         visible: true,
   *         comType: 'textFormat' // 可选：自定义列组件类型
   *       }
   *     },
   *     status: {
   *       type: 'number',
   *       label: '上架状态',
   *       option: {
   *         comType: 'switch', // switch 组件支持快速切换
   *         activeValue: 1,
   *         inactiveValue: 0
   *       }
   *     }
   *   }
   * }
   */
  schema: {
    type: Object,
    default: () => ({})
  },

  /**
   * 表格数据源 API 路径
   * @type {string}
   * @required
   * @example '/api/proj/product'
   */
  api: {
    type: String,
    default: ''
  },

  /**
   * 表格数据源 API 参数
   * @type {Object}
   * @example { category_id: 'CAT001', status: 1 }
   */
  apiParams: {
    type: Object,
    default: () => ({})
  },

  /**
   * 操作列按钮配置
   * @type {Array}
   * @example
   * [
   *   {
   *     label: '编辑',
   *     eventKey: 'edit',
   *     type: 'primary',
   *     link: true
   *   },
   *   {
   *     label: '删除',
   *     eventKey: 'delete',
   *     type: 'danger',
   *     link: true
   *   }
   * ]
   */
  buttons: {
    type: Array,
    default: () => []
  },

  /**
   * 是否启用多选功能
   * @type {Boolean}
   * @default false
   * @example true
   */
  selectable: {
    type: Boolean,
    default: false
  },

  /**
   * 批量操作按钮配置
   * @type {Array}
   * @example
   * [
   *   {
   *     label: '批量补货',
   *     value: 'batchRestock',
   *     type: 'primary'
   *   },
   *   {
   *     label: '批量删除',
   *     value: 'batchDelete',
   *     type: 'danger'
   *   }
   * ]
   */
  batchButtons: {
    type: Array,
    default: () => []
  }
})

const { schema, buttons, api, apiParams, selectable, batchButtons } = toRefs(props);

const emit = defineEmits(['operate', 'selection-change']);

/**
 * 计算操作列宽度
 * 根据按钮数量和文字长度自动计算操作列宽度
 * @returns {number} 操作列宽度（px）
 */
const operationWidth = computed( () => {
  return buttons?.value?.length > 0 ? buttons?.value.reduce(( pre, cur) => {
    return pre + cur.label.length * 18
  }, 50) : 50
})

// 表格引用
const tableRef = ref(null);

// 表格数据
const loading = ref(false); // 表格加载状态
const tableData = ref([]); // 表格数据
const currentPage = ref(1); // 当前页码
const pageSize = ref(50); // 每页条数
const total = ref(0); // 数据总数

// 排序相关
const sortField = ref(''); // 排序字段
const sortOrder = ref(''); // 排序方向（ascending/descending）

// 批量操作相关
const batchOperationType = ref(''); // 批量操作类型
const selectedRows = ref([]); // 选中的行数据

/**
 * 组件挂载时初始化数据
 */
onMounted(() => {
  initData();
});

/**
 * 监听 API、Schema、API 参数变化，自动重新加载数据
 */
watch([api, schema, apiParams], () => {
  initData();
}, { deep: true})

/**
 * 初始化数据
 * 重置分页参数并加载表格数据
 */
const initData = () => {
  currentPage.value = 1;
  pageSize.value = 50;
  nextTick(() => {
    loadTableData();
  });
}

/**
 * 防抖加载表格数据
 * 防止频繁调用 API，300ms 内只执行最后一次请求
 */
let timer = null;
const loadTableData = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchTableData();
    timer = null;
  }, 300);
}

/**
 * 获取表格数据
 * 调用 API 获取数据并更新表格
 */
const fetchTableData = async () => {
  if (!api.value) return;

  showLoading();

  // 构建请求参数
  const requestParams = {
    ...apiParams.value,
    page: currentPage.value,
    pageSize: pageSize.value
  };

  // 添加排序参数
  if (sortField.value && sortOrder.value) {
    requestParams.sort_field = sortField.value;
    requestParams.sort_order = sortOrder.value === 'ascending' ? 'asc' : 'desc';
  }

  // 注意：列表接口不需要权限验证参数
  // 权限验证只在创建、编辑、删除等修改操作时进行

  // 调用 API 获取数据
  const res = await $curl({
    method: 'get',
    url: `${api.value}/list`,
    params: requestParams
  })

  hideLoading();

  if (!res || !Array.isArray(res.data) || !res.success) {
    tableData.value = [];
    total.value = 0;
    return;
  }

  // 先清空表格数据，防止数据重复追加
  tableData.value = [];
  
  // 使用 nextTick 确保 DOM 更新后再赋值新数据
  nextTick(() => {
    tableData.value = buildTableData(res.data);
    total.value = res.metadata.total;
  });

  // 修复复选框全选按钮异常选中的 Bug
  // 问题根源：Element Plus 的全选按钮渲染状态未正确更新
  // 解决方案：在数据加载后强制清除选中状态并直接操作 DOM
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.clearSelection();

      // 强制重置内部状态
      if (tableRef.value.store && tableRef.value.store.states) {
        tableRef.value.store.states._isAllSelected = false;
      }

      // 直接操作 DOM：找到全选复选框并强制取消选中
      nextTick(() => {
        const tableEl = tableRef.value?.$el;
        if (!tableEl) return;

        // 尝试多种选择器，确保能找到全选复选框
        let headerCheckbox = tableEl.querySelector('.el-table__header-wrapper .el-checkbox__input');

        if (!headerCheckbox) {
          headerCheckbox = tableEl.querySelector('.el-table__header .el-table-column--selection .el-checkbox__input');
        }

        if (!headerCheckbox) {
          const allCheckboxes = tableEl.querySelectorAll('.el-checkbox__input');
          if (allCheckboxes.length > 0) {
            headerCheckbox = allCheckboxes[0];
          }
        }

        if (headerCheckbox) {
          headerCheckbox.classList.remove('is-checked');
          headerCheckbox.classList.remove('is-indeterminate');

          const checkboxInput = headerCheckbox.querySelector('input[type="checkbox"]');
          if (checkboxInput) {
            checkboxInput.checked = false;
            checkboxInput.indeterminate = false;
          }
        }
      });
    }
  });
}

/**
 * 处理后端返回的数据，根据 schema 配置进行数据预处理
 *
 * 预处理规则：
 * - 如果 schema 配置了 toFixed，自动格式化数字精度
 *
 * @param {Array} listData - 列表数据
 * @returns {Array} 处理后的列表数据
 */
const buildTableData = (listData) => {
  if (!schema?.value.properties) return listData;

  return listData.map(rowData => {
    for (const dKey in rowData) {
      const schemaItem = schema.value.properties[dKey];

      // 处理 toFixed（数字精度格式化）
      if (schemaItem?.option?.toFixed) {
        rowData[dKey] = rowData[dKey].toFixed(schemaItem.option.toFixed);
      }
  }
    return rowData;
  })
}

/**
 * 显示加载状态
 */
const showLoading = () => {
  loading.value = true;
}

/**
 * 隐藏加载状态
 */
const hideLoading = () => {
  loading.value = false;
}

/**
 * 按钮点击处理
 * 触发 operate 事件，传递按钮配置和行数据
 *
 * @param {Object} params - 参数对象
 * @param {Object} params.btnConfig - 按钮配置
 * @param {Object} params.rowData - 行数据
 */
const operationHandler = ( { btnConfig, rowData }) => {
  emit('operate', { btnConfig, rowData });
}

// 提供 operationHandler 给子组件（如 audit-status-button）
provide('operationHandler', operationHandler)

/**
 * 处理每页显示条目数变化
 * @param {number} value - 新的每页条目数
 */
const onPageSizeChange = (value) => {
  pageSize.value = value
  loadTableData();
}

/**
 * 处理当前页码变化
 * @param {number} value - 新的页码
 */
const onCurrentPageChange = (value) => {
  currentPage.value = value
  loadTableData();
}

/**
 * 处理表格排序变化
 * @param {Object} sortInfo - 排序信息
 * @param {string} sortInfo.prop - 排序字段名
 * @param {string} sortInfo.order - 排序方向（ascending/descending/null）
 */
const handleSortChange = ({ prop, order }) => {
  // 重新加载数据（排序后回到第一页）
  currentPage.value = 1;
  
  // 更新排序状态
  if (order) {
    sortField.value = prop;
    sortOrder.value = order;
  } else {
    // 取消排序
    sortField.value = '';
    sortOrder.value = '';
  }

  // 清空表格数据，防止排序时数据重复显示
  tableData.value = [];
  
  // 立即加载数据（不使用防抖，确保排序立即生效）
  fetchTableData();
}

/**
 * 获取表格行的唯一标识
 * 用于 Element Plus 表格的 row-key 属性
 *
 * @param {Object} row - 表格行数据
 * @returns {string|number} 行的唯一标识
 */
const getRowKey = (row) => {
  // 1. 优先使用 schema.primaryKey（如果在 schemaConfig 中配置了）
  if (schema.value.primaryKey && row[schema.value.primaryKey] !== undefined && row[schema.value.primaryKey] !== null) {
    return row[schema.value.primaryKey];
  }

  // 2. 自动检测常见的 ID 字段（按优先级）
  // ⚠️ 注意：sku_id 必须在 product_id 之前，因为库存预警等页面显示的是 SKU 数据
  // 如果 sku_id 在 product_id 之后，同一商品的多个 SKU 会有相同的 product_id，导致 key 重复
  const commonIdFields = [
    'sku_id',        // ✅ SKU ID 优先级最高（库存预警页面）
    'product_id',    // 商品 ID
    'role_id',       // 角色 ID
    'user_id',       // 用户 ID
    'id',            // 通用 ID
    'category_id',   // 分类 ID
    'brand_id',      // 品牌 ID
    'order_id'       // 订单 ID
  ];

  for (const field of commonIdFields) {
    if (row[field] !== undefined && row[field] !== null) {
      return row[field];
    }
  }

  // 3. 如果都没有，返回行数据的索引（不推荐，但作为后备方案）
  console.warn('[getRowKey] 未找到合适的唯一标识字段，使用对象引用作为 key');
  return row;
}

/**
 * 获取表格列组件
 * 根据 comType 从 TableItemConfig 中获取对应的组件
 *
 * @param {string} comType - 组件类型（switch/image/priceItemNumber/textFormat）
 * @returns {Component|string} 组件或默认的 span 标签
 */
const getColumnComponent = (comType) => {
  return TableItemConfig[comType]?.component || 'span'
}

/**
 * 处理表格多选变化
 * 当用户选中/取消选中表格行时触发
 *
 * @param {Array} selection - 当前选中的行数据数组
 */
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  emit('selection-change', selection)

  // 修复全选按钮异常显示的 Bug
  // 当选中行数不等于总行数时，强制移除全选按钮的选中状态
  if (selection.length > 0 && selection.length < tableData.value.length) {
    nextTick(() => {
      const tableEl = tableRef.value?.$el;
      if (!tableEl) return;

      const headerCheckbox = tableEl.querySelector('.el-table__header-wrapper .el-checkbox__input') ||
                            tableEl.querySelector('.el-table__header .el-table-column--selection .el-checkbox__input') ||
                            tableEl.querySelectorAll('.el-checkbox__input')[0];

      if (headerCheckbox) {
        headerCheckbox.classList.remove('is-checked');
        headerCheckbox.classList.remove('is-indeterminate');

        const checkboxInput = headerCheckbox.querySelector('input[type="checkbox"]');
        if (checkboxInput) {
          checkboxInput.checked = false;
          checkboxInput.indeterminate = false;
        }
      }
    });
  }
}

/**
 * 处理批量操作
 * 根据选择的操作类型触发对应的事件
 */
const handleBatchOperation = async () => {
  // 1. 检查是否选中了数据
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElNotification({
      title: '警告',
      message: '请先选择要操作的数据',
      type: 'warning',
      duration: 3000
    })
    return
  }

  // 2. 检查是否选择了操作类型
  if (!batchOperationType.value) {
    ElNotification({
      title: '警告',
      message: '请选择批量操作类型',
      type: 'warning',
      duration: 3000
    })
    return
  }

  // 3. 查找对应的批量操作按钮配置
  const batchButton = batchButtons.value.find(btn => btn.value === batchOperationType.value)

  if (!batchButton) {
    console.error('未找到批量操作配置:', batchOperationType.value)
    return
  }

  // 4. 触发批量操作事件（通过 operate 事件传递给父组件）
  emit('operate', {
    btnConfig: {
      ...batchButton,
      eventKey: batchButton.eventKey || batchOperationType.value
    },
    selectedRows: selectedRows.value
  })

  // 5. 清空选择
  batchOperationType.value = ''
}

/**
 * 处理列值变化（列内编辑）
 * 当用户在表格列中修改值时（如 switch 组件切换状态），自动调用 API 更新数据
 *
 * 业务流程：
 * 1. 获取主键字段名（从 schema 中查找）
 * 2. 构建更新数据（主键 + 修改的字段）
 * 3. 调用 PUT API 更新数据
 * 4. 更新成功：更新本地数据
 * 5. 更新失败：刷新表格恢复数据
 *
 * @param {string} key - 字段名
 * @param {any} value - 新值
 * @param {Object} rowData - 行数据
 */
const handleColumnChange = async (key, value, rowData) => {
  // 1. 获取主键字段名
  // 优先级：schema.primaryKey > 自动检测 > 默认值
  let primaryKey = schema.value.primaryKey;

  if (!primaryKey) {
    // 自动检测：查找第一个有 tableOption 的字段作为主键
    primaryKey = Object.keys(schema.value.properties).find(k =>
      schema.value.properties[k].tableOption
    );
  }

  if (!primaryKey) {
    // 最后的备选方案：使用常见的 ID 字段
    const commonIdFields = ['sku_id', 'product_id', 'role_id', 'user_id', 'id', 'category_id', 'brand_id', 'order_id'];
    primaryKey = commonIdFields.find(field => rowData && rowData[field] !== undefined);
  }

  // 2. 检查 rowData 是否有主键
  if (!rowData || !rowData[primaryKey]) {
    console.error('Row data is missing primary key:', primaryKey, rowData);
    return;
  }

  try {
    // 3. 构建请求数据
    const updateData = {
      [primaryKey]: rowData[primaryKey],
      [key]: value
    };

    // 4. 构建更新 URL（拼接主键到 URL 路径）
    const updateUrl = `${api.value}/${rowData[primaryKey]}`;

    // 5. 调用更新 API
    const res = await $curl({
      method: 'put',
      url: updateUrl,
      data: updateData,
      successMessage: '更新成功',
      errorMessage: '更新失败'
    })

    if (res && res.success) {
      // 6. 更新成功：更新本地数据
      const rowIndex = tableData.value.findIndex(row => row[primaryKey] === rowData[primaryKey])
      if (rowIndex !== -1) {
        tableData.value[rowIndex][key] = value
      }
    } else {
      // 更新失败：刷新表格恢复数据
      loadTableData()
    }
  } catch (error) {
    console.error('Column update error:', error)
    // 发生错误时刷新表格恢复数据
    loadTableData()
  }
}

/**
 * 暴露给父组件的方法
 * - initData: 初始化数据
 * - loadTableData: 加载表格数据
 * - hideLoading: 隐藏加载状态
 * - showLoading: 显示加载状态
 */
defineExpose({
  initData,
  loadTableData,
  hideLoading,
  showLoading
})
</script>

<style lang="less" scoped>
.search-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  width: 100%;

  .table{
    flex: 1;
    width: 100%;
  }
  .pagination{
    margin: 10px 0;
    text-align: right;
  }

  .batch-operation {
    display: flex;
    align-items: center;
  }
}

</style>

<style lang="less">
/* 修复表格列头排序按钮对齐 */
.el-table__header-wrapper .el-table__cell .cell {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.el-table__column-header-button {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.el-table__column-sorter {
  display: inline-flex;
  align-items: center;
}

.caret-wrapper {
  display: inline-flex;
  align-items: center;
}
</style>