const fs = require('fs');
const defaultPrefix = "records/";

exports.deleteRecord = function(name){
    let metaFilename = name + ".meta";
    let mp3Filename = name + ".mp3";
    let pathMetaFile = "./" + defaultPrefix + metaFilename;
    let pathMp3File = "./" + defaultPrefix + mp3Filename;
    let status = "";
    try{
        fs.rmSync(pathMetaFile);
        fs.rmSync(pathMp3File);
        status = "ok";
    } catch(err){
        status = err;
    } finally{
        return status;
    }
}