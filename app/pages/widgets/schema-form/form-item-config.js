import input from "./complex-view/input/input.vue"
import inputNumber from "./complex-view/input-number/input-number.vue"
import select from "./complex-view/select/select.vue"
import switchComponent from "./complex-view/switch/switch.vue"
import cascader from "./complex-view/cascader/cascader.vue"
import remoteSelect from "./complex-view/remote-select/remote-select.vue"
import upload from "./complex-view/upload/upload.vue"
import attributeConfig from "./complex-view/attribute-config/attribute-config.vue"
import paramSelector from "./complex-view/param-selector/param-selector.vue"
import tagInput from "./complex-view/tag-input/tag-input.vue"
import tiptapEditor from "./complex-view/tiptap-editor/tiptap-editor.vue"
import passwordInput from "./complex-view/password-input/password-input.vue"

// 业务扩展 form-item 配置
import BusinessFormItemConfig from '$businessFormItemConfig'

const FormItemConfig = {
  input: {
    component: input
  },
  'input-number': {
    component: inputNumber
  },
  select: {
    component: select
  },
  switch: {
    component: switchComponent
  },
  cascader: {
    component: cascader
  },
  'remote-select': {
    component: remoteSelect
  },
  upload: {
    component: upload
  },
  'attribute-config': {
    component: attributeConfig
  },
  'param-selector': {
    component: paramSelector
  },
  'tag-input': {
    component: tagInput
  },
  'tiptap-editor': {
    component: tiptapEditor
  },
  'password-input': {
    component: passwordInput
  }
}

export default {
  ...FormItemConfig,
  ...BusinessFormItemConfig
}