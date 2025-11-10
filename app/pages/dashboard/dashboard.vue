<template>
  <el-config-provider :locale="zhCn">
    <header-view
      :proj-name="projName"
      @menu-select="onMenuSelect"
    >
      <!-- 主内容区域插槽插入 -->
      <template #main-content>
        <router-view />
      </template>
    </header-view>
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ElMessage } from 'element-plus'
import HeaderView from './complex-view/header-view/header-view.vue'
import { ref, onMounted } from 'vue'
import { useProjectStore } from '$elpisStore/project.js'
import { useMenuStore } from '$elpisStore/menu.js'
import $curl from '$elpisCommon/curl.js'
import { useRouter, useRoute } from 'vue-router'

const projectStore = useProjectStore()
const menuStore = useMenuStore()
const projName = ref('')
const route = useRoute()
const router = useRouter()
const isLoading = ref(true)

onMounted( async () => {
  try {
    await getProjectList()
    const configLoaded = await getProjectConfig()

    if (configLoaded) {
      // 获取用户的菜单权限并过滤菜单
      await filterMenuByPermission()

      // 等待一小段时间确保菜单数据完全设置
      setTimeout(() => {
        isLoading.value = false
      }, 200)
    } else {
      console.error('项目配置加载失败')
      isLoading.value = false
    }
  } catch (error) {
    console.error('初始化失败:', error)
    isLoading.value = false
  }
})

// 请求 /api/project/list 并缓存到 project-store
async function getProjectList() {
  const res = await $curl({
    method: 'get',
    url: '/api/project/list',
    params: {
      // todo 动态获取
      proj_key: route.query.proj_key,
    }
  });
  if (!res || !res.data || !res.success) {
    return
  }

  projectStore.setProjectList(res.data)
}
// 请求 /api/project 并缓存到 menu-store
async function getProjectConfig() {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/project',
      params: {
        proj_key: route.query.proj_key,
      },
    });

    if (!res || !res.data || !res.success) {
      return false; // 返回失败状态
    }

    const { name, menu} = res.data
    projName.value = name
    menuStore.setMenuList(menu)

    // 设置项目名称和 key 到 store
    projectStore.setProjectName(name)
    projectStore.setProjectKey(route.query.proj_key)

    return true; // 返回成功状态
  } catch (error) {
    console.error('获取项目配置失败:', error)
    return false; // 返回失败状态
  }
}

/**
 * 获取用户的菜单权限并过滤菜单列表
 * 策略：
 * 1. 获取用户有权限的菜单列表
 * 2. 在菜单项上标记权限状态（hasPermission）
 * 3. 前端根据权限状态决定是否显示菜单或显示禁用状态
 * 4. 用户点击没有权限的菜单时，弹出提示
 */
async function filterMenuByPermission() {
  try {
    const res = await $curl({
      method: 'get',
      url: '/api/proj/user/menu',
      params: {
        proj_key: route.query.proj_key
      }
    })

    if (!res || !res.data || !res.success) {
      console.warn('获取用户菜单权限失败，显示所有菜单')
      // 如果获取权限失败，显示所有菜单（不过滤）
      return
    }

    // 获取用户有权限的菜单权限列表（包含 menu_key 和 project_key）
    const userMenuPermissions = res.data

    // 标记菜单权限状态（不过滤菜单，只标记权限）
    const menuWithPermission = markMenuPermission(
      menuStore.menuList,
      userMenuPermissions,
      route.query.proj_key
    )
    menuStore.setMenuList(menuWithPermission)
  } catch (error) {
    console.error('菜单权限过滤失败:', error)
    // 如果出错，保持原菜单不变
  }
}

/**
 * 标记菜单权限状态
 * @param {Array} menu - 菜单列表
 * @param {Array} userMenuPermissions - 用户有权限的菜单权限列表 [{ menu_key, project_key }, ...]
 * @param {string} currentProjectKey - 当前项目标识
 * @returns {Array} 标记了权限状态的菜单列表
 */
function markMenuPermission(menu, userMenuPermissions, currentProjectKey) {
  return menu.map(item => {
    // 检查用户是否有权限访问该菜单
    const hasPermission = userMenuPermissions.some(perm =>
      perm.menu_key === item.key && perm.project_key === currentProjectKey
    )

    // 如果有子菜单，递归标记权限
    if (item.subMenu && item.subMenu.length > 0) {
      return {
        ...item,
        hasPermission: true, // 分组菜单始终显示
        subMenu: markMenuPermission(item.subMenu, userMenuPermissions, currentProjectKey)
      }
    }

    // 模块菜单标记权限状态
    return {
      ...item,
      hasPermission: hasPermission
    }
  })
}



// 点击菜单回调方法
const onMenuSelect = function(menuItem) {
  const { moduleType, key, customConfig, hasPermission } = menuItem

  if (key === route.query.key) {
    return
  }

  // 检查用户是否有权限访问该菜单
  if (hasPermission === false) {
    ElMessage.warning('您没有权限访问此菜单')
    return
  }

  // 菜单项的 moduleType 映射到对应的路由
  const pathMap = {
    sider: '/sider',
    schema: '/schema',
    iframe: '/iframe',
    custom: customConfig?.path
  }
  router.push({
    path: `/view/dashboard${pathMap[moduleType]}`,
    query: {
      key,
      proj_key: route.query.proj_key
    }
  })
}

</script>

<style scoped lang="less">
.global-loading {
  width: 100vw;
  height: 100vh;
  position: relative;
}
:depp(el-main) {
  padding: 0%;
}
</style>
