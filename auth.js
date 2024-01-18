const fs = require('node:fs');
const users = require('./users.json');
const usersFilename = './users.json';
exports.getUserByToken = function(token){
    for (let user in users){
        if (users[user].token == token){
            return user;
        }
    }
    return false;
}

exports.renewToken = function(user, response){
    //let currentTime = new Date();
    //let renewedUnixTime = (currentTime.setMinutes(currentTime.getMinutes() + 60)).getTime();
/*     for (let user in users){
        if (user.token == token){
            user.expire = renewedUnixTime;
            writeUsers();
        }
    } */
    if (user){
        let newToken = generateNewToken();
        users[user].token = newToken;
        writeUsers();
        response.setHeader('Set-Cookie', [`user=${user}; Path=/`, `token=${newToken}; Path=/`]);
        //console.log(`auth: user - ${user}`)
        //console.log(`auth: new token - ${newToken}`)
        let headers = response.getHeaders();
        console.log("auth: renew token for user " + user );
        console.dir(headers);
    } else {
        console.log("auth: no user");
    }

    
}

exports.deleteToken = function(user){

}
exports.auth = function(userName, pass){

    for (let user in users){
        if (user == userName){
            if (users[user].password == pass){
                return "ok";
            };
        }
    }
    return "user not found";
}
function writeUsers(){
    const data = JSON.stringify(users);
    fs.writeFile(usersFilename, data, (err) => {
        if (err){
            console.log("error while writing users!");
            throw err;
        }
        console.log("users writes succesfully!");
    });
}
function generateNewToken(){
    let template = "xxxx-xxxxxxx-xxxx-xxxx";
    let result = template.replace(/x/gi, function(r){
        let n = Math.floor(Math.random() * 16);
        return n.toString(16);
    });
    return result;
}