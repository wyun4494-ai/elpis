<template>
  <el-drawer
    v-model="isShow"
    directory="rtl"
    :size="drawerSize"
    destroy-on-close
  >
    <!--  -->
    <template #header>
      <h2>
        {{ title }}
      </h2>
    </template>
    <template #default>
      <!-- 自定义组件模式 -->
      <component
        v-if="customComponent"
        :is="customComponent"
        v-loading="loading"
        :model="mainValue"
        :schema="components[name]?.schema"
        :mainKey="mainKey"
      />
      <!-- 默认详情面板模式 -->
      <el-card
        v-else
        v-loading="loading"
        shadow="always"
        class="detail-panel"
      >
        <el-row
          v-for="(item, key) in components[name]?.schema?.properties"
          :key="key"
          type="flex"
          align="middle"
          class="row-item"
          :class="{ 'html-content-row': item.comType === 'html' }"
        >
          <el-row class="item-label">
            {{ item.label }}:
            <br>
          </el-row>
          <!-- 使用原生 div 渲染富文本 HTML 内容，避免在组件上使用 v-html -->
          <!-- 已使用 DOMPurify 过滤 HTML，防止 XSS 攻击 -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="item.comType === 'html'"
            class="item-value html-content"
            v-html="sanitizeHtml(dotModel[key])"
          />
          <!-- eslint-enable vue/no-v-html -->
          <el-row
            v-else
            class="item-value"
          >
            {{ formatValue(key, dotModel[key], item) }}
          </el-row>
        </el-row>
      </el-card>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, inject, computed, markRaw } from 'vue';
import $curl from '$elpisCommon/curl.js'
import { ElNotification } from 'element-plus';
import DOMPurify from 'dompurify';
import DetailPanelConfig from '$businessDetailPanelConfig'

const isShow = ref(false)
const loading = ref(false)
const name = ref('detailPanel')
const title = ref('')
const mainKey = ref('')
const mainValue = ref('')
const dotModel = ref({})

const {
  api,
  components
} = inject('schemaViewData')

// 计算自定义组件
const customComponent = computed(() => {
  const config = components.value[name.value]?.config
  if (config && config.comType && DetailPanelConfig[config.comType]) {
    return markRaw(DetailPanelConfig[config.comType].component)
  }
  return null
})

// 计算抽屉尺寸
const drawerSize = computed(() => {
  const config = components.value[name.value]?.config
  return config?.size || '550'
})

// 显示表单
const show = (rowData) => {
  const { config } = components.value[name.value]

  title.value = config.title
  mainKey.value = config.mainKey // 表单的主键
  mainValue.value = rowData[mainKey.value] // 主键的值
  dotModel.value = {}

  isShow.value = true

  // 如果不是自定义组件，才需要获取数据
  if (!customComponent.value) {
    fetchFormData()
  }
}


// 格式化显示值
const formatValue = (key, value, item) => {
  // 如果配置了 detailPanelOption.formatter，使用自定义格式化函数
  if (item.detailPanelOption && typeof item.detailPanelOption.formatter === 'function') {
    return item.detailPanelOption.formatter(value)
  }

  // 检查是否是状态字段（支持 status 和 shelf_status）
  if (key === 'status' || key === 'shelf_status' || item.label === '状态') {
    if (value === 0 || value === '0') {
      return '下架'
    } else if (value === 1 || value === '1') {
      return '上架'
    }
  }

  // 其他字段直接返回原值
  return value
}

// 过滤 HTML 内容，防止 XSS 攻击
const sanitizeHtml = (html) => {
  if (!html) {
    return '暂无内容'
  }

  // 使用 DOMPurify 过滤 HTML，只允许安全的标签和属性
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'target', 'rel',
      'style', 'class', 'data-list-style-type',
      'colspan', 'rowspan'
    ],
    ALLOWED_STYLES: {
      '*': {
        'list-style-type': [/^(disc|circle|square|decimal|lower-alpha|upper-alpha|lower-roman|upper-roman)$/],
        'text-align': [/^(left|center|right|justify)$/],
        'color': [/^#[0-9a-fA-F]{3,6}$/],
        'background-color': [/^#[0-9a-fA-F]{3,6}$/]
      }
    }
  })
}

// 获取表单数据
const fetchFormData = async () => {
   // 防止重复提交
   if(loading.value) return

  loading.value = true
  const res = await $curl({
    method: 'get',
    url: api.value,
    params: {
      [mainKey.value]: mainValue.value
    }
  })
  loading.value = false

  if(!res || !res.success || !res.data) {
    ElNotification({
      title: '提示',
      message: '获取数据失败',
      type: 'error'
    })
    return // 添加return防止继续执行
  }
  
  // 确保res.data是对象类型，如果是数字则包装成对象
  if (typeof res.data === 'object' && res.data !== null) {
    dotModel.value = res.data
  } else {
    // 如果res.data不是对象，可能是直接返回的值，需要包装
    console.warn('API返回的数据格式不正确，期望对象但收到:', typeof res.data, res.data)
    dotModel.value = {}
  }
}

defineExpose({
  show,
  name
})
</script>

<style lang="less" scoped>
.detail-panel {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border: none;
  
  .row-item {
    height: auto;
    min-height: 50px;
    line-height: 1.6;
    padding: 15px 0;
    border-bottom: 1px solid #eaeef5;

    &:last-child {
      border-bottom: none;
    }

    .item-label {
      margin-right: 20px;
      width: 130px;
      font-weight: 600;
      color: #2d3748;
      font-size: 15px;
    }

    .item-value {
      color: #4a5568;
      font-size: 15px;
      flex: 1;
      word-break: break-word;
    }
  }

  // HTML 内容行特殊样式
  .html-content-row {
    flex-direction: column;
    align-items: flex-start !important;

    .item-label {
      width: 100%;
      margin-bottom: 10px;
    }

    .html-content {
      width: 100%;
      padding: 15px;
      background-color: #fff;
      border-radius: 8px;
      border: 1px solid #e4edf9;
      line-height: 1.8;

      :deep(h1) {
        font-size: 2em;
        font-weight: bold;
        margin: 0.67em 0;
      }

      :deep(h2) {
        font-size: 1.5em;
        font-weight: bold;
        margin: 0.75em 0;
      }

      :deep(h3) {
        font-size: 1.17em;
        font-weight: bold;
        margin: 0.83em 0;
      }

      /* 列表基础样式 - 不使用 !important，允许自定义样式和内联样式覆盖 */
      :deep(ul),
      :deep(ol) {
        list-style: revert !important;
        padding-left: 2em !important;
        margin: 1em 0 !important;
      }

      :deep(ul) {
        list-style-type: disc;
      }

      :deep(ol) {
        list-style-type: decimal;
      }

      :deep(ul li),
      :deep(ol li) {
        display: list-item !important;
        margin: 0.5em 0 !important;
      }

      /* 嵌套列表样式 - 仅在没有自定义样式类时生效 */
      :deep(ul ul:not([class*="list-style-"])) {
        list-style-type: circle;
      }

      :deep(ul ul ul:not([class*="list-style-"])) {
        list-style-type: square;
      }

      /* 自定义列表样式类（使用 !important 确保优先级最高） */
      :deep(ul.list-style-disc) {
        list-style-type: disc !important;
      }

      :deep(ul.list-style-circle) {
        list-style-type: circle !important;
      }

      :deep(ul.list-style-square) {
        list-style-type: square !important;
      }

      :deep(ol.list-style-decimal) {
        list-style-type: decimal !important;
      }

      :deep(ol.list-style-lower-alpha) {
        list-style-type: lower-alpha !important;
      }

      :deep(ol.list-style-upper-alpha) {
        list-style-type: upper-alpha !important;
      }

      :deep(ol.list-style-lower-roman) {
        list-style-type: lower-roman !important;
      }

      :deep(ol.list-style-upper-roman) {
        list-style-type: upper-roman !important;
      }

      :deep(blockquote) {
        border-left: 3px solid #dcdfe6;
        padding-left: 1em;
        margin: 1em 0;
        color: #606266;
      }

      :deep(pre) {
        background-color: #f5f7fa;
        border-radius: 4px;
        padding: 1em;
        margin: 1em 0;
        overflow-x: auto;
      }

      :deep(code) {
        background-color: #f5f7fa;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 1em 0;
      }

      :deep(a) {
        color: #409eff;
        text-decoration: underline;
      }

      :deep(a:hover) {
        color: #66b1ff;
      }

      :deep(table) {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }

      :deep(table td),
      :deep(table th) {
        border: 1px solid #dcdfe6;
        padding: 8px;
      }

      :deep(table th) {
        font-weight: bold;
        background-color: #f5f7fa;
      }
    }
  }
}

// 响应式设计，适配不同屏幕尺寸
@media (max-width: 768px) {
  .detail-panel {
    padding: 20px;
    
    .row-item {
      flex-direction: column;
      align-items: flex-start;
      
      .item-label {
        width: 100%;
        margin-right: 0;
        margin-bottom: 5px;
      }
    }
  }
}

// 暗色主题适配
:deep(.el-card) {
  background: transparent;
  border: none;
}

:deep(.el-drawer__body) {
  padding: 20px;
}
</style>