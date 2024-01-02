let flParentContainerEl = document.getElementById("recordListContainer");
let selectedEntryNames = new Set();
const url = "/getFilelist";
drawRecordList();

async function getList(){
    let flData;
    let response = await fetch(url);
    if (response.ok){
        flData = await response.json();
    } else {
        alert("Ошибка HTTP: " + response.status);
    }
    
    return flData;

}

async function drawRecordList(){
    let list = await getList();
    for (let entry of list){
        addElement(entry, flParentContainerEl);
    }
}

function unixToFriendlyDate(unixTime){
    let date = new Date(unixTime);
    let year = date.getFullYear();
    let month = to2Digits(date.getMonth());
    month++;
    let day = to2Digits(date.getDate());
    let hours = to2Digits(date.getHours());
    let minutes = to2Digits(date.getMinutes());
    let seconds = to2Digits(date.getSeconds());
    let result = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return result;
}

function to2Digits(number){
    if (number < 10){
        result = `0${String(number)}`
    } else {
        result = String(number);
    }
    return result;
}

function addElement(entry, containerElement){
    let filename = entry.filename;
    let id = filename.replace(/.mp3$/i,"");
    let selectEl = document.createElement('input');
        selectEl.setAttribute("type","checkbox");
        selectEl.id = id + "-select";
        selectEl.setAttribute("onchange","setSelectedStatus(this)");

        let rowEl = document.createElement('div');
        rowEl.id = id + "-row";
        rowEl.classList.add("rowClass");

        let nameEl = document.createElement('div');
        nameEl.classList.add("nameCellClass");
        nameEl.id = id + "-namecell";

        let startDateEl = document.createElement('div');
        startDateEl.classList.add("timeCellClass");
        startDateEl.id = id + "-starttimecell"

        let stopDateEl = document.createElement('div');
        stopDateEl.classList.add("timeCellClass");
        stopDateEl.id = id + "-stoptimecell"

        

        let filenameEl = document.createElement('div');
        filenameEl.id = id + "-filenamecell";
        let filenameRefEl = document.createElement('a');
        filenameRefEl.href = location.origin + "/downloads/" + entry.filename;
        filenameRefEl.innerText = entry.filename;
        filenameEl.appendChild(filenameRefEl);

        let sizeEl = document.createElement("div");
        sizeEl.id = id + "-size";
        sizeEl.classList.add("sizeCellClass");

        nameEl.innerHTML = entry.taskName;

        startDateEl.innerHTML = unixToFriendlyDate(entry.taskStartUnixTime);

        //stopDateEl.innerHTML = unixToFriendlyDate(entry.taskStopUnixTime);
        stopDateEl.innerHTML = getDuration(entry.taskStartUnixTime, entry.taskStopUnixTime);

        sizeEl.innerHTML = getFriendlySize(entry.taskMp3FileSize);

        rowEl.appendChild(selectEl);
        rowEl.appendChild(nameEl);
        rowEl.appendChild(startDateEl);
        rowEl.appendChild(stopDateEl);
        rowEl.appendChild(filenameEl);
        rowEl.appendChild(sizeEl);

        containerElement.appendChild(rowEl);
}
function getFriendlySize(number){
    let x;
    let result;
    if (number > 1000000){
        x = number / 1000000;
        result = x.toFixed(1);
        result = result + " Mb";
    } else if(number > 0){
        x = number / 1000;
        result = x.toFixed(1);
        result = result + " Kb";
    } else {
        result = ""
    }
    return result;
}

function getDuration(startUnixTime, stopUnixTime){
    let duration = stopUnixTime - startUnixTime;
    //console.log(duration);
    let friendlyDuration = new Date(duration);
    let result;
    let days = friendlyDuration.getUTCDate();
    days--;
    let hours = friendlyDuration.getUTCHours();
    let minutes = friendlyDuration.getUTCMinutes();
    let seconds = friendlyDuration.getUTCSeconds();
    //console.log(`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`);
    if (days > 0){
        result = `${to2Digits(days)}d ${to2Digits(hours)}h ${to2Digits(minutes)}m ${to2Digits(seconds)}s`;
    } else if (hours > 0){
        result = `${to2Digits(hours)}h ${to2Digits(minutes)}m ${to2Digits(seconds)}s`;
    } else if (minutes > 0){
        result = `${to2Digits(minutes)}m ${to2Digits(seconds)}s`;
    } else if (seconds > 0){
        result = `${to2Digits(seconds)}s`;
    }
    return result;
}
function setSelectedStatus(object) {
    let objectId = object.id;
    let entryName = objectId.split('-');
    //alert(entryName[0]);
     if (object.checked){
        selectedEntryNames.add(entryName[0]);
    } else{
        let deleteStatus = selectedEntryNames.delete(entryName[0]);
        if (!deleteStatus) throw "deselecting not selected element!!!";
    }

    console.log(selectedEntryNames)
    setSelectAllInputStatus();
}

function setAllSelectedStatus(object){
    let collection = document.getElementsByClassName("rowClass");
    //let event = new Event("change");
    for (let row of collection){
        console.log(row.firstElementChild);
        //row.firstElementChild.checked = true;

        row.firstElementChild.checked = object.checked;
        let name = row.firstElementChild.id.replace(/-select$/i,"");
        if(row.firstElementChild.checked){
            selectedEntryNames.add(name)
        } else {
            let deleteStatus = selectedEntryNames.delete(name);
            //if (!deleteStatus) throw "deselecting not selected element!!!";
        }
        console.log(name);
        //row.firstElementChild.dispatchEvent(event);
    }
    console.log(selectedEntryNames)
}

function setSelectAllInputStatus(){
    let selectAllInput = document.getElementById("selectAllInput");
    let collection = document.getElementsByClassName("rowClass");
    let checkedCount = 0;
    for (let row of collection){
        if (row.firstElementChild.checked){
            checkedCount++;
        }
    }
    switch(checkedCount){
        case 0:
            selectAllInput.checked = false;
            selectAllInput.indeterminate = false;
            break;
        case collection.length:
            selectAllInput.checked = true;
            selectAllInput.indeterminate = false;
            break;
        default:
            selectAllInput.indeterminate = true;
            selectAllInput.checked = false;
    }

}
async function deleteSelectedFiles(){
    let selectAllInput = document.getElementById("selectAllInput");
    let namesArray = Array.from(selectedEntryNames);
    if (namesArray.length > 0){
        for (let name of namesArray){
            let response = await deleteFilesOnServer(name);
            if (response.ok){
                deleteRow(name);
                let deleteStatus = selectedEntryNames.delete(name);
                if (!deleteStatus) throw "delete unexisted name from selectedEntryNames";
            } else {
                displayError(response.json());
            }
        }
        selectAllInput.checked = false;
        selectAllInput.indeterminate = false;
    }

}
async function deleteFilesOnServer(name){
    let url = location.origin + "/delete_files";
    let method = "POST";
    let body = JSON.stringify(name);
    let params = {
        method: method,
        body: body
    }
    let response = await fetch(url, params);
    return response;
}
function deleteRow(name){
    let id = name + "-row";
    let rowToDel = document.getElementById(id);
    rowToDel.remove();
}
function displayError(message){

}


