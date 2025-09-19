const assert = require('assert');
const supertest = require('supertest');
const md5 = require('md5');
const elpisCore = require('../../elpis-core');

const signKey = 'elpis-sign-key';
const st = Date.now();

// 测试套件：测试 project 相关接口
describe('测试 project 相关接口', function () { 
  this.timeout(5000);

  let request;  
  let modelList;
  let projectList = [];

  // 启动应用
  it('启动' , async () => { 
    const app = await elpisCore.start();
    modelList = require('../../model/index.js')(app);
    modelList.forEach(modelItem => {
      const { project } = modelItem;
      for(const projKey in project) {
        projectList.push(project[projKey]);
      }
    })
    request = supertest(app.listen());
  })

  // 测试获取项目配置接口不带projectKey
  it('GET /api/project/list without projectKey', async () => {  
    let tmpRequest = request.get('/api/project');
    tmpRequest = tmpRequest.set('s_t', st)  // 设置时间戳
    tmpRequest = tmpRequest.set('s_sign',md5(`${signKey}_${st}`))  // 设置签名
    const res = await tmpRequest;
    assert(res.body.success === false)

    const resBody = res.body;
    assert(resBody.code === 442);
    assert(resBody.message.indexOf('request validate fail') > -1 )
})
// 测试获取项目配置接口带错误projectKey
  it('GET /api/project/list  fail', async () => { 
    let tmpRequest = request.get('/api/project');
    tmpRequest = tmpRequest.set('s_t', st)  // 设置时间戳
    tmpRequest = tmpRequest.set('s_sign',md5(`${signKey}_${st}`))  // 设置签名
    tmpRequest = tmpRequest.query({
      proj_key: 'xxxx'
    })
    const res = await tmpRequest;
    assert(res.body.success === false)

    const resBody = res.body;
    assert(resBody.code === 5000);
    assert(resBody.message === '项目获取异常' )
})
// 测试获取项目配置接口带正确projectKey
  it('GET /api/project/list with projectKey', async () => { 
    for (let i = 0; i < projectList.length; i++) {
    const projItem = projectList[i]; 
    const { key:projKey } = projItem;
    console.log(`GET /api/project/list with proj_key: ${projKey}` )
     
    let tmpRequest = request.get('/api/project');
    tmpRequest = tmpRequest.set('s_t', st)  // 设置时间戳
    tmpRequest = tmpRequest.set('s_sign',md5(`${signKey}_${st}`))  // 设置签名
    tmpRequest = tmpRequest.query({
      proj_key: projKey
    })
    const res = await tmpRequest;
    assert(res.body.success === true)

    const resData = res.body.data
    assert(resData.proj_key === projKey)
    assert(resData.modelKey)
    assert(resData.name)
    assert(resData.desc !== undefined)
    assert(resData.homePage !== undefined)

    const { menu } = resData
    menu.forEach(menuItem => {
      checkMenuItem(menuItem)
})
    }
    // 校验menu 菜单
    function checkMenuItem(menuItem) {
      console.log('----- GET /api/project/list with proj_key -menuKey: ', menuItem.key)
      assert(menuItem.key)
      assert(menuItem.name)
      assert(menuItem.menuType) 
      if (menuItem.moduleType === 'group') {
        assert(menuItem.subMenu !== undefined)
        menuItem.subMenu.forEach(subMenuItem => {
          checkMenuItem(subMenuItem)
        })  
      }

      if (menuItem.menuType === 'module') {
        checkModule(menuItem)
      }
    }
    // 校验 module 菜单配置
    function checkModule(menuItem) {
      const { moduleType } = menuItem
      assert(moduleType)

      if (moduleType === 'sider'){
        const { siderConfig } = menuItem
        assert(siderConfig)
        assert(siderConfig.menu)                
        siderConfig.menu.forEach(siderMenuItem => {
          checkMenuItem(siderMenuItem)
        })
      }

      if (moduleType === 'custom'){
        const { customConfig } = menuItem
        assert(customConfig)
        assert(customConfig.path !== undefined) 
      }

      if (moduleType === 'schema'){
        const { schemaConfig } = menuItem
        assert(schemaConfig)
        assert(schemaConfig.api !== undefined) 
        assert(schemaConfig.schema) 
      }

      if (moduleType === 'iframe'){
        const { iframeConfig } = menuItem
        assert(iframeConfig)
        assert(iframeConfig.path !== undefined) 
      }

    }
  })  
  

  // 测试获取项目列表接口不带proejctKey
  it('GET /api/project/list without proj_key', async () => {
    let tmpRequest = request.get('/api/project/list');
    tmpRequest = tmpRequest.set('s_t', st)  // 设置时间戳
    tmpRequest = tmpRequest.set('s_sign',md5(`${signKey}_${st}`))  // 设置签名
    const res = await tmpRequest;
    assert(res.body.success === true)

    const resData = res.body.data;
    assert(resData.length === projectList.length)
    for (let i = 0; i < resData.length; i++) { 
      // name, desc, homePage, key, modelkey
      const item = resData[i];
      assert(item.name)
      assert(item.key)
      assert(item.desc !== undefined)
      assert(item.homePage !== undefined)
      assert(item.modelKey)
    }
})
  it('GET /api/project/list with proj_key', async () => { 
    // 随机获取一个项目key
    const { key:projKey } = projectList[Math.floor(Math.random() * projectList.length)]
    console.log(`GET /api/project/list with proj_key: ${projKey}` )
    const { modelKey } = projectList.find(item => item.key === projKey)

    let tmpRequest = request.get('/api/project/list');
    tmpRequest = tmpRequest.set('s_t', st)  // 设置时间戳
    tmpRequest = tmpRequest.set('s_sign',md5(`${signKey}_${st}`))  // 设置签名
    tmpRequest = tmpRequest.query({
      proj_key: projKey
    })
    const res = await tmpRequest;
    assert(res.body.success === true)

    const resData = res.body.data 
    assert(projectList.filter(item => item.modelKey === modelKey).length === resData.length)
    for (let i = 0; i < resData.length; i++) { 
      // name, desc, homePage, key, modelkey
      const item = resData[i];
      assert(item.name)
      assert(item.key)
      assert(item.desc !== undefined)
      assert(item.homePage !== undefined)
      assert(item.modelKey)
    } 
})

  // 测试获取项目模型列表接口
  it('GET /api/project/model_list', async () => { 
    // 构造带签名验证的请求
    let tmpRequest = request.get('/api/project/model_list');
    tmpRequest = tmpRequest.set('s_t', st)  // 设置时间戳
    tmpRequest = tmpRequest.set('s_sign',md5(`${signKey}_${st}`))  // 设置签名
    const res = await tmpRequest;
    
    // console.log(JSON.stringify(res.body))
    // 验证响应结果
    assert(res.body.success === true)
    const resData = res.body.data;
    assert(resData.length > 0)

    // 验证数据结构完整性
    for (let i = 0; i < resData.length; i++) { 
      const item = resData[i];
      assert(item.model)
      assert(item.model.name)
      assert(item.model.key)
      assert(item.project)
      for (const projectKey in item.project) { 
        assert(item.project[projectKey].name)
        assert(item.project[projectKey].key)
      }
    }
  })

  
});