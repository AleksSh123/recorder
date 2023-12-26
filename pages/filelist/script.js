let flParentContainerEl = document.getElementById("recordListContainer");
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
    let selectEl = document.createElement('input');
        selectEl.setAttribute("type","checkbox");
        selectEl.setAttribute("id",entry.taskName + "_select");
        selectEl.setAttribute("onchange","setSelectedStatus(this)");

        let rowEl = document.createElement('div');
        rowEl.classList.add("rowClass");
        rowEl.id = entry.taskName + "Row";

        let nameEl = document.createElement('div');
        nameEl.classList.add("nameCellClass");
        nameEl.id = entry.taskName + "_namecell"

        let startDateEl = document.createElement('div');
        startDateEl.classList.add("timeCellClass");
        startDateEl.id = entry.taskName + "_starttimecell"

        let stopDateEl = document.createElement('div');
        stopDateEl.classList.add("timeCellClass");
        stopDateEl.id = entry.taskName + "_stoptimecell"

        let filenameEl = document.createElement('div');
        filenameEl.id = entry.taskName + "_filenamecell";
        let filenameRefEl = document.createElement('a');
        filenameRefEl.href = location.origin + "/downloads/" + entry.filename;
        filenameRefEl.innerText = entry.filename;
        filenameEl.appendChild(filenameRefEl);

        nameEl.innerHTML = entry.taskName;

        startDateEl.innerHTML = unixToFriendlyDate(entry.taskStartUnixTime);
        stopDateEl.innerHTML = unixToFriendlyDate(entry.taskStopUnixTime);

        rowEl.appendChild(selectEl);
        rowEl.appendChild(nameEl);
        rowEl.appendChild(startDateEl);
        rowEl.appendChild(stopDateEl);
        rowEl.appendChild(filenameEl);

        containerElement.appendChild(rowEl);
}
