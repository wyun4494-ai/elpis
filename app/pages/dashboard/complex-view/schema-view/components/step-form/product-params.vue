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

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  params: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change'])

const paramValues = ref({})

// 初始化
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

// 参数值变化
const onParamChange = () => {
  emit('change', paramValues.value)
}

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

