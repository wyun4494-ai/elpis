import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '$store/menu'

export const useSchema = function() {
  const route = useRoute()
  const menuStore = useMenuStore()

  const api = ref('')

  // 构造 schemaConfig 相关配置， 输送给 schemaView 解释
  const buildData = function() { 
    const { key, sider_key } = route.query

    const mItem = menuStore.findMenuItem({
      key: 'key', 
      value: key ?? sider_key
    })
    if (mItem && mItem.schemaConfig) {
      const { schemaConfig: sConfig} = mItem
      api.value = sConfig.api ?? ''
    }
  }

  watch([
    () => route.query.key,
    () => route.query.sider_key,
    () => menuStore.getMenuList
  ], () => {
    buildData()
  }, { deep: true})

  onMounted(() => {
    buildData()
  })
  return { api }
}