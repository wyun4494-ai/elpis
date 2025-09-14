module.exports = {
  name: 'taobao',
  desc: '淘宝电商系统',
  menu: [{
    key: 'order',
    moduleType: 'iframe',
    iframeConfig: {
      path: 'https://www.pinduoduo.com/'
    }
  }, {
    key: 'operating',
    name: '运营活动',
    menuType: 'module',
    moduleType: 'sider',
    siderConfig: {
      menu: [{
        key: 'coupon',
        name: '优惠劵',
        menuType: 'module',
        customConfig: {
          path: '/todo'
        }
      }, {
        key: 'limited',
        name: '限量购',
        menuType: 'module',
        customConfig: {
          path: '/todo'
        }
      }, {
        key: 'festival',
        name: '节日活动',
        menuType: 'module',
        customConfig: {
          path: '/todo'
        }
      }]
    }
  }]
}