<template>
  <div class="product-params">
    <el-form label-width="120px">
      <el-form-item
        v-for="param in params"
        :key="param.param_id"
        :label="param.param_name"
        :required="param.is_required === 1"
      >
        <!-- 输入框类型 -->
        <el-input
          v-if="param.param_type === 'input'"
          v-model="paramValues[param.param_id]"
          :placeholder="`请输入${param.param_name}`"
          @input="onParamChange"
        />
        
        <!-- 下拉框类型 -->
        <el-select
          v-else-if="param.param_type === 'select'"
          v-model="paramValues[param.param_id]"
          :placeholder="`请选择${param.param_name}`"
          clearable
          @change="onParamChange"
        >
          <el-option
            v-for="value in param.param_values"
            :key="value"
            :label="value"
            :value="value"
          />
        </el-select>
        
        <!-- 多选框类型 -->
        <el-checkbox-group
          v-else-if="param.param_type === 'checkbox'"
          v-model="paramValues[param.param_id]"
          @change="onParamChange"
        >
          <el-checkbox 
            v-for="value in param.param_values"
            :key="value"
            :label="value"
          >
            {{ value }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>

/**
 * 商品参数表单组件
 * 根据参数配置自动渲染参数表单，支持多种参数类型
 *
 * 核心功能：
 * - 支持多种参数类型（input/select/checkbox）
 * - 自动初始化参数值
 * - 支持必填参数标记
 * - 提供 getParams() 和 validate() 方法供父组件调用
 *
 * @component ProductParams
 */
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  /**
   * 参数配置列表
   * @type {Array}
   * @required
   * @example
   * [
   *   {
   *     param_id: 'PARAM001',
   *     param_name: '品牌',
   *     param_type: 'input',
   *     is_required: 1
   *   },
   *   {
   *     param_id: 'PARAM002',
   *     param_name: '产地',
   *     param_type: 'select',
   *     param_values: ['中国', '美国', '日本'],
   *     is_required: 0
   *   }
   * ]
   */
  params: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change'])

const paramValues = ref({})

/**
 * 监听参数配置变化，初始化参数值
 * checkbox 类型默认为数组，其他类型默认为空字符串
 */
watch(() => props.params, (newParams) => {
  if (newParams && newParams.length > 0) {
    newParams.forEach(param => {
      if (!paramValues.value[param.param_id]) {
        // checkbox 类型默认为数组
        paramValues.value[param.param_id] = param.param_type === 'checkbox' ? [] : ''
      }
    })
  }
}, { immediate: true, deep: true })

/**
 * 参数值变化处理
 * 触发 change 事件，通知父组件
 */
const onParamChange = () => {
  emit('change', paramValues.value)
}

/**
 * 暴露给父组件的方法
 * - getParams: 获取参数值
 * - validate: 校验必填参数
 */
defineExpose({
  getParams: () => paramValues.value,
  validate: () => {
    // TODO: 校验必填参数
    return true
  }
})
</script>

<style lang="less" scoped>
.product-params {
  padding: 10px;
  
  .el-form-item {
    margin-bottom: 18px;
  }
  
  .el-checkbox-group {
    .el-checkbox {
      margin-right: 15px;
      margin-bottom: 10px;
    }
  }
}
</style>

