module.exports = (app) => {

  // 模拟请求延迟
  const sleep = async (ms) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, Math.random() * 1000 )
    })
  }

  const BaseController = require('./base')(app);
  return class businessController extends BaseController {

    // 创建商品
    async create(ctx) {
      const { product_name, product_price, inventory } = ctx.request.body

      await sleep(1000)

      this.success(ctx, {
        message: '创建成功',
        product_id: Date.now(),
        projKey: ctx.projKey,
        product_name,
        product_price,
        inventory
      })
    }
    // 删除商品
    async remove(ctx) {

      const { product_id: productId } = ctx.request.body

      await sleep(1000)

      this.success(ctx, {
        message: '删除成功',
        projKey: ctx.projKey,
        product_id: productId
      })
    }
    // 获取商品列表
    async getProductList(ctx) {
      const { product_name: productName, price, inventory, page, pageSize } = ctx.query

      let productList = [{
        product_id: 1,
        product_name: `${ctx.projKey}--product 1`,
        price: 100,
        inventory: 100,
        create_time: '2021-01-01',
      },{
        product_id: 2,
        product_name: `${ctx.projKey}--product 2`,
        price: 200,
        inventory: 200,
        create_time: '2021-01-02',
      },{
        product_id: 3,
        product_name: `${ctx.projKey}--product 3`,
        price: 300,
        inventory: 300,
        create_time: '2021-01-03',
      }]

      // 商品名称筛选逻辑：当有值且不为"全部"选项时进行筛选
      if(productName && productName !== 'all' ){
        productList = productList.filter(item => item.product_name === productName)
      }
      // 为价格添加判断逻辑
      if(price && price !== -999 && price !== '-999'){
        productList = productList.filter(item => item.price == price)
      }
      // 为库存添加判断逻辑
      if(inventory && inventory !== -999  && inventory !== '-999'){
        productList = productList.filter(item => item.inventory == inventory)
      }

      await sleep(1000)

      this.success(ctx, productList, {
        total: productList.length,
        page,
        pageSize
      })
    }

    // 获取商品下拉框列表
    async getProductEnumList(ctx) {
      
      this.success(ctx, [{
        label: '全部',
        value: 'all'
      },{
        label: `${ctx.projKey}--product 1`,
        value: `${ctx.projKey}--product 1`
      },{
        label: `${ctx.projKey}--product 2`,
        value: `${ctx.projKey}--product 2`
      },{
        label: `${ctx.projKey}--product 3`,
        value: `${ctx.projKey}--product 3`
      }])
    }
  }
}