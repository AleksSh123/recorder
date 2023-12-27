const fs = require('fs');
const defaultPrefix = "records/";

exports.getRecordsFilesList = function(){
    let status;
    let resulListFilesWithMeta = [];
    let responseData = [];
    let regexp_mp3 = /\.mp3$/gi;
    let regexp_meta = /\.meta$/gi;
    let path = "./" + defaultPrefix; 
    let dirContent;
    try{
        dirContent = fs.readdirSync(path);
    } catch(err){
        console.log(err);
        return err;
    }
   
    console.dir(dirContent);
    for (let file of dirContent){
        if (regexp_mp3.test(file)){
            const metaFilename = file.replace(regexp_mp3, ".meta");
            if (dirContent.includes(metaFilename)){
                resulListFilesWithMeta.push([file, metaFilename]);
            }
        }
    }
    responseData[0] = "ok";
    responseData[1] = getResponseFromMetafiles(resulListFilesWithMeta); 
    return responseData;


}
function getResponseFromMetafiles(filesWithMetaList){
    responseArr = [];
    let path = "./" + defaultPrefix;
    for (let entry of filesWithMetaList){
        let contentJSON = fs.readFileSync(path + entry[1]);
        let content = JSON.parse(contentJSON);
        content.filename = entry[0];
        content.pathFilename = path + entry[0];
        responseArr.push(content);
    }
    return responseArr;
}