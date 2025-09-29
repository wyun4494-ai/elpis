<template>
  <div
    v-if="schema && schema.properties"
    class="schema-form"
  >
    <template
      v-for="(schemaItem, key) in schema.properties"
    >
      <component
        :is="FormItemConfig[schemaItem.option?.comType].component "
        v-show="schemaItem.option?.visible !== false"
        ref="formComList"
        :schema-key="key"
        :schema="schemaItem"
        :model="model ? model[key] : undefined "
      />
    </template>
  </div>
</template>

<script setup>
import { toRefs, ref, provide } from 'vue';
import FormItemConfig from './form-item-config';

const Ajv = require('ajv')
const ajv = new Ajv()
provide('ajv', ajv)
const props = defineProps({
  /**
   * schema 配置, 结构如下
   * {
        type: 'object',
        properties: { // 板块属性
          key: {
            // 标准 schema 配置（占位）
            type: '', // 字段类型
            label: '', // 字段名称
            option: { 
              // 标准 el-component-column 配置（占位）
              comType: '', // 控件类型 input/select....
              visible: true, // 是否在 表单 中显示 默认true
              disabled: false, // 是否禁用
              required: false, // 是否必填
              default: '', // 默认值

              // 当 comType 为 select时
              enumList: [], // 下拉框可选值

            },
          },
          // ... 用户可扩展
        },
      }
   */
  schema: {
    type: Object,
    default: () => ({})
  },
  /**
   * 表单数据
   */
  model: {
    type: Object,
    default: () => ({})
  },
})

const { schema } = toRefs(props)

const formComList = ref([])
// 获取表单值
const getValue = () => {
  return formComList.value.reduce((dtoObj, component) => {
    return dtoObj = {
      ...dtoObj,
      ...component.getValue()
    }
  }, {})
}
// 表单校验
const validate = () => {  
  return formComList.value.every(item => {
    return item.validate()
  })
}

defineExpose({
  getValue,
  validate
})  
</script>

<style lang="less">
.schema-form {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .form-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    min-width: 500px;

    .item-label {
      margin-right: 15px; 
      min-width: 70px;
      text-align: left;
      font-size: 14px;
      color: #606266;
      word-break: break-all;

      .required{
        top: 2px;
        padding-left: 4px;
        font-size: 20px;
        color: #f56c6c;
      }
    }
    .item-value {
      .component{
        width: 500px;
      }
      .valid-border{
        .el-input__wrapper{
          border: 1px solid #F93F3F;
          box-shadow: 0 0 0 0;
        }
        .el-select__wrapper{
          border: 1px solid #F93F3F;
          box-shadow: 0 0 0 0;
        }
      }
    }
    .valid-tips{
      margin-left: 10px;
      height: 36px;
      line-height: 36px;
      overflow: hidden;
      color: #F93F3F;
    }
  }
}
</style>