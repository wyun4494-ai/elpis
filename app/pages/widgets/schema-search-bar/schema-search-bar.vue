<template>
  <el-form
    v-if="schema && schema.properties"
    class="schema-search-bar"
    :inline="true"
  >
    <!-- 动态组件 -->
    <el-form-item
      v-for="(schemaItem, key) in schema.properties"
      :key="key"
      :label="schemaItem.option?.label || schemaItem.label"
    >
      <!-- 展示子组件 -->
      <component
        :is="SearchItemConfig[schemaItem.option?.comType]?.component"
        ref="searchComList"
        :schema-key="key"
        :schema="schemaItem"
        @loaded="handleChildLoaded"
      />
    </el-form-item>
    <!-- 操作区域 -->
    <el-form-item>
      <el-button
        plain
        type="primary"
        class="search-btn"
        @click="search"
      >
        搜索
      </el-button>
      <el-button
        plain
        class="reset-btn"
        @click="reset"
      >
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

/**
 * Schema 搜索栏组件
 * 根据 searchSchema 配置自动渲染搜索条件，支持多种搜索控件类型
 *
 * 核心功能：
 * - 自动解析 searchSchema 生成搜索项
 * - 支持多种搜索控件（input/select/cascader/remote-select/date-picker）
 * - 支持搜索和重置操作
 * - 自动触发 load 事件（组件加载完成时）
 * - 提供 getValue() 和 reset() 方法供父组件调用
 *
 * @component SchemaSearchBar
 */
<script setup>
import { ref, toRefs} from 'vue'
import SearchItemConfig from './search-item-config'

const props = defineProps({
  /**
   * 搜索 Schema 配置
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
   *         comType: 'input',
   *         placeholder: '请输入商品名称'
   *       }
   *     },
   *     category_id: {
   *       type: 'string',
   *       label: '商品分类',
   *       option: {
   *         comType: 'cascader',
   *         api: '/api/proj/category/tree'
   *       }
   *     },
   *     price_range: {
   *       type: 'string',
   *       label: '价格区间',
   *       option: {
   *         comType: 'select',
   *         enumList: [
   *           { label: '0-100', value: '0-100' },
   *           { label: '100-500', value: '100-500' }
   *         ]
   *       }
   *     }
   *   }
   * }
   */
  schema: {
    type: Object,
    default: () => ({})
  }
})
const { schema } = toRefs(props)

const emit = defineEmits([ 'load', 'search', 'reset' ])

const searchComList = ref([])

/**
 * 获取搜索条件值
 * 遍历所有搜索项组件，收集搜索条件数据
 *
 * @returns {Object} 搜索条件对象
 */
const getValue = () => {
  let dtoObj = {}
  searchComList.value.forEach(component => {
    dtoObj = {
      ...dtoObj,
      ...component.getValue()
    }
  })
  return dtoObj
}

/**
 * 子组件加载完成计数器
 * 当所有子组件加载完成时，触发 load 事件
 */
let childComLoadedCount = 0
const handleChildLoaded = () => {
  childComLoadedCount++
  if (childComLoadedCount >= Object.keys(schema?.value?.properties).length) {
    emit('load', getValue())
  }
}

/**
 * 搜索按钮点击处理
 * 触发 search 事件，传递搜索条件
 */
const search = () => {
  emit('search', getValue())
}

/**
 * 重置按钮点击处理
 * 重置所有搜索项，触发 reset 事件
 */
const reset = () => {
  searchComList.value.forEach(component => {
    component.reset()
  })
  emit('reset')
}

/**
 * 暴露给父组件的方法
 * - reset: 重置搜索条件
 * - getValue: 获取搜索条件值
 */
defineExpose({
  reset,
  getValue
})
</script>

<style lang="less">
.schema-search-bar{
  min-width: 500px;

  // 库存
  .input{
    width: 100px;
  }
  // 商品名称
  .dynamic-select{ 
    width: 250px;
  }
  // 价格
  .select{
    width: 150px;
  }
  // 搜索按钮
  .search-btn{
    width: 100px;
  }
  // 重置按钮
  .reset-btn{
    width: 100px;
  }
}
</style>