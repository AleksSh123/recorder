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
    const cookieHeader = request.headers?.cookie;
    console.log("coockies is:");
    console.log(cookieHeader);
    console.log("parsed coockies:");
    console.log(getCoockies(request));
    let coockies = getCoockies(request);
        if (coockies){
        console.log(`coockies.token: ${coockies.token}`);
        if (coockies.token != "123456"){
            response.writeHead(403);
            response.end("403 Unathorized");
        }
    } 

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
function getCoockies(request){
    
    const cookieHeader = request.headers?.cookie;
    if (cookieHeader){
        let result = {};
        const coockiesStrArr = cookieHeader.split(";");
        for (let coockieString of coockiesStrArr){
            coockieParsed = coockieString.split("=");
            result[coockieParsed[0].trim()] = coockieParsed[1].trim();
        }
        return result;
    } else{
        return false;
    }

}


server.listen(3000);