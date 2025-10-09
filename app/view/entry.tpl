<!DOCTYPE html>
<html lang="zh-CN" >
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{name}}</title>
  <link href="/static/normalize.css" rel="stylesheet" >
  <link href="/static/logo.png" rel="icon" type="image/png" >
</head>
<body style="margin: 0;">
  <div id="root"></div>
  <input id="projKey" value="{{ projKey }}" style="display: none;" />
  <input id="env" value="{{ env }}" style="display: none;" />
  <input  id="options" value="{{ options }}" style="display: none;" />

<script>
  try {
    window.projKey = document.getElementById('projKey').value
    window.env = document.getElementById('env').value
    const options = document.getElementById('options').value
    window.options = JSON.parse(options)
  } catch (e) {
    console.log(e)
  }
</script>
</body>
</html> 