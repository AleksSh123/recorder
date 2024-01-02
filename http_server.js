const http = require('node:http');
//const prefix = "pages/";
const router = require('./router.js');

let server = new http.Server(function(request,response){

    let chunkArray = []; 
    let body;
    let url;
    console.log("Url: " + request.url);
    console.log("Тип запроса: " + request.method);
    console.log("Все заголовки");
    console.dir(request.headers);
    //console.log("request:");
    //console.dir(request);
    console.log("request ip is:");
    console.log(request.socket.remoteAddress);
    if (request.method == 'POST'){
        request.on('data', (chunk) => {
            chunkArray.push(chunk.toString());
            //console.log(chunk.toString());
        });
        request.on('end', () => {
            if (chunkArray.length !=0){
                body = chunkArray.join("");
                body = JSON.parse(body);
            } else {
                body = null;
            }
            console.log ("body of request is: " + body);
            router.route(request.url, request.method, body, request, response);
        });

    } else {
        router.route(request.url, request.method, null, request, response);
    }


})


server.listen(3000);