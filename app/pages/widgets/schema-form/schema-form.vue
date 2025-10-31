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

/**
 * Schema 表单组件
 * 根据 formSchema 配置自动渲染表单，支持多种表单控件类型和校验规则
 *
 * 核心功能：
 * - 自动解析 formSchema 生成表单项
 * - 支持多种表单控件（input/select/cascader/remote-select/upload/tag-input/attribute-config/param-selector）
 * - 支持表单校验（必填、格式校验）
 * - 支持表单数据回显（编辑模式）
 * - 提供 getValue() 和 validate() 方法供父组件调用
 *
 * @component SchemaForm
 */
<script setup>
import { toRefs, ref, provide } from 'vue';
import FormItemConfig from './form-item-config';

// 提供 ajv 校验器给子组件使用
const Ajv = require('ajv')
const ajv = new Ajv()
provide('ajv', ajv)

const props = defineProps({
  /**
   * 表单 Schema 配置
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
   *         visible: true,
   *         disabled: false,
   *         required: true,
   *         placeholder: '请输入商品名称'
   *       }
   *     },
   *     category_id: {
   *       type: 'string',
   *       label: '商品分类',
   *       option: {
   *         comType: 'cascader',
   *         required: true,
   *         api: '/api/proj/category/tree'
   *       }
   *     },
   *     brand_id: {
   *       type: 'string',
   *       label: '品牌',
   *       option: {
   *         comType: 'remote-select',
   *         required: true,
   *         api: '/api/proj/brand/search'
   *       }
   *     }
   *   }
   * }
   */
  schema: {
    type: Object,
    default: () => ({})
  },

  /**
   * 表单数据（用于数据回显）
   * @type {Object}
   * @example { product_name: 'iPhone 15', category_id: 'CAT001', brand_id: 'BRAND001' }
   */
  model: {
    type: Object,
    default: () => ({})
  },
})

const { schema } = toRefs(props)

const formComList = ref([])

/**
 * 获取表单值
 * 遍历所有表单项组件，收集表单数据
 *
 * @returns {Object} 表单数据对象
 */
const getValue = () => {
  return formComList.value.reduce((dtoObj, component) => {
    return dtoObj = {
      ...dtoObj,
      ...component.getValue()
    }
  }, {})
}

/**
 * 表单校验
 * 遍历所有表单项组件，执行校验规则
 *
 * @returns {boolean} 校验是否通过（true=通过，false=不通过）
 */
const validate = () => {
  return formComList.value.every(item => {
    return item.validate()
  })
}

/**
 * 暴露给父组件的方法
 * - getValue: 获取表单值
 * - validate: 表单校验
 */
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