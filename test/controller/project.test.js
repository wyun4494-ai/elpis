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

  // 启动应用
  it('启动' , async () => { 
    const app = await elpisCore.start();
    request = supertest(app.listen());
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