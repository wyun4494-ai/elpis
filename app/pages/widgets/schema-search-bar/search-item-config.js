import input from './complex-view/input/input.vue'
import select from './complex-view/select/select.vue';
import dynamicSelect from './complex-view/dynamic-select/dynamic-select.vue';
import dateRange from './complex-view/date-range/date-range.vue';
import cascader from './complex-view/cascader/cascader.vue';
import remoteSelect from './complex-view/remote-select/remote-select.vue';

// 业务扩展 search-item 配置
import BusinessSearchItemConfig from '$businessSearchItemConfig'

const SearchItemConfig = {
  input: {
    component: input
  },
  select: {
    component: select
  },
  dynamicSelect: {
    component: dynamicSelect
  },
  dateRange: {
    component: dateRange
  },
  cascader: {
    component: cascader
  },
  'remote-select': {
    component: remoteSelect
  }
}

export default {
  ...SearchItemConfig,
  ...BusinessSearchItemConfig
}