# Elpis
## 这是一个企业级的应用框架，使用全栈实现

### model配置
``` javascript
{
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
      // 更多菜单项
    }],
    // 当menuType为module时，可填
    moduleType: '', // 枚举值 sider 为侧边栏  /iframe 为第三方页面  / custom 为自定义页面 / schema 为配置式页面

    // 当moduleType为sider时，可填
    siderConfig: {
      menu: [{
        // 可递归 menuItem(除moduleType === sider 时)
      }] // ... 更多菜单项
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
      // 板块数据结构
      schema: { 
        type: 'object',
        properties: { // 板块属性
          key: {
            // 标准 schema 配置（占位）
            type: '', // 字段类型
            label: '', // 字段名称
            // 字段在 table 中的相关配置
            tableOption: {
              // 标准 el-table-column 配置（占位）
              toFixes: 2, // 数字类字段保留小数位数
              visible: true // 是否在 表单 中显示
            },
            searchOption: {
              // 标准 el-component-column 配置（占位）
              comType: '', // 配置组件类型 input/select....
              default: '', // 默认值

              // 当 comType 为 select时
              enumList: [], // 下拉框可选值

              // 当 comType 为 dynamicSelect时
              api: '',
            },
            // 字段在不同动态 component 中的相关配置， 前缀对应 componentConfig 中的键值
            // 比如 componentConfig.createForm 这里就对应 createFormOption 的配置
            // 字段在 createForm 中相关配置
            createFormOption: { 
              // 标准 el-component-column 配置（占位）
              comType: '', // 控件类型 input/select....
              visible: true, // 是否在 表单 中显示 默认true
              disabled: false, // 是否禁用
              default: '', // 默认值

              // 当 comType 为 select时
              enumList: [], // 下拉框可选值
            },
            // 字段在 editForm 中相关配置
            editFormOption: {
              // 标准 el-component-column 配置（占位）
              comType: '', // 控件类型 input/select....
              visible: true, // 是否在 表单 中显示 默认true
              disabled: false, // 是否禁用
              default: '', // 默认值
            },
            // 字段在 detailPanel 中相关配置
            detailPanelOption: {
              // 标准 el-component-column 配置（占位）
              comType: '', // 控件类型 input/select....
              visible: true, // 是否在 表单 中显示 默认true
              disabled: false, // 是否禁用
              default: '', // 默认值
            },
          },
          // ... 用户可扩展
        },
        required: [],
      },
      // 表单配置
      tableConfig: {
        headerButtons: [{ // 头部按钮组
          label: '', // 按钮名称
          eventKey: '', // 按钮事件名
          eventOption: {
            // 当eventKey === 'showComponent' 时，可填
            conName: '', // 组件名称
          }, // 按钮配置
          // 标准 el-button 配置（占位）
        }], // ... 更多按钮项
        rowButtons: [{ // 行为按钮组
          label: '',
          eventKey: '',
          eventOption: {
            // 当eventKey === 'showComponent' 时，可填
            conName: '', // 组件名称

            // 当eventKey === 'remove' 时，可填
            params: {
              // paramKey = 参数键名
              // rowValueKey = 参数值 当格式为 schema::tableKey 的时候，到 table中找到响应的字段
              paramKey: 'rowValueKey'
            }
          },
          // 标准 el-button 配置（占位）
        }]
      }, // table 配置
      searchConfig: {}, // search-bar 配置
      // 动态组件 相关配置
      componentConfig: {
        // create-form 表单相关配置
        createForm: {
          title: '', // 创建表单标题
          saveBtnText: '', // 保存按钮名称
        },
        // edit-form 表单相关配置
        editForm: {
          mainKey: '', // 主键字段
          title: '', // 编辑表单标题
          saveBtnText: '', // 保存按钮名称
        },
        // detail-panel 表单相关配置
        detailPanel: {
          mainKey: '', // 主键字段
          title: '', // 详情表单标题
        },
      }
      // ... 支持用户动态扩展
    }
  }] // ... 更多菜单
}
```

### 服务端启动
``` javascript
const {
  ServerStart
} = require('@lesheng/elpis');

// 启动服务
const app = ServerStart({});
```

### 自定义服务端
- router-schema
- router
- controller
- service
- extend
- config

### 前端构建
``` javascript
const { frontendBuild } = require('@lesheng/elpis');

// 编译构建前端工程
frontendBuild(process.env._ENV);
```

### 自定义页面扩展
* 在 `app/pages` 目录下写入口 entry.xxx.js 文件

### dashboard / custom-view 自定义页面扩展
* 在 `app/pages/dashboard/xxxx` 目录下页面

### dashboard / schema-view / components 动态组件扩展
1. 在 `app/pages/dashboard/complex-view/schema-view/components` 目录下写组件
2. 配置到 `app/pages/dashboard/complex-view/schema-view/components/component-config.js`

### schema-form 控件扩展
1. 在 `app/pages/widgets/schema-form/complex-view` 下写控件
2. 配置到 `app/pages/widgets/schema-form/form-item-config.js`

### schema-search-bar 控件扩展
1. 在 `app/pages/widgets/schema-search-bar/complex-view` 下写控件
2. 配置到 `app/pages/widgets/schema-search-bar/search-item-config.js`
