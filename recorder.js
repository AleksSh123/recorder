const http = require('node:http');
const https = require('node:https');
require ('node:buffer');
const fs = require("fs");
const PORT = 3001;
let recordAllowed = true;
let recordStarted = false;
let startUnixTime;
const url = "https://silverrain.hostingradio.ru/silver128.mp3";
module.exports.getUnixTimeByShortTime = getUnixTimeByShortTime;

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
]

//let timer = setInterval(getStart,1000);

function getUnixTimeByShortTime(timeString){
    let parsed = timeString.match(/(\d+):(\d+)/);
    let customHours = Number(parsed[1]);
    let customMinutes = Number(parsed[2]);
    let customSeconds = 0;
    let currentTime = new Date();
    currentTime.setHours(customHours);
    currentTime.setMinutes(customMinutes);
    currentTime.setSeconds(customSeconds);
    let customCurrentUnixTime = currentTime.getTime();
    return customCurrentUnixTime;
}

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
    const month = get2Digits(currentTime.getMonth());
    const date = get2Digits(currentTime.getDate());
    const hours = get2Digits(currentTime.getHours());
    const minutes = get2Digits(currentTime.getMinutes());
    const seconds = get2Digits(currentTime.getSeconds());
    const result = year + month + date + "_" + hours + minutes + seconds;
    return result;
}

function getStart(){
    let currentTime = new Date();
    let currentUnixtime = currentTime.getTime();

    if (currentTime.getSeconds() == 0){
        console.log("tick");
    }


    let startUnixTime;
    let stopUnixtime;

    for (let task of schedule){
        if (task.enabled){
            if (!task.started){
                startUnixTime = getUnixTimeByShortTime(task.startTime);
                stopUnixtime = getUnixTimeByShortTime(task.stopTime);
                if (stopUnixtime < startUnixTime) stopUnixtime += 86400000;
            } else{
                startUnixTime = task.startUnixTime;
                stopUnixtime = task.stopUnixTime;
            }
            if ((currentUnixtime > startUnixTime) && (currentUnixtime < stopUnixtime)){ //если время в заданном промежутке
                if((!task.started) && (recordAllowed)){  //если задание не стартовано и запись не идет
                    console.log("start!")
                    recordAllowed = false;  //разрешаем запись
                    task.startUnixTime = startUnixTime;
                    task.stopUnixTime = stopUnixtime;
                    getRadio (); //команда на запись
                    task.started = true;
                } else {
                    if ((task.started && !recordAllowed) ||
                     (!task.started && recordAllowed)) throw "Error! unacceptable combination of internal parameters";
                };
 

            } else{ //если время вне заданного промежутка
                if (task.started){
                    task.started = false; //помечаем в расписании
                    recordAllowed = true;  //останваливаем запись
                } 
    
            }
        }

    }

}

function getRadio(){
    https.get(url, res => {
        let data = [];
        let length = 0;
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Status Code:', res.statusCode);
        console.log('Date in Response header:', headerDate);
        let i = 0;
        recordStarted = true;
        res.on('data', (chunk) => {
          data.push(chunk);
          let currentDate = new Date();
          length += chunk.length;
          i++;
          if ((i % 500) == 0){
            console.log (`Recording ${i} part`);
            console.log (currentDate);
            
          }
          
          let currentUnixtime = currentDate.getTime();
          if (recordAllowed){
              res.destroy();
              console.log("Overall length is " + length);
              let fileName = `${getCurrentLongDate()}_silver.mp3`
               console.log("Writing file " + fileName);
              const buffer = Buffer.concat(data,length);
              fs.writeFile('/Users/Alex/Documents/DEVELOPMENT/Node/' + fileName, buffer, (err) => {
                  if (err) {
                      console.error(err);
                      recordStarted = false;
                      return;
                  }
                  console.log("file written successfully");
                  recordStarted = false;
              });
          };
        });
      
        res.on('end', () => {
          console.log('Response ended: ');
        });
      
      });
    }


 