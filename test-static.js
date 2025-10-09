const http = require('http');

// 测试静态文件访问
const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/static/normalize.css',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`响应体长度: ${data.length}`);
    if (res.statusCode === 200) {
      console.log('静态文件访问成功！');
    } else {
      console.log('静态文件访问失败！');
    }
  });
});

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`);
});

req.end();
