//const { scheduler } = require("timers/promises");
const validator = require('./validator.js');
const recorder = require ('./recorder.js');
const cfgio = require('./cfgio.js');
const url = "https://silverrain.hostingradio.ru/silver128.mp3";
const cfgFile = "./schedule.cfg";
let scheduleArray = [];
let clientTzOffset = -7;
const serverTzOffset = (new Date().getTimezoneOffset()) / 60;


let readStatus = cfgio.readFile(cfgFile);
if (Array.isArray(readStatus)){
    if (readStatus[0] == "ok"){
        scheduleArray = readStatus[1];
    } else{
        throw readStatus[0];
    }
} else {
    throw readStatus;
}


/* let scheduleArray = [
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
    }]; */



exports.getSchedule = function() {
    const scheduleJSON = JSON.stringify(scheduleArray);
    const result = ["ok", scheduleJSON]
    return result;
}
exports.addScheduleEntry = function(body) {
    console.log("scheduler recieve body: " + body)
    //const newEntry = JSON.parse(body);
    const newEntry = body;
    let checkFieldsIsCorrect = validator.checkSingleEntry(newEntry);
    if (checkFieldsIsCorrect != "ok") return checkFieldsIsCorrect;
    if (namesCountExistInSchedule(newEntry) != 0) return "entry name already exist";
    if (timeRangesIsConflict(newEntry,"noexcept")) return "Start or stop time overlaps with existing scheduler";
    let newFormattedEntry = new class {
        startTime = newEntry.startTime
        startUnixTime = 0
        stopTime = newEntry.stopTime
        stopUnixTime = 0
        started = false
        name = newEntry.name
        enabled = newEntry.enabled
    };
    scheduleArray.push(newFormattedEntry);
    let writeStatus = cfgio.writeFile(cfgFile, scheduleArray);
    if (writeStatus[0] == "ok"){
        return "ok";
    } else { 
        throw writeStatus[0];
    }
    
}
exports.modifyScheduleEntry = function(body) {
    //const modifyDataArray = JSON.parse(body);
    const modifyDataArray = body;
    if (modifyDataArray.length != 2) return "incorrect data in request";
    const inputData = modifyDataArray[0];
    const namesArray = modifyDataArray[1];
    if (namesArray.length == 0) return "no name selected";
    if (namesArray.length == 1){
        if (inputData.name != namesArray[0]) return "name in input data and name in list to change (in request) are different"
        const count = namesCountExistInSchedule(inputData);
        if (count == 0) return "no such name in scheduler";
        let checkFieldsIsCorrect = validator.checkSingleEntry(inputData);
        if (checkFieldsIsCorrect != "ok") return checkFieldsIsCorrect;
        if (timeRangesIsConflict(inputData,"except")) return "Start or stop time overlaps with existing scheduler";
        for (let entry of scheduleArray){
            if (entry.name == namesArray[0]){
                for (let property in inputData){
                    entry[property] = inputData[property];
                }
            }
        }
        let writeStatus = cfgio.writeFile(cfgFile, scheduleArray);
        if (writeStatus[0] == "ok"){
            return "ok";
        } else { 
            throw writeStatus[0];
        }
    }
    if (namesArray.length >1){
        let checkFieldsIsCorrect = validator.checkEnabledPropOnly(inputData);
        if (checkFieldsIsCorrect != "ok") return checkFieldsIsCorrect;
        for (let name of namesArray){
            for (let entry of scheduleArray){
                if (entry.name == name){
                    for (let property in inputData){
                        entry[property] = inputData[property];
                    }
                }
            }
        }
        let writeStatus = cfgio.writeFile(cfgFile, scheduleArray);
        if (writeStatus[0] == "ok"){
            return "ok";
        } else { 
            throw writeStatus[0];
        }
    }
}
exports.removeScheduleEntry = function(body) {
    //const namesArray = JSON.parse(body);
    const namesArray = body;
    if (!Array.isArray(namesArray)) return "recived names data is not array";
    for (let name of namesArray){  
        let findedIndex = scheduleArray.findIndex(function(item){
            return name == item.name;
        })
        if (findedIndex == -1) return `entry ${name} not found`
        scheduleArray.splice(findedIndex,1); 
    }
    let writeStatus = cfgio.writeFile(cfgFile, scheduleArray);
    if (writeStatus[0] == "ok"){
        return "ok";
    } else { 
        throw writeStatus[0];
    }
}

function startScheduler(schedule, url){
    let currentTime = new Date();
    let currentUnixtime = currentTime.getTime();

    if (currentTime.getSeconds() == 0){
        console.log("tick");
    }

    let startUnixTime;
    let stopUnixtime;

    for (let task of schedule){
        //console.log(`task name ${task.name}, starts ${task.startTime}, stops ${task.stopTime}, enabled:${task.enabled}, started:${task.started}`);
        if (task.enabled){
            
            if (!task.started){ //вычисляем актуальное время старта и стопа в текущие сутки
                startUnixTime = getUnixTimeByTextTime(task.startTime);
                stopUnixtime = getUnixTimeByTextTime(task.stopTime);
                if (stopUnixtime < startUnixTime) stopUnixtime += 86400000;
            } else{
                startUnixTime = task.startUnixTime;
                stopUnixtime = task.stopUnixTime;
            }
            //console.log(`startUnixTime:${startUnixTime}, currentUnixTime:${currentUnixtime}, stopUnixTime:${stopUnixtime}`)
            if ((currentUnixtime > startUnixTime) && (currentUnixtime < stopUnixtime)){ //если время в заданном промежутке
                if (task.started){ // и задание запущено
                    if(!recorder.recordStarted){  //  проверяем
                        throw "Error! unacceptable combination of  property 'started' and status of recorder";
                    }
                } else{ // и задание не запущено
                    if (recorder.recordStarted){ //  проверяем
                        throw "Error! unacceptable combination of  property 'started' and status of recorder";
                    }
                    console.log("scheduler: start recording!") // запускаем
                    task.startUnixTime = startUnixTime; //фиксируем время фактического старта
                    task.stopUnixTime = stopUnixtime; //и будущего  стопа
                    console.log("recorder: lets get start!");
                    recorder.startRecord(url,task); //команда на запись
                    task.started = true;
                }
            } else { //если время не в диапазоне
                if (task.started){ // и задание запущено
                    if (!recorder.recordStarted){ //проверяем
                        throw "Error! unacceptable combination of  property 'started' and status of recorder";
                    }
                    console.log("scheduler: stop record!");
                    recorder.stopRecord(); //останавливаем и помечаем что задание остановлено
                    task.started = false;
                }

            }

        } else {
            if (task.started){
                if (!recorder.recordStarted){ //проверяем
                    throw "Error! unacceptable combination of  property 'started' and status of recorder";
                }
                console.log("scheduler: stop record!");
                recorder.stopRecord()  //останваливаем запись
                task.started = false;
            }

        }

    }

}

function timeRangesIsConflict(checkEntry,mode){
    for (let entry of scheduleArray){
        if (checkEntry.name == entry.name){
            if (mode == "except") break; // исключаем из списка сравнения текущую позицию изменения
        }
        const entryTimeRange = getRange(entry);
        const checkEntryTimeRange = getRange(checkEntry);
        if (rangesIsOverlapped(entryTimeRange, checkEntryTimeRange)) return true;
    }
    return false;
}
function namesCountExistInSchedule(entry){
    let matchedEntrys = scheduleArray.filter(item => {
        return item.name == entry.name
    });
    return matchedEntrys.length;
}

function getRange(entry){
    let response = [];
    response[0] = getUnixTimeByTextTime(entry.startTime);
    response[1] = getUnixTimeByTextTime(entry.stopTime);
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

function getUnixTimeByTextTime(timeString){
    const currentTzOffset = clientTzOffset - serverTzOffset;
    let parsed = timeString.match(/(\d+):(\d+)/);
    let customHours = Number(parsed[1]);
    //customHours += currentTzOffset;
    //if (customHours < 0){
//	customHours += 24;
//    };
    let customMinutes = Number(parsed[2]);
    let customSeconds = 0;
    let currentTime = new Date();
    currentTime.setHours(customHours);
    currentTime.setMinutes(customMinutes);
    currentTime.setSeconds(customSeconds);
    currentTime.setHours(currentTime.getHours() + currentTzOffset);
/*     console.log(`settedTime: ${currentTime}`);
    console.log(`currentTzOffset: ${currentTzOffset}`);
    console.log(`scheduler: get time ${timeString}, got time ${currentTime}`);
    console.log(`Current time ${new Date()}`); */
    let customCurrentUnixTime = currentTime.getTime();
    return customCurrentUnixTime;
}

let timer = setInterval(startScheduler, 1000 ,scheduleArray, url);