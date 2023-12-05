const fs = require('fs');
const defaultPrefix = "pages/default";

exports.getFile = function (filePath, response){


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
    console.log("request path filreader: " + filePath);
    let test = fs.existsSync(filePath)
    console.log("filreader: path exists: " + test);
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
    console.log("filereader final path: " + filePath);
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