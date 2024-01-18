const fileReader = require('./filereader.js');
const scheduler = require('./scheduler.js');
const recordsFileReader = require('./recordsfilereader.js');
const recordsFileDeleter = require('./recordsfiledeleter.js');
const auth = require('./auth.js');
exports.route = function (url, method, body,request,response, user){
    console.log("router url:" + url);
    console.log("router method: " + method);
    console.log("router body: " + body);


    switch (url){

        case "/get_schedule":
            if (method == "GET"){
                let status, scheduleJSON;
                let result = scheduler.getSchedule();
                status = result[0];
                scheduleJSON = result[1];
                if (status == "ok"){
                    console.log ("router got response: " + status);

                    headers = {
                        'Content-Type': 'application/json'
                    }
                    response.writeHead(200, headers);
                    response.end(scheduleJSON);
                } else {
                    response.writeHead(400,{'Content-Type': 'text/plain'});
                    response.end(status);
                }
            }
            break;
        case "/add_schedule_entry":
            if (method == "POST"){
                let result = scheduler.addScheduleEntry(body);
                if (result == "ok"){
                    auth.renewToken(user, response);
                    response.writeHead(204);
                    response.end();
                } else {
                    response.writeHead(400,{'Content-Type': 'text/plain'});
                    response.end(result);
                }
            }
            break;
        case "/modify_schedule_entry":
            if (method == "POST"){          
                let result = scheduler.modifyScheduleEntry(body);
                if (result == "ok"){
                    auth.renewToken(user, response);
                    response.writeHead(204);
                    response.end();
                } else {
                    response.writeHead(400,{'Content-Type': 'text/plain'});
                    response.end(result);
                }
            }
            break;
        case "/delete_schedule_entry":
            if (method == "POST"){          
                let result = scheduler.removeScheduleEntry(body);
                if (result == "ok"){
                    auth.renewToken(user, response);
                    response.writeHead(204);
                    response.end();
                } else {
                    response.writeHead(400,{'Content-Type': 'text/plain'});
                    response.end(result);
                }
            }           
            break;
        case "/getFilelist":
            if (method == "GET"){          
                let status, filelistJSON;
                let result = recordsFileReader.getRecordsFilesList();
                status = result[0];
                filelistJSON = JSON.stringify(result[1]);
                if (status == "ok"){
                    console.log ("router got response: " + status);
                    auth.renewToken(user, response);
                    headers = {
                        'Content-Type': 'application/json'
                    }

                    response.writeHead(200, headers);
                    response.end(filelistJSON);
                } else {
                    response.writeHead(400,{'Content-Type': 'text/plain'});
                    response.end(status);
                }
            }    
            break; 
        case "/downloads/" + url.replace(/^\/downloads\//gi,""):
            console.log("Download section!");
            let dldPrefix = "./records/";
            let downloadPath = url.replace(/^\/downloads\//gi,dldPrefix);
            if (method == "GET"){
                auth.renewToken(user, response);
                fileReader.getFile(downloadPath, "downloads", response);
            }
            break; 
        case "/delete_files":
            console.log("Delete files section");
            if (method == "POST"){
                let result = recordsFileDeleter.deleteRecord(body);
                if (result == "ok"){
                    auth.renewToken(user, response);
                    response.writeHead(204);
                    response.end();
                } else {
                    response.writeHead(400,{'Content-Type': 'text/plain'});
                    response.end(result);
                }
            }
            break;
        case "/unauthorized":
            console.log("router: unathorized!");
            let path = "/unauthorized/index.html";
            fileReader.getFile(path, "pages", response, user);
            break;
        case "/auth":
            console.log("router: auth section");
            if (method == "POST"){
                console.log(`user: ${body.username}, password: ${body.password}`);
                let result = auth.auth(body.username, body.password);
                console.log (`router: result user: ${body.username}, pass: ${body.password}`);
                if (result == "ok"){
                    auth.renewToken(body.username, response);
                    
                    response.writeHead(204);
                    response.end();
                } else {
                    response.writeHead(400,{'Content-Type': 'text/plain'});
                    response.end(result);
                }
            } else
            if (method == "GET"){
                if (user){
                    console.log("router: auth athorized!");
                } else {
                    console.log("router: unathorized!");
                    let path = "/auth/index.html";
                    fileReader.getFile(path, "pages", response, user);
                }
            } else {
                response.writeHead(400,{'Content-Type': 'text/plain'});
                response.end("Method is not GET/POST");
            }

            break;
        default:
            if (!isPathWithFilename(url)){  //секция для страничек - view
                url = url + "index.html";
            } 
            if (!/((.css$)|(.js$))/i.test(url)){
                auth.renewToken(user, response);
            };
            if (method == "GET"){
                if (isPathIsRootPath(url)){
                    let prefix = "/default";
                    url = prefix + url;
                }
                fileReader.getFile(url, "pages", response, user);
            }
            break;
   }




    

}

function isPathWithFilename(path){
    let regexp = /\/$/gi;
    if (regexp.test(path)){
        return false;
    } else {
        return true;
    }
}

function isPathIsRootPath(path){
    let regexp = /\//gi;
    let findedRoot = path.match(regexp);
    if (findedRoot != null){
        if (findedRoot.length == 1){
            return true;
        }
    }
    return false;
}
