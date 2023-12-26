const fileReader = require('./filereader.js');
const scheduler = require('./scheduler.js');
const recordsFileReader = require('./recordsfilereader.js');
exports.route = function (url, method, body,request,response){
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
                fileReader.getFile(downloadPath, "downloads", response);
            }
            break; 
        default:
            if (!isPathWithFilename(url)){  //секция для страничек - view
                url = url + "index.html";
            } 
            if (method == "GET"){
                if (isPathIsRootPath(url)){
                    let prefix = "/default";
                    url = prefix + url;
                }
                fileReader.getFile(url, "pages", response);
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