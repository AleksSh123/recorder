

function sendLogin(){
    let form = document.forms.userLoginForm;
    let user = form.elements.login.value;
    let pass = form.elements.password.value;
    let requestBody = {
        username: login,
        password: pass
    }
    alert (requestBody);
}

//alert("start!");