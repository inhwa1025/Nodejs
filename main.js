var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require("querystring");

function templateHTML(title, list, body){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    <a href="/create">create</a>
    ${body}
  </body>
  </html>
  `;
}

function templateList(filelist){
  var list = '<ul>';
  var i = 0;
  while(i < filelist.length) {
   list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i++;
  }
  list += '</ul>';
  return list;
}
 
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    
    
    if(pathname === '/') {
      if(queryData.id === undefined) {
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = templateList(filelist);
          var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
          response.writeHead(200); //200 : 성공적으로 파일 전송
          response.end(template);
        })
          
      } else {
        fs.readdir('./data', function(error, filelist){
          var list = templateList(filelist);
          fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){
            var title = queryData.id;
            var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
            response.writeHead(200); //200 : 성공적으로 파일 전송
            response.end(template);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = templateList(filelist);
        var template = templateHTML(title, list, `
        <form action="http://localhost:3000/create_process" method="post"> 
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `);
        response.writeHead(200); //200 : 성공적으로 파일 전송
        response.end(template);
      })
    } else if(pathname === "/create_process") {
      var body = "";
      request.on('data', function(data){ 
        //post로 전송된 데이터가 많을 경우를 대비. 
        //조각조각의 데이터를 서버에서 수신할때마다 콜백함수 호출. data 인자를 통해 줌.
        body += data;

        //데이터가 너무 많으면 접속 끊기
        if (body.length > 1e6){
          request.connection.destroy();
        }
      });
      request.on('end', function(){
        //더 이상 들어올 데이터가 없을 때 콜백함수 호출
        var post = qs.parse(body); //지금껏 저장한 body를 입력값으로. -> dic형태로 됨.
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, //302 : 리다이렉션
            {Location: `/?id=${title}`});
          response.end("success");
        })
      });
    }else {
      response.writeHead(404); // 404 : Not Found
      response.end('Not Found');
    }
    
 
 
});
app.listen(3000);