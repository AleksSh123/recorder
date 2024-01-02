const fs = require('fs');

exports.readFile = function (filePath){
    let result = [];
    let testPath = fs.existsSync(filePath);
    console.log("fileio: path exists: " + testPath);
    if (testPath){
        let data = fs.readFileSync(filePath);
        try{
            result[1] = JSON.parse(data);
            for(let entry of result[1]){  //игнорируем флаг started при чтении конфигурации
                entry.started = false;
            }
            result[0] = "ok";
        }catch (err){
            result[0] = err;
        }finally{

            return result;
        }
    } else {
        result[0] = `file not exist`;
        return result;
    }
}
exports.writeFile = function(filePath, obj){
    let result = [];
    let schedule = JSON.stringify(obj);
    for (let entry of schedule){
        entry.started = false;
        entry.startUnixTime = 0;
        entry.stopUnixTime = 0;
    }
    fs.writeFileSync(filePath,schedule);
    result[0] = "ok";
    return result
}