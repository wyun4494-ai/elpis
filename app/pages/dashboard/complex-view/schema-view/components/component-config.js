import createForm from "./create-form/create-form.vue"
import editForm from "./edit-form/edit-form.vue"
import detailPanel from "./detail-panel/detail-panel.vue"
import stepForm from "./step-form/step-form.vue"
import attributeListDrawer from "./attribute-list-drawer/attribute-list-drawer.vue"
import paramListDrawer from "./param-list-drawer/param-list-drawer.vue"
import addParamFromLibrary from "./add-param-from-library/add-param-from-library.vue"
import createParamDialog from "./create-param-dialog/create-param-dialog.vue"
import restockDialog from "./restock-dialog/restock-dialog.vue"
import batchRestockDialog from "./batch-restock-dialog/batch-restock-dialog.vue"
import batchRestoreDialog from "./batch-restore-dialog/batch-restore-dialog.vue"
import batchPermanentDeleteDialog from "./batch-permanent-delete-dialog/batch-permanent-delete-dialog.vue"
import skuEditDialog from "./sku-edit-dialog/sku-edit-dialog.vue"
import auditDetailDialog from "./audit-detail-dialog/audit-detail-dialog.vue"
import batchAuditDialog from "./batch-audit-dialog/batch-audit-dialog.vue"

// 业务扩展 component 配置
import BusinessComponentConfig from '$businessComponentConfig'

const componentConfig = {
  createForm: {
    component: createForm
  },
  editForm: {
    component: editForm
  },
  detailPanel: {
    component: detailPanel
  },
  stepForm: {
    component: stepForm
  },
  attributeConfig: {
    component: attributeListDrawer
  },
  paramConfig: {
    component: paramListDrawer
  },
  addFromLibrary: {
    component: addParamFromLibrary
  },
  createParam: {
    component: createParamDialog
  },
  restockDialog: {
    component: restockDialog
  },
  batchRestockDialog: {
    component: batchRestockDialog
  },
  batchRestoreDialog: {
    component: batchRestoreDialog
  },
  batchPermanentDeleteDialog: {
    component: batchPermanentDeleteDialog
  },
  skuEditDialog: {
    component: skuEditDialog
  },
  auditDetailDialog: {
    component: auditDetailDialog
  },
  batchAuditDialog: {
    component: batchAuditDialog
  }
}

const finalConfig = {
  ...componentConfig,
  ...BusinessComponentConfig
}
export default finalConfig