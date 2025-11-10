import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '$elpisStore/menu'
import { cloneDeep } from 'lodash';
export const useSchema = function() {
  const route = useRoute()
  const menuStore = useMenuStore()

  const api = ref('')
  const tableConfig = ref()
  const tableSchema = ref({})
  const searchConfig = ref()
  const searchSchema = ref({})
  const components = ref()

  // 构造 schemaConfig 相关配置， 输送给 schemaView 解释
  const buildData = function() {
    const { key, sider_key } = route.query

    // 添加菜单项存在性检查
    if (!key && !sider_key) {
      resetSchemaData()
      return
    }
    if (!menuStore.menuList || menuStore.menuList.length === 0) {
      // 初始化早期静默返回，等 watch 触发
      return
    }

    const mItem = menuStore.findMenuItem({
      key: 'key',
      value: sider_key ?? key
    })

    // 不是 schema 模块时，清空并退出（不警告）
    if (!mItem || mItem.moduleType !== 'schema') {
      resetSchemaData()
      return
    }

    const sConfig = mItem.schemaConfig
    if (!sConfig) {
      // 理论上继承后会有；异常也静默，避免刷屏
      resetSchemaData()
      return
    }
  
    const configSchema = cloneDeep((sConfig.schema ?? {}))
    api.value = sConfig.api ?? ''
    tableConfig.value = undefined
    tableSchema.value = {}
    searchConfig.value = undefined
    searchSchema.value = {}
    components.value = {}

    // 构造 tableSchema 和 tableConfig
    tableSchema.value = buildDtoSchema(configSchema, 'table')
    // 将 primaryKey 添加到 tableSchema 中
    if (sConfig.primaryKey) {
      tableSchema.value.primaryKey = sConfig.primaryKey
    }
    tableConfig.value = sConfig.tableConfig ?? {}

    // 构造 searchSchema 和 searchConfig
    const dtoSearchSchema = buildDtoSchema(configSchema, 'search')
    // 循环遍历searchSchema的属性，将路由参数的值赋给searchSchema的属性的option的default属性
    for(const key in dtoSearchSchema.properties) {
      if(route.query[key] !== undefined) {
        dtoSearchSchema.properties[key].option.default = route.query[key]
      }
    }
    searchSchema.value = dtoSearchSchema
    searchConfig.value = sConfig.searchConfig ?? {}

    // 构造 components = { comKey: { schema:{} config: {} }
    const { componentConfig } = sConfig
    if(componentConfig && Object.keys(componentConfig).length > 0){
      const dtoComponents = {}

      for(const comKey in componentConfig) {
        dtoComponents[comKey] = {
          schema: buildDtoSchema(configSchema, comKey),
          config: componentConfig[comKey]
        }
      }
      components.value = dtoComponents
    }
  }

// 重置所有schema相关数据为默认值
const resetSchemaData = function() {
  tableSchema.value = {}
  tableConfig.value = {}
  searchConfig.value = {}
  searchSchema.value = {}
  api.value = ''
  components.value = {}
}

  // 通用构建 schema 方法 （清除掉无效字段）
  const buildDtoSchema = (_schema, comName) => {
    if (!_schema?.properties) return {}

    const dtoSchema = {
      type: 'object',
      properties: {}
    }

    // 提取有效 schema 字段信息
    // 循环遍历每个properties字段属性
    for (const key in _schema.properties) {
      // 拿取properties下的每个字段key
      const props = _schema.properties[key]
      // 筛选出需要显示的字段
      if (props[`${comName}Option`]) {
        let dtoProps = {}
        // 循环遍历key下的每个属性
        for (const pKey in props) {
          // 过滤掉非option的属性， 筛选出存储基本属性先存放到dtoProps中,
          if (pKey.indexOf('Option') < 0) {
            dtoProps[pKey] = props[pKey]
          }
        }
          // 将指定的comName的option属性存放到dtoProps中
          dtoProps = Object.assign({},dtoProps, {option: props[`${comName}Option`]})

          const { required } = _schema
          if(required && required.find(item => item === key)){
              dtoProps.option.required = true
          }

          // 为 create_time 字段添加时间格式化器（如果没有 formatter）
          if (key === 'create_time' && comName === 'table' && !dtoProps.option.formatter) {
            dtoProps.option.formatter = (value) => {
              if (!value) return '-'
              const date = new Date(value)
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              const seconds = String(date.getSeconds()).padStart(2, '0')
              return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
            }
            // 如果没有 comType，添加 textFormat
            if (!dtoProps.option.comType) {
              dtoProps.option.comType = 'textFormat'
            }
          }

          // 将处理好的字段存放到dtoSchema的properties中
          dtoSchema.properties[key] = dtoProps
      }
    }
      return dtoSchema
  }

  watch([
    () => route.query.key,
    () => route.query.sider_key,
    () => menuStore.menuList
  ], () => {
    buildData()
  }, { deep: true, immediate: true})

  return {
    api,
    tableConfig,
    tableSchema,
    searchConfig,
    searchSchema,
    components
  }
}