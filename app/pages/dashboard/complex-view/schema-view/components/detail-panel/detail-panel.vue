<template>
  <el-drawer
    v-model="isShow"
    directory="rtl"
    size="550"
    destroy-on-close
  >
    <!--  -->
    <template #header>
      <h2>
        {{ title }}
      </h2>
    </template>
    <template #default>
      <el-card
        v-loading="loading"
        shadow="always"
        class="detail-panel"
      >
        <el-row
          v-for="(item, key) in components[name]?.schema?.properties"
          :key="key"
          type="flex"
          align="middle"
          class="row-item"
        >
          <el-row class="item-label">
            {{ item.label }}:
            <br>  
          </el-row>
          <el-row class="item-value">
            {{ formatValue(key, dotModel[key], item) }}
          </el-row>
        </el-row>
      </el-card>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, inject } from 'vue';
import $curl from '$elpisCommon/curl.js'
import { ElNotification } from 'element-plus';

const isShow = ref(false)
const loading = ref(false)
const name = ref('detailPanel')
const title = ref('')
const mainKey = ref('')
const mainValue = ref('')
const dotModel = ref({})

const {
  api,
  components
} = inject('schemaViewData')


// 显示表单
const show = (rowData) => {
  const { config } = components.value[name.value]

  title.value = config.title
  mainKey.value = config.mainKey // 表单的主键
  mainValue.value = rowData[mainKey.value] // 主键的值
  dotModel.value = {}

  isShow.value = true

  fetchFormData()
}


// 格式化显示值
const formatValue = (key, value, item) => {
  // 检查是否是状态字段（支持 status 和 shelf_status）
  if (key === 'status' || key === 'shelf_status' || item.label === '状态') {
    if (value === 0 || value === '0') {
      return '下架'
    } else if (value === 1 || value === '1') {
      return '上架'
    }
  }
  
  // 其他字段直接返回原值
  return value
}

// 获取表单数据
const fetchFormData = async () => {
   // 防止重复提交
   if(loading.value) return

  loading.value = true
  const res = await $curl({
    method: 'get',
    url: api.value,
    params: {
      [mainKey.value]: mainValue.value
    }
  })
  loading.value = false

  if(!res || !res.success || !res.data) {
    ElNotification({
      title: '提示',
      message: '获取数据失败',
      type: 'error'
    })
    return // 添加return防止继续执行
  }
  
  // 确保res.data是对象类型，如果是数字则包装成对象
  if (typeof res.data === 'object' && res.data !== null) {
    dotModel.value = res.data
  } else {
    // 如果res.data不是对象，可能是直接返回的值，需要包装
    console.warn('API返回的数据格式不正确，期望对象但收到:', typeof res.data, res.data)
    dotModel.value = {}
  }
}

defineExpose({
  show,
  name
})
</script>

<style lang="less" scoped>
.detail-panel {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border: none;
  
  .row-item {
    height: auto;
    min-height: 50px;
    line-height: 1.6;
    padding: 15px 0;
    border-bottom: 1px solid #eaeef5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-label {
      margin-right: 20px;
      width: 130px;
      font-weight: 600;
      color: #2d3748;
      font-size: 15px;
    }
    
    .item-value {
      color: #4a5568;
      font-size: 15px;
      flex: 1;
      word-break: break-word;
    }
  }
}

// 响应式设计，适配不同屏幕尺寸
@media (max-width: 768px) {
  .detail-panel {
    padding: 20px;
    
    .row-item {
      flex-direction: column;
      align-items: flex-start;
      
      .item-label {
        width: 100%;
        margin-right: 0;
        margin-bottom: 5px;
      }
    }
  }
}

// 暗色主题适配
:deep(.el-card) {
  background: transparent;
  border: none;
}

:deep(.el-drawer__body) {
  padding: 20px;
}
</style>