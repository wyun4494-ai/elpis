// {
//   mode: 'dashboard', // 模板类型， 不同模板类型对应不一样的模板数据结构
//   name: '', // 名称
//   desc: '', // 描述
//   icom: '', // 图标
//   homePage: '', // 首页(项目配置)
//   // 头部菜单
//   menu: [{
//     key: '', // 菜单唯一描述
//     name: '', // 菜单名称
//     menuType: '', // 枚举值 group / moudle

//     // 当menuType为group时，可填
//     subMenu: [{
//       // 可递归 menuItem
//     }, ...],

//     // 当menuType为moudle时，可填
//     moduleType: '', // 枚举值 sider/iframe / custom / schema

//     // 当moduleType为sider时，可填
//     siderConfig: {
//       menu: [{
//         // 可递归 menuItem(除moduleType === sider 时)
//       }, ...]
//     },

//     // 当moduleType为iframe时，可填
//     iframeConfig: {
//       path: '' // iframe 路径
//     },   

//     // 当moduleType为custom时，可填
//     customConfig: {
//       path: '' // 自定义组件路径
//     },   

//     // 当moduleType为schema时，可填
//     schemaConfig: {
//       api: '', // 数据源API (遵循 RESTFUL 规范)
//       schema: { // 板块数据结构
//         properties: { // 板块属性
//           key: { 
//             ...schema, // 标准 schema 配置
//             type: '', // 字段类型
//             label: '' // 字段名称
//           },
//           ...
//         }
//       },
//       tableConfig: {}, // table 配置
//       searchConfig: {}, // search 配置
//       compoents: {} // 模块组件
//     }
//   }, ...]
// }