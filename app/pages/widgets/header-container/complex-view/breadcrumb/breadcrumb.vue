<template>
  <div class="breadcrumb-container">
    <!-- 折叠/展开按钮 -->
    <el-button
      v-if="showCollapseButton"
      class="collapse-button"
      :icon="menuStore.isCollapsed ? Expand : Fold"
      circle
      size="small"
      @click="handleToggleCollapse"
    />

    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="index"
      >
        <span
          v-if="item.path"
          class="breadcrumb-link"
          @click="handleBreadcrumbClick(item)"
        >
          {{ item.name }}
        </span>
        <span v-else>{{ item.name }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '$elpisStore/project.js'
import { useMenuStore } from '$elpisStore/menu.js'
import { Expand, Fold } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const menuStore = useMenuStore()

/**
 * 是否显示折叠按钮
 * 只在有侧边栏的页面显示（sider 模式）
 */
const showCollapseButton = computed(() => {
  // 检查当前路由是否包含 sider
  return route.path.includes('/dashboard/sider')
})

/**
 * 面包屑导航列表
 * 格式：首页 / 项目名称 / 一级菜单 / 二级菜单 / 当前页面
 */
const breadcrumbList = ref([])

/**
 * 构建面包屑路径
 * 根据当前路由和菜单配置生成面包屑导航
 */
const buildBreadcrumb = () => {
  // 确保在 dashboard 页面才构建面包屑
  if (!route || !route.path || !route.path.startsWith('/view/dashboard')) {
    breadcrumbList.value = []
    return
  }

  const list = []

  // 1. 首页（项目列表页）
  list.push({
    name: '首页',
    path: '/view/project-list',
    isExternal: true // 标记为外部链接，使用 window.location
  })

  // 2. 当前项目名称
  if (projectStore.projectName) {
    list.push({
      name: projectStore.projectName,
      path: null // 项目首页暂不支持跳转
    })
  }

  // 3. 获取当前菜单路径（包括主菜单和侧边栏菜单）
  // 优先使用 sider_key（侧边栏菜单），如果没有则使用 key（主菜单）
  const currentKey = route.query.sider_key || route.query.key

  if (currentKey) {
    const menuPath = getMenuPath(currentKey)
    list.push(...menuPath)
  }

  breadcrumbList.value = list
}

/**
 * 获取菜单路径（支持多级菜单和侧边栏菜单）
 * @param {string} targetKey - 目标菜单的 key
 * @returns {Array} 菜单路径数组
 */
const getMenuPath = (targetKey) => {
  /**
   * 递归查找菜单路径
   * @param {Array} menuList - 菜单列表
   * @param {string} target - 目标 key
   * @param {Array} currentPath - 当前路径
   * @returns {Array|null} 找到的路径或 null
   */
  const findPath = (menuList, target, currentPath = []) => {
    if (!menuList || !Array.isArray(menuList)) {
      return null
    }

    for (const menu of menuList) {
      // 找到目标菜单
      if (menu.key === target) {
        return [...currentPath, menu]
      }

      // 递归查找子菜单
      if (menu.subMenu && menu.subMenu.length > 0) {
        const result = findPath(menu.subMenu, target, [...currentPath, menu])
        if (result) return result
      }

      // 递归查找侧边栏菜单
      if (menu.siderConfig && menu.siderConfig.menu) {
        const result = findPath(menu.siderConfig.menu, target, [...currentPath, menu])
        if (result) return result
      }
    }

    return null
  }

  const menuPath = findPath(menuStore.menuList, targetKey)

  if (menuPath) {
    // 转换为面包屑格式
    return menuPath.map((menu, index) => ({
      name: menu.name || menu.key,
      path: index === menuPath.length - 1 ? null : undefined // 最后一项不可点击
    }))
  }

  return []
}

/**
 * 处理折叠/展开按钮点击
 */
const handleToggleCollapse = () => {
  menuStore.toggleCollapse()
}

/**
 * 处理面包屑点击事件
 * @param {Object} item - 面包屑项
 */
const handleBreadcrumbClick = (item) => {
  if (item.path) {
    if (item.isExternal) {
      // 外部链接，使用 window.location 跳转
      window.location.href = item.path
    } else {
      // 内部路由，使用 router.push 跳转
      router.push(item.path)
    }
  }
}

/**
 * 监听路由变化，更新面包屑
 */
watch(
  [
    () => route.path,
    () => route.query.key,
    () => route.query.sider_key,
    () => route.query.proj_key,
    () => projectStore.projectName,
    () => menuStore.menuList
  ],
  () => {
    buildBreadcrumb()
  },
  { deep: true, immediate: true }
)
</script>

<style lang="less" scoped>
.breadcrumb-container {
  margin-left: 20px;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; // 允许收缩
  overflow: hidden;
  gap: 12px; // 折叠按钮和面包屑之间的间距

  // 折叠按钮样式
  .collapse-button {
    flex-shrink: 0; // 不允许收缩
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  :deep(.el-breadcrumb) {
    font-size: 14px;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;

    .el-breadcrumb__item {
      display: inline-block;
      max-width: 200px; // 限制每个面包屑项的最大宽度

      .el-breadcrumb__inner {
        color: #606266;
        font-weight: normal;
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;

        &:hover {
          color: #409eff;
        }

        &.is-link {
          color: #409eff;
          cursor: pointer;
        }
      }

      // 最后一项（当前页面）
      &:last-child {
        .el-breadcrumb__inner {
          color: #303133;
          font-weight: 500;
          cursor: default;

          &:hover {
            color: #303133;
          }
        }
      }
    }

    .el-breadcrumb__separator {
      margin: 0 8px;
      color: #c0c4cc;
    }
  }

  // 面包屑链接样式
  .breadcrumb-link {
    color: #409eff;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #66b1ff;
    }
  }
}

// 深色主题适配
html.dark .breadcrumb-container {
  .collapse-button {
    &:hover {
      background-color: #262727;
    }
  }

  :deep(.el-breadcrumb) {
    .el-breadcrumb__item {
      .el-breadcrumb__inner {
        color: #a8abb2;

        &:hover {
          color: #409eff;
        }

        &.is-link {
          color: #409eff;
        }
      }

      &:last-child {
        .el-breadcrumb__inner {
          color: #e5eaf3;

          &:hover {
            color: #e5eaf3;
          }
        }
      }
    }

    .el-breadcrumb__separator {
      color: #4c4d4f;
    }
  }

  .breadcrumb-link {
    color: #409eff;

    &:hover {
      color: #66b1ff;
    }
  }
}
</style>

