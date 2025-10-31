<template>
  <div class="inventory-stats">
    <div class="stats-header">
      <span class="stats-title">库存分配状态</span>
      <el-tag v-if="isOverLimit" type="danger" size="small">超出限制</el-tag>
    </div>
    
    <div class="stats-progress">
      <el-progress 
        :percentage="percentage" 
        :status="progressStatus"
        :stroke-width="10"
      />
    </div>
    
    <div class="stats-details">
      <div class="stat-item">
        <span class="stat-label">总库存上限：</span>
        <span class="stat-value">{{ totalInventory || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已分配：</span>
        <span class="stat-value" :class="{ 'over-limit': isOverLimit }">
          {{ allocatedInventory }} / {{ totalInventory || 0 }}
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">剩余：</span>
        <span class="stat-value" :class="{ 'negative': remainingInventory < 0 }">
          {{ remainingInventory }}
        </span>
      </div>
    </div>
    
    <div v-if="isOverLimit" class="warning-message">
      <el-alert
        title="库存分配超出总库存上限"
        type="error"
        :description="`当前SKU库存总和（${allocatedInventory}）已超出总库存上限（${totalInventory}），请调整SKU库存或增加总库存上限。`"
        show-icon
        :closable="false"
      />
    </div>
  </div>
</template>

<script>
/**
 * 库存分配状态组件
 *
 * 功能说明：
 * - 显示总库存上限和已分配库存的对比
 * - 实时计算剩余库存
 * - 当 SKU 库存总和超出总库存上限时显示警告
 * - 使用进度条可视化库存分配情况
 *
 * @component InventoryStats
 * @example
 * <inventory-stats :total-inventory="1000" :skus="skuList" />
 */
import { computed } from 'vue'

export default {
  name: 'InventoryStats',
  props: {
    /**
     * 总库存上限
     * @type {Number}
     */
    totalInventory: {
      type: Number,
      default: 0
    },
    /**
     * SKU 列表（包含每个 SKU 的库存信息）
     * @type {Array<Object>}
     */
    skus: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    /**
     * 计算已分配库存
     * 算法说明：遍历所有 SKU，累加每个 SKU 的库存数量
     *
     * @returns {number} 已分配库存总和
     */
    const allocatedInventory = computed(() => {
      return props.skus.reduce((sum, sku) => {
        return sum + (parseInt(sku.inventory) || 0)
      }, 0)
    })

    /**
     * 计算剩余库存
     * 算法说明：总库存上限 - 已分配库存
     *
     * @returns {number} 剩余库存（可能为负数，表示超出限制）
     */
    const remainingInventory = computed(() => {
      return (props.totalInventory || 0) - allocatedInventory.value
    })

    /**
     * 判断是否超出限制
     *
     * @returns {boolean} true-超出限制，false-未超出
     */
    const isOverLimit = computed(() => {
      return allocatedInventory.value > (props.totalInventory || 0)
    })

    /**
     * 计算进度百分比
     * 算法说明：(已分配库存 / 总库存上限) × 100，最大值为 100
     *
     * @returns {number} 进度百分比（0-100）
     */
    const percentage = computed(() => {
      if (!props.totalInventory) return 0
      const percent = (allocatedInventory.value / props.totalInventory) * 100
      return Math.min(Math.round(percent), 100)
    })

    /**
     * 计算进度条状态
     * 状态规则：
     * - exception（异常）：已超出限制
     * - warning（警告）：使用率 ≥ 90%
     * - success（正常）：使用率 < 90%
     *
     * @returns {string} 进度条状态（'exception' | 'warning' | 'success'）
     */
    const progressStatus = computed(() => {
      if (isOverLimit.value) return 'exception'
      if (percentage.value >= 90) return 'warning'
      return 'success'
    })

    return {
      allocatedInventory,
      remainingInventory,
      isOverLimit,
      percentage,
      progressStatus
    }
  }
}
</script>

<style scoped>
.inventory-stats {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stats-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.stats-progress {
  margin-bottom: 16px;
}

.stats-details {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-value {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.stat-value.over-limit {
  color: #f56c6c;
}

.stat-value.negative {
  color: #f56c6c;
}

.warning-message {
  margin-top: 12px;
}
</style>
