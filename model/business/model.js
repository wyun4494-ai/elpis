
module.exports = {
  model: 'dashboard',
  name: '电商系统',
  menu: [
    {
    key: 'product',
    name: '商品管理',
    menuType: 'module',
    moduleType: 'schema',
    schemaConfig: {
      api: '/api/proj/product',
      schema: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            label: '商品编号',
            tableOption: {
              width: 300,
              'show-overflow-tooltip': true // 超出宽度显示 tooltip
            }
          },
          product_name: {
            type: 'string',
            label: '商品名称',
            tableOption: {
              width: 300,
            },
            searchOption: {
              comType: 'dynamicSelect',
              api: '/api/proj/product_enum/list'
            }
          },
          price: {
            type: 'number',
            label: '价格',
            tableOption: {
              width: 200,
              toFixed: 2
            },
            searchOption: { 
              comType: 'select',
              enumList: [{
                label: '全部',
                value: -999
              },{
                label: '$100',
                value: 100
              },{
                label: '$200',
                value: 200
              },{
                label: '$300',
                value: 300
              }]
            }
          },
          inventory: {
            type: 'number',
            label: '库存',
            tableOption: {
              width: 200,
            },
            searchOption: {
              comType: 'input',
              placeholder: '请输入库存'
            }
          },
          create_time: {
            type: 'date',
            label: '创建时间',
            tableOption: {},
            searchOption: {
              comType: 'dateRange',
            }
          }
        }
      },
      tableConfig: {
        headerButtons: [{
          label: '添加商品',
          type: 'primary',
          eventKey: 'showComponent',
          plain: true // 按钮样式
        }],
        rowButtons: [{
          label: '编辑',
          type: 'warning',
          eventKey: 'showComponent',
          eventOption: {}
        }, {
          label: '删除',
          type: 'danger',
          eventKey: 'remove',
          eventOption: {
            params: {
              product_id: 'schema::product_id'
            }
          }
        }]
      }
    }
  }, {
    key: 'order',
    name: '订单管理',
    menuType: 'module',
    moduleType: 'custom',
    customConfig: {
      path: '/todo'
    }
  }, {
    key: 'client',
    name: '客户管理',
    menuType: 'module',
    moduleType: 'custom',
    customConfig: {
      path: '/todo'
    }
  }]
}