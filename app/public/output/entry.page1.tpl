<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{name}}</title>
  <link href="/static/normalize.css" rel="stylesheet" >
  <link href="/static/logo.png" rel="icon" type="image/x-icon" >
</head>
<body style="color: aqua;">
    <h1>page1</h1>
    <input id="env" value="{{ env }}" style="display: none;">
    <input  id="options" value="{{ options }}" style="display: none;">
    <button onclick="handleClick()">发送请求</button>



    <script src="https://unpkg.com/axios@1.6.7/dist/axios.min.js"></script>
    <script>
      try {
        window.env = document.getElementById('env').value
        const options = document.getElementById('options').value
        window.options = JSON.parse(options)
      } catch (e) {
        console.log(e)
      }

      const handleClick = () => {
        axios.get('/api/project/list').then(res => {
            console.log(res)
        })
      }
    </script>
</body>
</html>