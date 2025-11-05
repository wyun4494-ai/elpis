import switchComponent from "./complex-view/switch/switch.vue"
import priceItemNumberComponent from "./complex-view/price-item-number/price-item-number.vue"
import imageComponent from "./complex-view/image/image.vue"
import textFormatComponent from "./complex-view/text-format/text-format.vue"
import skuStatusComponent from "./complex-view/sku-status/sku-status.vue"
import auditStatusButtonComponent from "./complex-view/audit-status-button/audit-status-button.vue"

// 表格列组件配置
const TableItemConfig = {
  switch: {
    component: switchComponent
  },
  priceItemNumber: {
    component: priceItemNumberComponent
  },
  image: {
    component: imageComponent
  },
  textFormat: {
    component: textFormatComponent
  },
  skuStatus: {
    component: skuStatusComponent
  },
  auditStatusButton: {
    component: auditStatusButtonComponent
  }
}

export default TableItemConfig

