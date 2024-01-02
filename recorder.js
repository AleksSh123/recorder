//const http = require('node:http');
const https = require('node:https');
require ('node:buffer');
const fs = require("fs");
const PORT = 3001;
module.exports.recordStarted = false;
const filepathPrefix = "./records/";
let stopRecord = false;

//module.exports.getUnixTimeByTextTime = getUnixTimeByTextTime;
/* 
let schedule = [
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
    }
] */

//let timer = setInterval(getStart,1000);



function get2Digits(number){
    let result;
    if (number < 0) throw "Incorrect number!";
    if (number < 10){
        result = "0" + String(number);
    } else{
        result = String(number);
    }
    return result;
}
function getCurrentLongDate(){
    const currentTime = new Date();
    const year = String(currentTime.getFullYear());
    let month = get2Digits(currentTime.getMonth());
    month++;
    const date = get2Digits(currentTime.getDate());
    const hours = get2Digits(currentTime.getHours());
    const minutes = get2Digits(currentTime.getMinutes());
    const seconds = get2Digits(currentTime.getSeconds());
    const result = year + month + date + "_" + hours + minutes + seconds;
    return result;
}



exports.startRecord = function (url, task){
    let chunk;
    stopRecord = false;
    https.get(url, res => {
        let data = [];
        let length = 0;
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Status Code:', res.statusCode);
        console.log('Date in Response header:', headerDate);
        let i = 0;
        module.exports.recordStarted = true;
        res.on('data', (chunk) => {
            data.push(chunk);
            let currentDate = new Date();
            length += chunk.length;
            i++;
            if ((i % 500) == 0){
                console.log (`recorder: recording ${i} part`);
                console.log (currentDate);
            }
            if (stopRecord){
                res.destroy();
                console.log("recorder: Overall length is " + length);
                let baseName = `${getCurrentLongDate()}_${task.name}`;
                let mp3FileName = `${baseName}.mp3`;
                console.log("recorder: Writing file " + mp3FileName);
                const buffer = Buffer.concat(data,length);
                fs.writeFile(filepathPrefix + mp3FileName, buffer, (err) => {
                    if (err) {
                        console.error(err);
                        module.exports.recordStarted = false;
                        return;
                    }
                    console.log("recorder: mp3file written successfully");
                    module.exports.recordStarted = false;
                    let metafileName = `${baseName}.meta`;
                    const currentDate = new Date();
                    const currentUnixtime = currentDate.getTime();
                    const mp3FileStats = fs.statSync(filepathPrefix + mp3FileName);
                    //console.log(mp3fileSize);
                    const metaData = JSON.stringify({
                        taskName: task.name,
                        taskStartUnixTime: task.startUnixTime,
                        taskStopUnixTime: currentUnixtime,
                        taskMp3FileSize: mp3FileStats.size
                    })
                    fs.writeFile(filepathPrefix + metafileName, metaData, (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        console.log("recorder: metafile written successfully");
                    });
                });

          };
        });
      
        res.on('end', () => {
          console.log('recorder: Response ended: ');
          module.exports.recordStarted = false;
        });
      
      });
    }

exports.stopRecord = function (){
    stopRecord = true;
}
 