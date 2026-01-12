<template>
  <el-drawer
    v-model="isShow"
    directory="rtl"
    size="550"
    destroy-on-close
  >
    <template #header>
      <h2>
        {{ title }}
      </h2>
    </template> 
    <template #default>
      <schema-form
        ref="schemaFormRef"
        v-loading="loading"
        :schema="currentSchema"
        :model="dotModel"
      />
    </template>
    <template #footer>
      <el-button
        type="primary"
        @click="save"
      >
        {{ saveBtnText }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useRoute } from 'vue-router';
import schemaForm from '$elpisWidgets/schema-form/schema-form.vue';
import $curl from '$elpisCommon/curl.js'
import { ElNotification } from 'element-plus';

const route = useRoute();
const {
  api,
  components
} = inject('schemaViewData')

const emit = defineEmits(['command'])

const name = ref('editForm')

const schemaFormRef = ref(null)
const isShow = ref(false)
const loading = ref(false)
const title = ref('')
const saveBtnText = ref('')
const mainKey = ref('')
const mainValue = ref('')
const dotModel = ref({})

// 使用 computed 确保响应式更新
const currentSchema = computed(() => {
  return components.value?.[name.value]?.schema || {}
})

const show = (rowData) => {
  const { config } = components.value[name.value]

  title.value = config.title
  saveBtnText.value = config.saveBtnText
  mainKey.value = config.mainKey // 表单的主键
  mainValue.value = rowData[mainKey.value] // 主键的值
  dotModel.value = {}

  isShow.value = true

  fetchFormData()
}
const close = () => {
  isShow.value = false
}
// 获取表单数据
const fetchFormData = async () => {
   // 防止重复提交
   if(loading.value) return

  loading.value = true

  // 构建请求参数，包含权限验证所需的参数
  const requestParams = {}

  // 添加权限验证参数
  if (route.query.key) {
    requestParams.menu_key = route.query.key
  }
  if (route.query.proj_key) {
    requestParams.proj_key = route.query.proj_key
  }

  // 构建 URL：如果主键值存在，则添加到 URL 路径中
  let url = api.value
  if (mainValue.value) {
    url = `${api.value}/${mainValue.value}`
  }

  const res = await $curl({
    method: 'get',
    url: url,
    params: requestParams
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

// 表单点击
const save = async () => {
  if(loading.value) return
  // 校验表单
  if(!schemaFormRef.value.validate()) {
    console.log('表单校验失败')
    return
  }

  loading.value = true

  // 获取表单值
  const formValues = schemaFormRef.value.getValue()

  // 构建请求数据，包含权限验证所需的参数
  const requestData = {
    [mainKey.value]: mainValue.value,
    ...formValues
  }

  // 添加权限验证参数
  if (route.query.key) {
    requestData.menu_key = route.query.key
  }
  if (route.query.proj_key) {
    requestData.proj_key = route.query.proj_key
  }

  const res = await $curl({
    method: 'put',
    url: api.value,
    data: requestData
  })
  loading.value = false
  if(!res || !res.success) {
    ElNotification({
      title: '修改失败',
      message: res?.message || '修改失败',
      type: 'error'
    })
    return
  }
  ElNotification({
    title: '修改成功',
    message: '修改成功',
    type: 'success'
  })
  close()
  emit('command', {
    event: 'loadTableData'
  })
}

defineExpose({
  name,
  show
})
</script>

<style lang="less" scoped>

</style>