const fileReader = require('./filereader.js');
const scheduler = require('./scheduler.js');
exports.route = function (url, method, body,request,response){
    console.log("router url:" + url);
    console.log("router method: " + method);
    console.log("router body: " + body);
/*     let view = new URL(request.url, `http://127.0.0.1:3000`);
    console.log(view.pathname);
    console.log(view.search);
    console.log(view.searchParams); */

    switch (url){
        case "/":
            if (method == "GET"){
                fileReader.getFile("/schedule.htm", response);
            }

            break;
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
        default:
            if (method == "GET"){
                fileReader.getFile(url,response);
            }
            break;
    }

}