const fs = require('fs');
const pagesPrefix = "pages";


exports.getFile = function (filePath, mode, response){


    //const basePath = "";
    let regexp_htm = /\.(txt|htm|html)$/gi;
    let regexp_css = /\.css$/gi;
    let regexp_js = /\.js$/gi;
    let regexp_mp3 = /\.mp3$/gi;
    //let options;
    let headers = {
        'Content-Type': 'image/png'
    }
    let responseCode;
    if (mode == "pages"){
        filePath = pagesPrefix + filePath;
    }
    console.debug("request path filereader: " + filePath);
    let test = fs.existsSync(filePath)
    console.log("filereader: path exists: " + test);
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
        if (regexp_mp3.test(filePath)){
            headers['Content-Type'] = 'audio/mpeg3';
        }
    }
    console.log("filereader final path: " + filePath);
    fs.readFile(filePath, (err, data) => {
        if (err){
            console.log(err);
            response.writeHead(500);
            response.end();
            //throw err;
        } 
        response.writeHead(responseCode, headers);
        //console.log(data);
        response.end(data);

    });
}