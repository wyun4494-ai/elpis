import { ElMessage } from "element-plus";

const md5 = require("md5");
/**
 * 前端封装的 curl 方法
 * @param {Object} options 请求参数
 */

const curl = ({
  url, // 请求地址
  method = 'post', // 请求方法
  headers = {}, // 请求头
  params = {}, // 请求参数
  data = {}, // 请求体
  responseType = 'json', // 响应数据类型
  timeout = 60000, // 请求超时时间
  errorMsg = '请求超时', // 请求超时错误信息
}) => {

  // 接口签名处理（让接口变动态）
  const signKey = 'elpis-sign-key'
  const st = Date.now()

  const dotHeaders = {
    ...headers,
    s_t: st,
    s_sign: md5(`${signKey}_${st}`),
  }

  if(url.indexOf('/api/proj') > -1 && window.projKey && window.projKey !== 'undefined') {

    dotHeaders.proj_key = window.projKey
  }

  // 构造请求参数 把参数转换为 axios 参数
  const ajaxSetting = {
    method,
    url,
    params,
    data,
    responseType,
    timeout,
    headers: dotHeaders
  }

  return axios.request(ajaxSetting).then((response) => {
    const resData = response.data

    // 后端API返回格式
    const { success } = resData;

    // 失败
    if(!success){
      const { message, code } = resData;
      if ( code === 402){
        ElMessage.error('请求参数异常')
      } else if ( code === 445){
        ElMessage.error('请求不合法')
      }else if ( code === 446){
        ElMessage.error('缺少项目必要参数 ')
      } else if ( code === 50000){
        ElMessage.error(message)
      }else {
        ElMessage.error(errorMsg)
      }
      console.error(message)
      return Promise.resolve({ success, code, message})
  }
    // 成功
    const { data, metadata} = resData;
    return Promise.resolve({ success, data, metadata})

  }).catch((e) => {
    const { message } = e

    if (message.match(/timeout/)){
      return Promise.resolve({
        message: '请求超时',
        code: 504
      })
    }

    return Promise.resolve(e)
  })
}

export default curl;