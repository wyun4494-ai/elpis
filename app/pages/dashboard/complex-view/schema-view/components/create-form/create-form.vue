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
import { inject, ref, computed } from 'vue';
import schemaForm from '$elpisWidgets/schema-form/schema-form.vue';
import $curl from '$elpisCommon/curl.js'
import { ElNotification } from 'element-plus';
const {
  api,
  components
} = inject('schemaViewData')
const emit = defineEmits(['command'])
const title = ref('')
const saveBtnText = ref('')
// 用来外部识别组件名称
const name = ref('createForm')

// 使用 computed 确保响应式更新
const currentSchema = computed(() => {
  return components.value?.[name.value]?.schema || {}
})

const schemaFormRef = ref(null)
const loading = ref(false)

// 抽屉窗口是否显示
const isShow = ref(false)
// 显示表单
const show = () => {
  const { config } = components.value[name.value]

  title.value = config.title
  saveBtnText.value = config.saveBtnText

  isShow.value = true
}

// 关闭表单
const close = () => {
  isShow.value = false
}

// 表单点击
const save = async () => {
  // 防止重复提交
  if(loading.value) return

  // 校验表单
  if(!schemaFormRef.value.validate()) {
    console.log('表单校验失败')
    return
  }

  loading.value = true
  const res = await $curl({
    method: 'post',
    url: api.value,
    data: {
      ...schemaFormRef.value.getValue()
    }
  })
  loading.value = false
  if(!res || !res.success) {
    ElNotification({
      title: '保存失败',
      message: res?.message || '保存失败',
      type: 'error'
    })
    return
  }
  ElNotification({
    title: '创建成功',
    message: '创建成功',
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