<template>
  <div class="tiptap-editor-wrapper">
    <!-- 工具栏 -->
    <div
      v-if="editor"
      class="tiptap-toolbar"
    >
      <!-- 文本格式 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('bold') }"
          title="加粗"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <Icon
            icon="mdi:format-bold"
            width="18"
          />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('italic') }"
          title="斜体"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <Icon
            icon="mdi:format-italic"
            width="18"
          />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('underline') }"
          title="下划线"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <Icon
            icon="mdi:format-underline"
            width="18"
          />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('strike') }"
          title="删除线"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <Icon
            icon="mdi:format-strikethrough"
            width="18"
          />
        </button>
      </div>

      <!-- 标题 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          title="一级标题"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <Icon
            icon="mdi:format-header-1"
            width="18"
          />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          title="二级标题"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <Icon
            icon="mdi:format-header-2"
            width="18"
          />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          title="三级标题"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <Icon
            icon="mdi:format-header-3"
            width="18"
          />
        </button>
      </div>

      <!-- 列表 -->
      <div class="toolbar-group">
        <!-- 无序列表 -->
        <el-dropdown
          trigger="click"
          @command="setBulletListStyle"
        >
          <button
            type="button"
            :class="{ 'is-active': editor.isActive('bulletList') }"
            title="无序列表"
          >
            <Icon
              icon="mdi:format-list-bulleted"
              width="18"
            />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="disc">
                <Icon
                  icon="mdi:circle-small"
                  width="16"
                /> 圆点（disc）
              </el-dropdown-item>
              <el-dropdown-item command="circle">
                <Icon
                  icon="mdi:circle-outline"
                  width="16"
                /> 空心圆（circle）
              </el-dropdown-item>
              <el-dropdown-item command="square">
                <Icon
                  icon="mdi:square-small"
                  width="16"
                /> 方块（square）
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 有序列表 -->
        <el-dropdown
          trigger="click"
          @command="setOrderedListStyle"
        >
          <button
            type="button"
            :class="{ 'is-active': editor.isActive('orderedList') }"
            title="有序列表"
          >
            <Icon
              icon="mdi:format-list-numbered"
              width="18"
            />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="decimal">
                <Icon
                  icon="mdi:numeric"
                  width="16"
                /> 数字编号（1. 2. 3.）
              </el-dropdown-item>
              <el-dropdown-item command="lower-alpha">
                <Icon
                  icon="mdi:alpha-a-circle-outline"
                  width="16"
                /> 小写字母（a. b. c.）
              </el-dropdown-item>
              <el-dropdown-item command="upper-alpha">
                <Icon
                  icon="mdi:alpha-a-circle"
                  width="16"
                /> 大写字母（A. B. C.）
              </el-dropdown-item>
              <el-dropdown-item command="lower-roman">
                <Icon
                  icon="mdi:roman-numeral-1"
                  width="16"
                /> 小写罗马数字（i. ii. iii.）
              </el-dropdown-item>
              <el-dropdown-item command="upper-roman">
                <Icon
                  icon="mdi:roman-numeral-2"
                  width="16"
                /> 大写罗马数字（I. II. III.）
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 引用、代码和分割线 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('blockquote') }"
          title="引用"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <Icon
            icon="mdi:format-quote-close"
            width="18"
          />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          title="代码块"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          <Icon
            icon="mdi:code-braces"
            width="18"
          />
        </button>
        <button
          type="button"
          title="水平分割线"
          @click="editor.chain().focus().setHorizontalRule().run()"
        >
          <Icon
            icon="mdi:minus"
            width="18"
          />
        </button>
      </div>

      <!-- 图片和链接 -->
      <div class="toolbar-group">
        <button
          type="button"
          title="插入图片"
          @click="addImage"
        >
          <Icon
            icon="mdi:image-plus"
            width="18"
          />
        </button>
        <button
          type="button"
          title="插入链接"
          @click="addLink"
        >
          <Icon
            icon="mdi:link-variant-plus"
            width="18"
          />
        </button>
      </div>

      <!-- 撤销/重做 -->
      <div class="toolbar-group">
        <button
          type="button"
          :disabled="!editor.can().undo()"
          title="撤销"
          @click="editor.chain().focus().undo().run()"
        >
          <Icon
            icon="mdi:undo"
            width="18"
          />
        </button>
        <button
          type="button"
          :disabled="!editor.can().redo()"
          title="重做"
          @click="editor.chain().focus().redo().run()"
        >
          <Icon
            icon="mdi:redo"
            width="18"
          />
        </button>
      </div>

      <!-- 清除格式 -->
      <div class="toolbar-group">
        <button
          type="button"
          title="清除格式"
          @click="editor.chain().focus().clearNodes().unsetAllMarks().run()"
        >
          <Icon
            icon="mdi:format-clear"
            width="18"
          />
        </button>
      </div>

      <!-- 字体大小 -->
      <div class="toolbar-group">
        <el-select
          v-model="fontSize"
          placeholder="字号"
          size="small"
          style="width: 90px"
          @change="setFontSize"
        >
          <el-option
            v-for="item in fontSizeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 文本对齐 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
          title="左对齐"
          @click="setTextAlign('left')"
        >
          <Icon
            icon="mdi:format-align-left"
            width="18"
          />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
          title="居中对齐"
          @click="setTextAlign('center')"
        >
          <Icon
            icon="mdi:format-align-center"
            width="18"
          />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
          title="右对齐"
          @click="setTextAlign('right')"
        >
          <Icon
            icon="mdi:format-align-right"
            width="18"
          />
        </button>
      </div>

      <!-- 缩进 -->
      <div class="toolbar-group">
        <button
          type="button"
          title="减少缩进"
          @click="editor.chain().focus().outdent().run()"
        >
          <Icon
            icon="mdi:format-indent-decrease"
            width="18"
          />
        </button>
        <button
          type="button"
          title="增加缩进"
          @click="editor.chain().focus().indent().run()"
        >
          <Icon
            icon="mdi:format-indent-increase"
            width="18"
          />
        </button>
      </div>

      <!-- 颜色 -->
      <div class="toolbar-group">
        <el-popover
          :visible="textColorPickerVisible"
          placement="bottom"
          :width="260"
          trigger="click"
        >
          <template #reference>
            <button
              type="button"
              title="文本颜色"
              @click="textColorPickerVisible = !textColorPickerVisible"
            >
              <Icon
                icon="mdi:format-color-text"
                width="18"
              />
            </button>
          </template>
          <el-color-picker
            v-model="currentTextColor"
            show-alpha
            @change="setTextColor"
          />
        </el-popover>

        <el-popover
          :visible="bgColorPickerVisible"
          placement="bottom"
          :width="260"
          trigger="click"
        >
          <template #reference>
            <button
              type="button"
              title="背景色"
              @click="bgColorPickerVisible = !bgColorPickerVisible"
            >
              <Icon
                icon="mdi:format-color-highlight"
                width="18"
              />
            </button>
          </template>
          <el-color-picker
            v-model="currentBgColor"
            show-alpha
            @change="setBgColor"
          />
        </el-popover>
      </div>

      <!-- 表格 -->
      <div class="toolbar-group">
        <button
          type="button"
          title="插入表格"
          @click="addTable"
        >
          <Icon
            icon="mdi:table-plus"
            width="18"
          />
        </button>
      </div>

      <!-- 插入时间 -->
      <div class="toolbar-group">
        <el-dropdown
          trigger="click"
          @command="insertTime"
        >
          <button
            type="button"
            title="插入当前时间"
          >
            <Icon
              icon="mdi:clock-plus-outline"
              width="18"
            />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="YYYY-MM-DD HH:mm:ss">
                YYYY-MM-DD HH:mm:ss
              </el-dropdown-item>
              <el-dropdown-item command="YYYY-MM-DD">
                YYYY-MM-DD
              </el-dropdown-item>
              <el-dropdown-item command="HH:mm:ss">
                HH:mm:ss
              </el-dropdown-item>
              <el-dropdown-item command="YYYY年MM月DD日 HH:mm:ss">
                YYYY年MM月DD日 HH:mm:ss
              </el-dropdown-item>
              <el-dropdown-item command="MM/DD/YYYY">
                MM/DD/YYYY
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 预览 -->
      <div class="toolbar-group">
        <button
          type="button"
          title="预览"
          @click="previewContent"
        >
          <Icon
            icon="mdi:eye-outline"
            width="18"
          />
        </button>
      </div>
    </div>

    <!-- 编辑器内容区 -->
    <editor-content
      :editor="editor"
      class="tiptap-content"
    />

    <!-- 统计信息和保存状态 -->
    <div class="tiptap-footer">
      <div class="save-status">
        {{ saveStatus }}
      </div>
      <div class="content-stats">
        <span>字数：{{ wordCount }}</span>
        <span style="margin-left: 20px;">图片：{{ imageCount }} 张</span>
      </div>
    </div>

    <!-- 图片上传对话框 -->
    <el-dialog
      v-model="imageDialogVisible"
      title="插入图片"
      width="500px"
    >
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :on-success="handleImageUploadSuccess"
        :on-error="handleImageUploadError"
        :before-upload="beforeImageUpload"
        :show-file-list="false"
        accept="image/*"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将图片拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 jpg/png/gif 格式，单张图片不超过 2MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="imageDialogVisible = false">
          取消
        </el-button>
      </template>
    </el-dialog>

    <!-- 链接插入对话框 -->
    <el-dialog
      v-model="linkDialogVisible"
      title="插入链接"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="链接文本">
          <el-input
            v-model="linkText"
            placeholder="请输入链接文本"
          />
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input
            v-model="linkUrl"
            placeholder="请输入链接地址（如：https://example.com）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="linkDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="insertLink"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 表格插入对话框 -->
    <el-dialog
      v-model="tableDialogVisible"
      title="插入表格"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="行数">
          <el-input-number
            v-model="tableRows"
            :min="1"
            :max="10"
          />
        </el-form-item>
        <el-form-item label="列数">
          <el-input-number
            v-model="tableCols"
            :min="1"
            :max="10"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tableDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="insertTable"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="商品详情预览"
      width="80%"
    >
      <div
        class="preview-content"
        v-html="editor ? editor.getHTML() : ''"
      />
      <template #footer>
        <el-button
          type="primary"
          @click="previewDialogVisible = false"
        >
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed, onMounted } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'

const props = defineProps({
  // Schema 字段名（必需，用于 getValue 返回正确的字段名）
  schemaKey: {
    type: String,
    required: true
  },
  // Schema 配置
  schema: {
    type: Object,
    default: () => ({})
  },
  // 输入值（用于数据回显）- 与其他表单组件保持一致，使用 model 而不是 modelValue
  model: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// 上传配置
const uploadUrl = ref('/api/upload/image')
const uploadHeaders = ref({
  // 可以添加认证 token 等
})

// 图片上传对话框
const imageDialogVisible = ref(false)
const uploadRef = ref(null)

// 链接插入对话框
const linkDialogVisible = ref(false)
const linkText = ref('')
const linkUrl = ref('')

// 表格插入对话框
const tableDialogVisible = ref(false)
const tableRows = ref(3)
const tableCols = ref(3)

// 预览对话框
const previewDialogVisible = ref(false)

// 颜色选择器
const textColorPickerVisible = ref(false)
const bgColorPickerVisible = ref(false)
const currentTextColor = ref('#000000')
const currentBgColor = ref('#ffff00')

// 字体大小
const fontSize = ref('14px')
const fontSizeOptions = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' }
]

// 自动保存相关
const saveStatus = ref('已保存')
const lastSaveTime = ref('')
const autoSaveTimer = ref(null)

// 存储当前选择的列表样式（用于在 Tiptap 重新渲染后重新应用）
const currentBulletListStyle = ref('disc') // 无序列表样式：disc / circle / square
const currentOrderedListStyle = ref('decimal') // 有序列表样式：decimal / lower-alpha / upper-alpha / lower-roman / upper-roman

// 自定义 BulletList 扩展，支持 listStyleType 属性
const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: 'disc',
        parseHTML: element => element.style.listStyleType || element.getAttribute('data-list-style-type') || 'disc',
        renderHTML: attributes => {
          if (!attributes.listStyleType || attributes.listStyleType === 'disc') {
            return {}
          }
          return {
            style: `list-style-type: ${attributes.listStyleType} !important`,
            'data-list-style-type': attributes.listStyleType,
            class: `list-style-${attributes.listStyleType}`
          }
        }
      }
    }
  }
})

// 自定义 OrderedList 扩展，支持 listStyleType 属性
const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: 'decimal',
        parseHTML: element => element.style.listStyleType || element.getAttribute('data-list-style-type') || 'decimal',
        renderHTML: attributes => {
          if (!attributes.listStyleType || attributes.listStyleType === 'decimal') {
            return {}
          }
          return {
            style: `list-style-type: ${attributes.listStyleType} !important`,
            'data-list-style-type': attributes.listStyleType,
            class: `list-style-${attributes.listStyleType}`
          }
        }
      }
    }
  }
})

// 内容统计
const wordCount = computed(() => {
  if (!editor.value) return 0
  const text = editor.value.getText()
  return text.length
})

const imageCount = computed(() => {
  if (!editor.value) return 0
  const html = editor.value.getHTML()
  const matches = html.match(/<img/g)
  return matches ? matches.length : 0
})

// 初始化编辑器
// 从 schema.option 中提取配置
const placeholder = computed(() => {
  return props.schema?.option?.placeholder || '请输入内容...'
})

const disabled = computed(() => {
  return props.schema?.option?.disabled || false
})

// 初始化编辑器
const editor = useEditor({
  content: props.model,
  editable: !disabled.value,
  extensions: [
    // StarterKit 在 v3 版本中已包含 Link 和 Underline 扩展
    // 需要禁用它们以避免重复注册警告
    // 同时禁用 BulletList 和 OrderedList，使用我们的自定义扩展
    StarterKit.configure({
      // 禁用 StarterKit 中的 Link 扩展，因为我们要单独配置
      link: false,
      // 禁用 StarterKit 中的 Underline 扩展，因为我们要单独配置
      underline: false,
      // 禁用 StarterKit 中的 BulletList 和 OrderedList，使用自定义扩展
      bulletList: false,
      orderedList: false
    }),
    // 使用自定义的列表扩展（支持 listStyleType 属性）
    CustomBulletList,
    CustomOrderedList,
    // 单独配置 Underline 扩展
    Underline,
    // 单独配置 Link 扩展
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true
    }),
    Table.configure({
      resizable: true
    }),
    TableRow,
    TableHeader,
    TableCell,
    Image.configure({
      inline: true,
      allowBase64: true
    }),
    Placeholder.configure({
      placeholder: placeholder.value
    })
  ],
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html)
    saveStatus.value = '未保存'
    // 触发自动保存
    startAutoSave()
  }
})

// 监听外部值变化（model prop）
watch(() => props.model, (newValue) => {
  if (editor.value) {
    const currentValue = editor.value.getHTML()
    if (newValue !== currentValue) {
      editor.value.commands.setContent(newValue || '', false)
    }
  }
})

// 监听禁用状态
watch(() => disabled.value, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(!newValue)
  }
})

// 插入图片
const addImage = () => {
  imageDialogVisible.value = true
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 图片上传成功
const handleImageUploadSuccess = (response) => {
  if (response.success && response.data && response.data.url) {
    editor.value.chain().focus().setImage({ src: response.data.url }).run()
    imageDialogVisible.value = false
    ElMessage.success('图片插入成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

// 图片上传失败
const handleImageUploadError = () => {
  ElMessage.error('图片上传失败，请重试')
}

// 插入链接
const addLink = () => {
  const previousUrl = editor.value.getAttributes('link').href
  linkUrl.value = previousUrl || ''
  linkText.value = ''
  linkDialogVisible.value = true
}

// 确认插入链接
const insertLink = () => {
  if (!linkUrl.value) {
    ElMessage.warning('请输入链接地址')
    return
  }

  if (linkText.value) {
    // 插入新链接文本
    editor.value
      .chain()
      .focus()
      .insertContent(`<a href="${linkUrl.value}" target="_blank">${linkText.value}</a>`)
      .run()
  } else {
    // 为选中文本添加链接
    editor.value
      .chain()
      .focus()
      .setLink({ href: linkUrl.value })
      .run()
  }

  linkDialogVisible.value = false
  linkText.value = ''
  linkUrl.value = ''
}

// 插入表格
const addTable = () => {
  tableDialogVisible.value = true
}

const insertTable = () => {
  if (editor.value && tableRows.value > 0 && tableCols.value > 0) {
    editor.value
      .chain()
      .focus()
      .insertTable({ rows: tableRows.value, cols: tableCols.value, withHeaderRow: true })
      .run()
    tableDialogVisible.value = false
    ElMessage.success('表格插入成功')
  }
}

// 设置文本颜色
const setTextColor = (color) => {
  if (editor.value) {
    editor.value.chain().focus().setColor(color).run()
    currentTextColor.value = color
  }
}

// 设置背景色
const setBgColor = (color) => {
  if (editor.value) {
    editor.value.chain().focus().setHighlight({ color }).run()
    currentBgColor.value = color
  }
}

// 设置字体大小
const setFontSize = (size) => {
  if (editor.value) {
    // Tiptap 没有内置字体大小扩展，使用自定义样式
    editor.value.chain().focus().setMark('textStyle', { fontSize: size }).run()
    fontSize.value = size
  }
}

// 设置文本对齐
const setTextAlign = (align) => {
  if (editor.value) {
    editor.value.chain().focus().setTextAlign(align).run()
  }
}

// 设置无序列表样式
const setBulletListStyle = (styleType) => {
  if (!editor.value) return

  // 更新全局状态
  currentBulletListStyle.value = styleType

  // 如果当前不是无序列表，先创建无序列表
  if (!editor.value.isActive('bulletList')) {
    editor.value.chain().focus().toggleBulletList().run()
  }

  // 使用 Tiptap 的 updateAttributes API 更新列表属性
  editor.value
    .chain()
    .focus()
    .updateAttributes('bulletList', { listStyleType: styleType })
    .run()

  // 显示样式名称的中文映射
  const styleNames = {
    'disc': '圆点',
    'circle': '空心圆',
    'square': '方块'
  }

  ElMessage.success(`已设置无序列表样式：${styleNames[styleType] || styleType}`)
}

// 设置有序列表样式
const setOrderedListStyle = (styleType) => {
  if (!editor.value) return

  // 更新全局状态
  currentOrderedListStyle.value = styleType

  // 如果当前不是有序列表，先创建有序列表
  if (!editor.value.isActive('orderedList')) {
    editor.value.chain().focus().toggleOrderedList().run()
  }

  // 使用 Tiptap 的 updateAttributes API 更新列表属性
  editor.value
    .chain()
    .focus()
    .updateAttributes('orderedList', { listStyleType: styleType })
    .run()

  // 显示样式名称的中文映射
  const styleNames = {
    'decimal': '数字编号',
    'lower-alpha': '小写字母',
    'upper-alpha': '大写字母',
    'lower-roman': '小写罗马数字',
    'upper-roman': '大写罗马数字'
  }

  ElMessage.success(`已设置有序列表样式：${styleNames[styleType] || styleType}`)
}

// 预览内容
const previewContent = () => {
  previewDialogVisible.value = true
}

// 插入当前时间
const insertTime = (format) => {
  if (!editor.value) return

  const now = new Date()
  let timeString = ''

  // 辅助函数：补零
  const pad = (num) => String(num).padStart(2, '0')

  // 根据格式生成时间字符串
  switch (format) {
    case 'YYYY-MM-DD HH:mm:ss':
      timeString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      break
    case 'YYYY-MM-DD':
      timeString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      break
    case 'HH:mm:ss':
      timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      break
    case 'YYYY年MM月DD日 HH:mm:ss':
      timeString = `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      break
    case 'MM/DD/YYYY':
      timeString = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`
      break
    default:
      timeString = now.toLocaleString()
  }

  // 在光标位置插入时间字符串
  editor.value.chain().focus().insertContent(timeString).run()
  ElMessage.success(`已插入时间：${timeString}`)
}

// 自动保存草稿
const startAutoSave = () => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }

  autoSaveTimer.value = setTimeout(() => {
    saveDraft()
  }, 30000) // 30秒后自动保存
}

const saveDraft = () => {
  if (!editor.value) return

  const content = editor.value.getHTML()
  const draftKey = 'product_detail_draft_new' // 可以根据 product_id 动态设置

  try {
    localStorage.setItem(draftKey, content)
    const now = new Date()
    lastSaveTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    saveStatus.value = `草稿已保存于 ${lastSaveTime.value}`

    // 检查草稿大小
    const draftSize = new Blob([content]).size
    if (draftSize > 1024 * 1024) { // 1MB
      ElMessage.warning('草稿内容过大，建议精简内容')
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  }
}

const loadDraft = () => {
  const draftKey = 'product_detail_draft_new'
  const draft = localStorage.getItem(draftKey)

  if (draft && draft !== props.modelValue) {
    ElMessageBox.confirm(
      '检测到未保存的草稿，是否恢复？',
      '提示',
      {
        confirmButtonText: '恢复草稿',
        cancelButtonText: '放弃草稿',
        type: 'warning'
      }
    ).then(() => {
      if (editor.value) {
        editor.value.commands.setContent(draft)
        emit('update:modelValue', draft)
        ElMessage.success('草稿已恢复')
      }
    }).catch(() => {
      // 用户选择放弃草稿
      localStorage.removeItem(draftKey)
    })
  }
}

// 组件挂载时检查草稿
onMounted(() => {
  loadDraft()
})

// 组件销毁时清理编辑器和定时器
onBeforeUnmount(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  if (editor.value) {
    editor.value.destroy()
  }
})

// 暴露方法供父组件调用
// 返回格式：{ [schemaKey]: htmlString }，与其他表单组件保持一致
const getValue = () => {
  const htmlContent = editor.value ? editor.value.getHTML() : ''
  return {
    [props.schemaKey]: htmlContent
  }
}

const setValue = (value) => {
  if (editor.value) {
    editor.value.commands.setContent(value || '', false)
  }
}

// 校验方法（富文本编辑器通常不需要校验，返回 true 即可）
const validate = () => {
  return true
}

defineExpose({
  getValue,
  setValue,
  validate
})
</script>

<style scoped>
.tiptap-editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.toolbar-group {
  display: flex;
  gap: 4px;
  padding-right: 8px;
  border-right: 1px solid #dcdfe6;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-group button {
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.toolbar-group button:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.toolbar-group button.is-active {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.toolbar-group button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tiptap-content {
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  padding: 15px;
}

/* Tiptap 编辑器样式 */
.tiptap-content :deep(.ProseMirror) {
  outline: none;
  min-height: 300px;
}

/* 重置 ProseMirror 的列表样式 - 确保列表符号显示 */
.tiptap-content :deep(.ProseMirror) ul,
.tiptap-content :deep(.ProseMirror) ol {
  list-style: revert !important;
  padding-left: 2em !important;
  margin: 1em 0 !important;
}

.tiptap-content :deep(.ProseMirror) ul li,
.tiptap-content :deep(.ProseMirror) ol li {
  display: list-item !important;
  list-style: inherit !important;
}

.tiptap-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.tiptap-content :deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.tiptap-content :deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
}

.tiptap-content :deep(.ProseMirror h3) {
  font-size: 1.17em;
  font-weight: bold;
  margin: 0.83em 0;
}

/* 列表基础样式 - 不使用 !important，允许自定义样式覆盖 */
.tiptap-content :deep(.ProseMirror) ul {
  list-style-type: disc;
  padding-left: 2em !important;
  margin: 1em 0 !important;
}

.tiptap-content :deep(.ProseMirror) ol {
  list-style-type: decimal;
  padding-left: 2em !important;
  margin: 1em 0 !important;
}

/* 列表项样式 */
.tiptap-content :deep(.ProseMirror) ul li,
.tiptap-content :deep(.ProseMirror) ol li {
  display: list-item !important;
  margin: 0.5em 0 !important;
}

/* 嵌套列表样式 - 仅在没有自定义样式类时生效 */
.tiptap-content :deep(.ProseMirror) ul ul:not([class*="list-style-"]) {
  list-style-type: circle;
  margin: 0.5em 0 !important;
}

.tiptap-content :deep(.ProseMirror) ul ul ul:not([class*="list-style-"]) {
  list-style-type: square;
}

/* 自定义列表样式类 - 无序列表（使用 !important 确保优先级最高） */
.tiptap-content :deep(.ProseMirror) ul.list-style-disc {
  list-style-type: disc !important;
}

.tiptap-content :deep(.ProseMirror) ul.list-style-circle {
  list-style-type: circle !important;
}

.tiptap-content :deep(.ProseMirror) ul.list-style-square {
  list-style-type: square !important;
}

/* 自定义列表样式类 - 有序列表（使用 !important 确保优先级最高） */
.tiptap-content :deep(.ProseMirror) ol.list-style-decimal {
  list-style-type: decimal !important;
}

.tiptap-content :deep(.ProseMirror) ol.list-style-lower-alpha {
  list-style-type: lower-alpha !important;
}

.tiptap-content :deep(.ProseMirror) ol.list-style-upper-alpha {
  list-style-type: upper-alpha !important;
}

.tiptap-content :deep(.ProseMirror) ol.list-style-lower-roman {
  list-style-type: lower-roman !important;
}

.tiptap-content :deep(.ProseMirror) ol.list-style-upper-roman {
  list-style-type: upper-roman !important;
}

.tiptap-content :deep(.ProseMirror blockquote) {
  border-left: 3px solid #dcdfe6;
  padding-left: 1em;
  margin: 1em 0;
  color: #606266;
}

.tiptap-content :deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #dcdfe6;
  margin: 2em 0;
}

.tiptap-content :deep(.ProseMirror pre) {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
}

.tiptap-content :deep(.ProseMirror code) {
  background-color: #f5f7fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.tiptap-content :deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

.tiptap-content :deep(.ProseMirror a) {
  color: #409eff;
  text-decoration: underline;
}

.tiptap-content :deep(.ProseMirror a:hover) {
  color: #66b1ff;
}

/* 表格样式 */
.tiptap-content :deep(.ProseMirror table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 1em 0;
  overflow: hidden;
}

.tiptap-content :deep(.ProseMirror table td),
.tiptap-content :deep(.ProseMirror table th) {
  min-width: 1em;
  border: 1px solid #dcdfe6;
  padding: 8px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}

.tiptap-content :deep(.ProseMirror table th) {
  font-weight: bold;
  text-align: left;
  background-color: #f5f7fa;
}

.tiptap-content :deep(.ProseMirror table .selectedCell) {
  background-color: #ecf5ff;
}

/* 底部统计信息 */
.tiptap-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background-color: #f5f7fa;
  border-top: 1px solid #dcdfe6;
  font-size: 12px;
  color: #909399;
}

.save-status {
  flex: 1;
}

.content-stats {
  display: flex;
  gap: 10px;
}

/* 预览内容样式 */
.preview-content {
  padding: 20px;
  line-height: 1.6;
  font-size: 14px;
}

.preview-content :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.preview-content :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
}

.preview-content :deep(h3) {
  font-size: 1.17em;
  font-weight: bold;
  margin: 0.83em 0;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.preview-content :deep(blockquote) {
  border-left: 3px solid #dcdfe6;
  padding-left: 1em;
  margin: 1em 0;
  color: #606266;
}

.preview-content :deep(pre) {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
}

.preview-content :deep(code) {
  background-color: #f5f7fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

.preview-content :deep(a) {
  color: #409eff;
  text-decoration: underline;
}

.preview-content :deep(a:hover) {
  color: #66b1ff;
}

.preview-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.preview-content :deep(table td),
.preview-content :deep(table th) {
  border: 1px solid #dcdfe6;
  padding: 8px;
}

.preview-content :deep(table th) {
  font-weight: bold;
  background-color: #f5f7fa;
}
</style>

