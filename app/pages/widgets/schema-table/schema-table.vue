<template>
  <div class="search-panel"> 
    <!-- 表格  -->
    <el-table
      v-if="schema && schema.properties"
      v-loading="loading"
      class="table"
      :data="tableData"
    >
      <template v-for="(schemaItem, key) in schema.properties">
        <el-table-column
          v-if="schemaItem?.option?.visible !== false"
          :key="key"
          :prop="key"
          :label="schemaItem.label"
          v-bind="schemaItem?.option"
        >
          <!-- 自定义列渲染 -->
          <template v-if="schemaItem?.option?.comType" #default="scope">
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
    <!-- 分页 -->
    <el-row
      justify="end"
      class="pagination"
    >
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
import { ref, toRefs, onMounted, computed, watch, nextTick,} from 'vue'
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
  }
})

const { schema, buttons, api, apiParams } = toRefs(props);

const emit = defineEmits(['operate']);

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

// 表格数据
const loading = ref(false); // 表格加载状态
const tableData = ref([]); // 表格数据
const currentPage = ref(1); // 当前页码
const pageSize = ref(50); // 每页条数
const total = ref(0); // 数据总数

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
  nextTick( async () => {
    await loadTableData();
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

  // 调用 API 获取数据
  const res = await $curl({
    method: 'get',
    url: `${api.value}/list`,
    params: {
      ...apiParams.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }
  })

  hideLoading();

  if (!res || !Array.isArray(res.data) || !res.success) {
    tableData.value = [];
    total.value = 0;
    return;
  }
  tableData.value = buildTableData(res.data);
  total.value = res.metadata.total;
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

/**
 * 处理每页显示条目数变化
 * @param {number} value - 新的每页条目数
 */
const onPageSizeChange = async (value) => {
  pageSize.value = value
  await loadTableData();
}

/**
 * 处理当前页码变化
 * @param {number} value - 新的页码
 */
const onCurrentPageChange = async (value) => {
  currentPage.value = value
  await loadTableData();
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
  // 1. 获取主键字段名（从 schema 中查找第一个有 tableOption 的字段作为主键）
  const primaryKey = Object.keys(schema.value.properties).find(k =>
    schema.value.properties[k].tableOption
  ) || 'product_id';

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

    // 4. 调用更新 API
    const res = await $curl({
      method: 'put',
      url: api.value,
      data: updateData,
      successMessage: '更新成功',
      errorMessage: '更新失败'
    })

    if (res && res.success) {
      // 5. 更新成功：更新本地数据
      const rowIndex = tableData.value.findIndex(row => row[primaryKey] === rowData[primaryKey])
      if (rowIndex !== -1) {
        tableData.value[rowIndex][key] = value
      }
    } else {
      // 更新失败：刷新表格恢复数据
      await loadTableData()
    }
  } catch (error) {
    console.error('Column update error:', error)
    // 发生错误时刷新表格恢复数据
    await loadTableData()
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

  .table{
    flex: 1;
  }
  .pagination{
    margin: 10px 0;
    text-align: right;
  }
}

</style>