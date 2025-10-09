<template>
  <iframe
    :src="path"
    class="iframe"
  />
</template>

<script setup>
import { useRoute } from 'vue-router' 
import { useMenuStore } from '$elpisStore/menu'
import { ref, watch, onMounted } from 'vue'

const route = useRoute()
const menuStore = useMenuStore()
const path = ref('')
const setPath = function () {
  const { sider_key, key } = route.query;
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: sider_key ?? key
  })
  path.value = menuItem?.iframeConfig?.path ?? ''
}
watch([
  () => route.query.sider_key,
  () => route.query.proj_key,
  () => menuStore.getMenuList 
], () => {
  setPath()
},{ deep: true})
onMounted(() => {
  setPath()
})
</script>


<style lang="less" scoped>
.iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>