//const { scheduler } = require("timers/promises");
const validator = require('./validator.js');
const recorder = require ('./recorder.js');

let scheduleArray = [
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
    return "ok"
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
        return "ok";
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
        return "ok";
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
    return "ok";
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