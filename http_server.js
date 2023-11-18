const req = require('express/lib/request');
const fs = require('fs');
const http = require('node:http');
const defaultPrefix = "pages/default/";
const prefix = "pages/";
//schedule_object = {};
let schedule_object = [
    {
        startTime: "04:00",
        startUnixTime: 0,
        stopTime: "07:00",
        stopUnixTime: 0,
        started: false,
        name: "first",
        enabled: true

    },
    {
        startTime: "22:48",
        startUnixTime: 0,
        stopTime: "22:49",
        stopUnixTime: 0,
        started: false,
        name: "second",
        enabled: false
    }];


let body;

let server = new http.Server(function(request,response){

    let chunkArray = []; 
    console.log("Url: " + request.url);
    console.log("Тип запроса: " + request.method);
    //console.log("User-Agent: " + request.headers["user-agent"]);
    //console.log("Все заголовки");
  
    console.log(request.headers);
    if (request.method == 'POST'){
        request.on('data', (chunk) => {
            chunkArray.push(chunk.toString());
            //console.log(chunk.toString());
        });

    }

    switch (request.url) {
        case "/":
            //response.end("this is a answer!");
            getFile(defaultPrefix + "schedule.htm", response);
            break;
        case "/favicon.ico":
/*             const basePath = "default";
            fs.readFile(basePath + "/favicon.ico", (err, data) => {
                if (err) throw err;
                response.writeHead(200, {'Content-Type': 'image/png'});
                response.end(data);
        
            }); */
            getFile(defaultPrefix + "favicon.ico", response);
            console.log("Got it!");
            break;
        case "/set_schedule":
            if (request.method == "POST"){
                request.on('end', () => {
                    if (chunkArray){
                        body = chunkArray.join("");
                        console.log(body);
                        set_schedule(body);
                        getFile(defaultPrefix + "schedule.htm",response);
                        console.log("get post schedule!");
                    }
                });
                
            } else{
                getFile(defaultPrefix + "schedule.htm",response);
                console.log("get get schedule!");
            }
            break;
        case "/get_schedule":
            //let schedule_string = JSON.stringify(schedule_object);
            let schedule_string = JSON.stringify(schedule_object);
            headers = {
                'Content-Type': 'application/json'
            }
            response.writeHead(200, headers);
            response.end(schedule_string);
            break;
        default:
            getFile(request.url, response);
            console.log("Default!");
            break;
    }
})

function getFile(filePath, response){

    const fs = require('fs');
    //const basePath = "";
    let regexp_htm = /\.(txt|htm|html)$/gi;
    let regexp_css = /\.css$/gi;
    //let options;
    let headers = {
        'Content-Type': 'image/png'
    }
    let responseCode;
    console.log(filePath);
    let test = fs.existsSync(filePath)
    console.log(test);
    if (!fs.existsSync(filePath)){
        filePath = "pages/not_found/not_found.html";
        responseCode = 404;
        headers['Content-Type'] = 'text/html';
    } else {
        responseCode = 200;
        if (regexp_htm.test(filePath)){
            //options = "utf8";
            headers['Content-Type'] = 'text/html';
        }
        if (regexp_css.test(filePath)){
            //options = "utf8";
            headers['Content-Type'] = 'text/css';
        }
    }
    console.log(filePath);
    fs.readFile(filePath, (err, data) => {
        if (err){
            console.log(err);
            response.writeHead(500);
            response.end();
            throw err;
        } 
        response.writeHead(responseCode, headers);
        response.end(data);

    });
}

function set_schedule(body){
    let array = body.split("&");
    let newEntry = new class {
        startTime = null
        startUnixTime = 0
        stopTime = null
        stopUnixTime = 0
        started = false
        name = null
        enabled = false
    };
    for (let element of array){
        let splittedElement = element.split("=");

        newEntry[splittedElement[0]] = decodeURIComponent(splittedElement[1]);
  
    }
    schedule_object.push(newEntry);
    console.log(array);
    console.log(schedule_object);
    return true;
}

server.listen(3000);