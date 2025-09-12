module.exports = {
  name: 'pdd',
  desc: '拼多多电商系统',
  menu: [{
    key: 'product',
    name: '商品管理(拼多多)'
  }, {
    key: 'client',
    name: '客户管理(拼多多)'
  }, {
    key: 'data',
    name: '数据分析',
    menuType: 'module',
    moduleType: 'sider',
    siderConfig: {
      menu: [{
        key: 'analysis',
        name: '电商罗盘',
        menuType: 'module',
        moduleType: 'custom',
        customConfig: {
          path: '/todo'
        }
      }, {
        key: 'sider-report', 
        name: '报表分析',
        menuType: 'module',
        moduleType: 'iframe',
        iframeConfig: {
          path: 'https://www.baidu.com/'
        }
      }]
    }
  },  {
    key: 'sider-report', 
    name: '报表分析',
    menuType: 'module',
    moduleType: 'iframe',
    iframeConfig: {
      path: 'https://www.baidu.com/'
    }
   }]
}