const req = require('express/lib/request');
const fs = require('fs');
const http = require('node:http');
const defaultPrefix = "pages/default";
const prefix = "pages/";
const recorder = require ('./recorder.js');
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
            getFile("/schedule.htm", response);
            break;
        case "/favicon.ico":
/*             const basePath = "default";
            fs.readFile(basePath + "/favicon.ico", (err, data) => {
                if (err) throw err;
                response.writeHead(200, {'Content-Type': 'image/png'});
                response.end(data);
        
            }); */
            getFile("/favicon.ico", response);
            console.log("Got it!");
            break;
        case "/set_schedule":
            if (request.method == "POST"){
                request.on('end', () => {
                    if (chunkArray){
                        body = chunkArray.join("");
                        //console.log(body);
                        let setResult = set_schedule(body);
                        if (setResult == true){
                            response.writeHead(204);
                            response.end();
                        } else {
                            response.writeHead(400,{'Content-Type': 'text/plain'});
                            response.end(setResult);
                        }
                        //set_schedule(body);
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
        case "/delete_schedule_entry":
            if (request.method == "POST"){
                request.on('end', () => {
                    if (chunkArray){
                        body = chunkArray.join("");
                        body = JSON.parse(body);
                        console.log(body);
                        let deleteResult = deleteEntrys(body);
                        if (deleteResult == true){
                            response.writeHead(204);
                            response.end();
                        } else {
                            response.writeHead(400,{'Content-Type': 'text/plain'});
                            response.end(deleteResult);
                        }
                    }
                });
            }
            break;
        case "/modify_schedule":
            if (request.method == "POST"){
                request.on('end', () => {
                    if (chunkArray){
                        body = chunkArray.join("");
                        body = JSON.parse(body);
                        console.log(body);
                        let modifyResult = modifyEntrys(body);
                        if (modifyResult == true){
                            response.writeHead(204);
                            response.end();
                        } else {
                            response.writeHead(400,{'Content-Type': 'text/plain'});
                            response.end(modifyResult);
                        }
                    }
                });
            }
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
    let regexp_js = /\.js$/gi;
    //let options;
    let headers = {
        'Content-Type': 'image/png'
    }
    let responseCode;
    filePath = defaultPrefix + filePath;
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
        if (regexp_js.test(filePath)){
            headers['Content-Type'] = 'application/javascript';
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
        //console.log(data);
        response.end(data);

    });
}

function set_schedule(body){

//    let array = body.split("&");
/*     
     */
    let newEntry = JSON.parse(body);
    let checkResult = validateEntry(newEntry,"add",1);
    if (checkResult == "ok"){
        let newFormattedEntry = new class {
            startTime = null
            startUnixTime = 0
            stopTime = null
            stopUnixTime = 0
            started = false
            name = null
            enabled = false
        };
        for (let element in newEntry){
            newFormattedEntry[element] = newEntry[element]  // Проверка на корректный состав элементов переданной записи!! Проверить назначение элемента вкл/выкл
        }
        schedule_object.push(newFormattedEntry);
        return true;
    } else{
        return checkResult;
    }   
}

function validateEntry(entry,mode,entrysCount){

    if (entrysCount == 1){
        if (typeof(entry.name)!="string") return "The name is not string";
    }
    if (!entryHasEnabledProp(entry)) return "Entry has no enabled/disabled property";
    let matchedEntrys = schedule_object.filter(function(item){
        return entry.name == item.name
    })
    
    if (mode == "add"){
        if (matchedEntrys.length != 0) {
            return "Entry name alredy exist"
        }
        if ((!entryHasName(entry))||
            (!entryHasTime(entry))||
            (!entryHasEnabledProp(entry))){
                return "Some nedded propertys of entry is absent"
        }
    } else if ((mode == "edit") && (entrysCount == 1)) {
        if (matchedEntrys.length == 0){
            return "None of entrys selected "
        }
        if (matchedEntrys == 1){
            if ((!entryHasName(entry))||
                (!entryHasTime(entry))||
                (!entryHasEnabledProp(entry))){
                    return "Some nedded propertys of entry is absent"
            }
        }
        if (matchedEntrys > 1){
            return "multiply entrys in schedule for selected names"
        }
    } else if ((mode == "edit") && (entrysCount > 1)) {
        if ((entryHasName(entry))||
        (entryHasTime(entry))||
        (!entryHasEnabledProp(entry))){
            return "unacceptable combination of parameters for group modify"
        }
    } else {
        throw `Unknown mode:${mode} for validateEntry function`;
    }
    if (((matchedEntrys.length == 1) && (mode == "edit"))||
        ((matchedEntrys.length == 0) && (mode == "add"))){ //делаем проверку на пересечение дипазанов только для add и 0 совпадений либо edit и 1 совпадение
            for (let element of schedule_object){
                if (element.name == entry.name){
                    if (mode == "edit") break; // исключаем из списка сравнения текущую позицию изменения
                }
                let entryTimeRange = getRange(entry);
                let currentElementRange = getRange(element);
                if (rangesIsOverlapped(entryTimeRange, currentElementRange)) return "Start or stop time overlap with existing scheduler";
            }
    }

    return "ok";

    function entryHasName(entry){
        if (entry.name){
            let value = entry.name.trim();
            if (value.length > 0) return true;
        }
        return false;
    }
    function entryHasTime(entry){
        if ((entry.startTime) && (entry.stopTime)){
            let value1 = entry.startTime.trim();
            let value2 = entry.stopTime.trim();
            if ((value1.length > 0)|| (value2.length > 0)) return true;
        }
        return false;
    }
    function entryHasEnabledProp(entry){
        if ('enabled' in entry){
            if ((entry.enabled === true)||(entry.enabled === false)) return true;
        }
        return false;
    }
    function getRange(entry){
        let response = [];
        response[0] = recorder.getUnixTimeByShortTime(entry.startTime);
        response[1] = recorder.getUnixTimeByShortTime(entry.stopTime);
        if (response[1] < response[0]) response[1] += 86400000;
        return response;
    }
    
    function rangesIsOverlapped(range1, range2){
    
        if (((range1[0] >= range2[0]) && (range1[0] <= range2[1])) ||
        ((range1[1] >= range2[0]) && (range1[1] <= range2[1]))) {
            return true;
        } else if(((range2[0] >= range1[0]) && (range2[0] <= range1[1])) ||
         ((range2[1] >= range1[0]) && (range2[1] <= range1[1]))){
            return true;
        } else {
            return false;
        }
    }
}

function modifyEntrys(body){
    //дописать!!!
    let inputData = body[0];
    let entrysList = body[1];
    if (entrysList.length > 1){
        let inputDataHasOnlyEnabledProp = false;
        let inputDataHasEnabledProp = false;
        let inputDataHasOtherProp = false;
        for (let property in inputData){
            if (property != "enabled") inputDataHasOtherProp = true;
            if (property == 'enabled') inputDataHasEnabledProp = true;
        }
        if (inputDataHasEnabledProp && !inputDataHasOtherProp) inputDataHasOnlyEnabledProp = true;
        if (!inputDataHasOnlyEnabledProp){
            return "Input data have not only enabled property for multiply entrys"
        }
    }
    let checkResult = validateEntry(inputData,"edit",entrysList.length);
    if (checkResult == "ok"){
        for (let name of entrysList){
            for (let entry of schedule_object){
                if (entry.name == name){
                    for (let property in inputData){
                        entry[property] = inputData[property];
                    }
                }
            }
        }



        return true;
    } else{
        return checkResult;
    }   

}
function deleteEntrys(names){
    if(!Array.isArray(names)){
        return "wrong type of recieved data!"
    }
    for (let name of names){
        if (!Boolean(name)) return "get unacceptable string as name";
        let findedIndex = schedule_object.findIndex(function(item){
            return name == item.name;
        })
        if (findedIndex == -1) return `element ${name} not found`
        schedule_object.splice(findedIndex,1);
    }
    return true;
}

server.listen(3000);