const http = require('node:http');
//const prefix = "pages/";
const router = require('./router.js');
const auth = require('./auth.js');

let server = new http.Server(function(request,response){

    let chunkArray = []; 
    let body;
    let url;
    let user;
    console.log("http_server: Url: " + request.url);
    console.log("http_server: decoded url: " + decodeURI(request.url));
    console.log("http_server: Тип запроса: " + request.method);
    console.log("http_server: Все заголовки");
    console.dir(request.headers);
    //console.log("request:");
    //console.dir(request);
    console.log("http_server: request ip is:");
    console.log(request.socket.remoteAddress);
    const cookieHeader = request.headers?.cookie;
    console.log("http_server: coockies is:");
    console.log(cookieHeader);
    console.log("http_server: parsed coockies:");
    console.log(getCoockies(request));
    let coockies = getCoockies(request);
    console.log(`http_server: coockies.token: ${coockies.token}`);
/*     if (coockies){
        user = auth.getUserByToken(coockies.token);
        if (coockies.token != "123456"){
            console.log("unauthorized!");
            response.writeHead(403);
            response.end("403 Unathorized");
        }
    }  */
    user = auth.getUserByToken(coockies.token)
/*     if ((!coockies) || (!user)){
        console.log("http_server: unauthorized!");
        if ((request.url != "/auth") && (request.url != "/favicon.ico")) {
        response.writeHead(302, {'Location': '/auth'});
        response.end();
        return;
        } 
         */



    //if (request.method == 'POST'){
    //console.log("http_server: ['POST','PUT','DELETE','PATCH'].includes(request.method) is " + ['POST','PUT','DELETE','PATCH'].includes(request.method))
    if (['POST','PUT','DELETE','PATCH'].includes(request.method)){
        request.on('data', (chunk) => {
            chunkArray.push(chunk.toString());
            console.log(chunk.toString());
        });
        request.on('end', () => {
            if (chunkArray.length !=0){
                body = chunkArray.join("");
                try{
                    body = JSON.parse(body);
                } catch(err){
                    body = null;
                    console.error("http_server: cannot parse body with error: " + err);
                }
    
            } else {
                body = null;
            }
            console.log ("http_server: body of request is: " + body);
            router.route(decodeURI(request.url), request.method, body, request, response, user);
        });

    } else {
        body = null;
        router.route(decodeURI(request.url), request.method, body, request, response, user);
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