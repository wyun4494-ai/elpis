// @ts-ignore
// dsl dashboard 模板配置
export default {
  mode: 'dashboard', // 模板类型， 不同模板类型对应不一样的模板数据结构
  name: '', // 名称;
  desc: '', // 描述
  icon: '', // 图标
  homePage: '', // 首页(项目配置)

  // 头部菜单 
  menu: [{
    key: '', // 菜单唯一描述
    name: '', // 菜单名称
    menuType: '', // 枚举值 group 为有下拉子菜单 / module 为无子菜单

    // 当menuType为group时，可填
    subMenu: [{
      // 可递归 menuItem
    }, ...],

    // 当menuType为module时，可填
    moduleType: '', // 枚举值 sider 为侧边栏  /iframe 为第三方页面  / custom 为自定义页面 / schema 为配置式页面

    // 当moduleType为sider时，可填
    siderConfig: {
      menu: [{
        // 可递归 menuItem(除moduleType === sider 时)
      }, ...]
    },

    // 当moduleType为iframe时，可填
    iframeConfig: {
      path: '' // iframe 路径
    },   

    // 当moduleType为custom时，可填
    customConfig: {
      path: '' // 自定义组件路径
    },   

    // 当moduleType为schema时，可填
    schemaConfig: {
      api: '', // 数据源API (遵循 RESTFUL 规范)
      schema: { // 板块数据结构
        type: 'object',
        properties: { // 板块属性
          key: { 
            // ...schema, // 标准 schema 配置
            type: '', // 字段类型
            label: '' // 字段名称
          },
          ...}
      },
      tableConfig: {}, // table 配置
      searchConfig: {}, // search-bar 配置
      components: {} // 模块组件
    }
  }, ...]
}