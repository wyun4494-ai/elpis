import { defineStore } from 'pinia'
import { ref }  from 'vue'

export const useMenuStore = defineStore('menu', () => {
  // 菜单列表
  const menuList = ref([]);

  // 侧边栏折叠状态
  const isCollapsed = ref(false);

  // 设置菜单列表配置
  const setMenuList = (list) => {
    menuList.value = list;
  }

  // 切换侧边栏折叠状态
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    // 保存到 localStorage
    localStorage.setItem('sider-collapsed', isCollapsed.value ? '1' : '0');
  }

  // 从 localStorage 恢复折叠状态
  const restoreCollapseState = () => {
    const saved = localStorage.getItem('sider-collapsed');
    if (saved !== null) {
      isCollapsed.value = saved === '1';
    }
  }

  /**
   * 找出菜单目录
   * @param key 搜索字段
   * @param value 搜索值
   * @param mlist 要搜索的菜单列表
   */
  const findMenuItem = function({ key, value }, mlist = menuList.value) {
    // 遍历要搜索的菜单列表
    for (let i = 0; i < mlist.length; i++) {
      // 获取当前菜单项
      const menuItem = mlist[i];
      // 如果菜单项不存在，继续下一个
      if (!menuItem) continue;
      // 获取菜单项的菜单枚举值和模块枚举值
      const { menuType, moduleType } = menuItem;
      // 如果菜单项的 key 对应的值等于搜索值，返回该菜单项
      if (menuItem[key] === value) {
        return menuItem; 
      }
      // 如果菜单项是分组类型，并且有子菜单，递归查找子菜单
      if (menuType === 'group' && menuItem.subMenu) {
        const mItem = findMenuItem({ key, value }, menuItem.subMenu);
        if (mItem) return mItem;
      }
      // 如果菜单项模块类型是侧边栏类型，并且有侧边栏配置，并且有侧边栏配置和侧边栏菜单，递归查找侧边栏菜单
      if (moduleType === 'sider' && menuItem.siderConfig && menuItem.siderConfig.menu) {
        const mItem = findMenuItem({ key, value }, menuItem.siderConfig.menu);
        if (mItem) return mItem;
      }
    }
  }


  /**
   * 找出第一个菜单项
   * @param mlist 要搜索的菜单列表
   */
  const findFirstMenuItem = function(mlist = menuList.value) {
    if (!mlist || !mlist[0]) return ;
    let firstMenuItem = mlist[0];
    if (firstMenuItem.subMenu && firstMenuItem.subMenu.length > 0) {
      firstMenuItem = findFirstMenuItem(firstMenuItem.subMenu);
    }
    return firstMenuItem; 
  }


  return {
    menuList,
    setMenuList,
    findMenuItem,
    findFirstMenuItem,
    isCollapsed,
    toggleCollapse,
    restoreCollapseState
  }
})
