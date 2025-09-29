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
        />
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

<script setup>
import { ref, toRefs, onMounted, computed, watch, nextTick,} from 'vue'
import $curl from '$common/curl'

const props =  defineProps({
  /**
   * schema 配置, 结构如下
   * {
  *     type: 'object',
        properties: {   
          key: { 
            ...schema, // 标准 schema 配置
            type: '', // 字段类型
            label: '', // 字段名称
            option: { 
              ...elTableColumnConfig, // 标准 el-table-column 配置
              visible: true // 是否在 表单 中显示
            }
          },
          ...}
   * }
   */
  schema: {
    type: Object,
    default: () => ({}) // 为Object类型设置默认值
  },

  /**
   * 表格数据源 api
   */
  api: {
    type: String,
    default: '' // 为String类型设置默认值
  },
  /**
   * 表格数据源 api 参数
   */
  apiParams: {
    type: Object,
    default: () => ({})
  },
  /**
   * buttons 按钮配置, 结构如下
   * [{
   *    label: '', // 按钮名称
        eventKey: '', // 按钮事件名
        eventOptions: {}, // 按钮配置
        ...elButton, // 标准 el-button 配置
   * }, ...]
   */
  buttons: {
    type: Array,
    default: () => [] // 为Array类型设置默认值
  }
})

const { schema, buttons, api, apiParams } = toRefs(props);

const emit = defineEmits(['operate']);

// 计算按钮宽度
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

onMounted(() => {  
  initData();
});

watch([api, schema, apiParams], () => { 
  initData();
}, { deep: true}) 

// 初始化数据
const initData = () => { 
  currentPage.value = 1;
  pageSize.value = 50;
  nextTick( async () => {
    await loadTableData();
  });
}

// 防抖加载表格数据
let timer = null;
const loadTableData = () => { 
  clearTimeout(timer);
  timer = setTimeout(() => { 
    fetchTableData();
    timer = null;
  }, 300);
}

// 获取表格数据
const fetchTableData = async () => { 
  if (!api.value) return;
  
  showLoading();

  // 获取数据
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
 * @param listData 列表数据
 */
const buildTableData = (listData) => {
  if (!schema?.value.properties) return listData;

  return listData.map(rowData => {
    for (const dKey in rowData) {
      const schemaItem = schema.value.properties[dKey];
      
      // 处理toFixed
      if (schemaItem?.option?.toFixed) {
        rowData[dKey] = rowData[dKey].toFixed(schemaItem.option.toFixed);
      }
  }
    return rowData;
  })
}

const showLoading = () => { 
  loading.value = true;
}

const hideLoading = () => { 
  loading.value = false;
}

// 按钮点击处理
const operationHandler = ( { btnConfig, rowData }) => {
  emit('operate', { btnConfig, rowData });
}

// 处理每页显示条目数
const onPageSizeChange = async (value) => {
  pageSize.value = value
  await loadTableData();
}

// 处理当前页码的改变
const onCurrentPageChange = async (value) => {
  currentPage.value = value
  await loadTableData();
}

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