module.exports = (app) => {
  const BaseController = require('./base')(app);

  return class businessController extends BaseController {

    remove(ctx) {
      const { product_id: productId } = ctx.request.body
      this.success(ctx, {
        message: '删除成功',
        projKey: ctx.projKey,
        product_id: productId
      })
    }

    async getProductList(ctx) {
      const { page, pageSize } = ctx.query
      this.success(ctx, [{
        product_id: 1,
        product_name: `${ctx.projKey}--product 1`,
        price: 100,
        inventory: 100,
        create_time: '2021-01-01',
      },{
        product_id: 2,
        product_name: 'product 2',
        price: 200,
        inventory: 200,
        create_time: '2021-01-02',
      },{
        product_id: 3,
        product_name: 'product 3',
        price: 300,
        inventory: 300,
        create_time: '2021-01-03',
      }], {
        total: 3,
        page,
        pageSize
      })
    }
  }
}