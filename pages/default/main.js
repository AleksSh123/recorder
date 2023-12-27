       
        let selectedEntryNames = new Set();



        async function getSchedule() {
            let url = location.origin + "/get_schedule"
            let response = await fetch(url);
            
            let json;
            if (response.ok) { 
                json = await response.json();
            } else {
                alert("Ошибка HTTP: " + response.status);
            }
            
            return json;


        }
        function addElement(entry, containerElement){
            let selectEl = document.createElement('input');
                selectEl.setAttribute("type","checkbox");
                selectEl.setAttribute("id",entry.name + "_select");
                selectEl.setAttribute("onchange","setSelectedStatus(this)");

                let rowEl = document.createElement('div');
                rowEl.classList.add("rowClass");
                rowEl.id = entry.name + "Row";

                let nameEl = document.createElement('div');
                nameEl.classList.add("nameCellClass");
                nameEl.id = entry.name + "_namecell"

                let startDateEl = document.createElement('div');
                startDateEl.classList.add("timeCellClass");
                startDateEl.id = entry.name + "_starttimecell"

                let stopDateEl = document.createElement('div');
                stopDateEl.classList.add("timeCellClass");
                stopDateEl.id = entry.name + "_stoptimecell"

                let enabledEl = document.createElement('div');
                enabledEl.classList.add("enableCellClass");


                let inputEl = document.createElement('input');
                inputEl.setAttribute("type","checkbox");
                inputEl.setAttribute("id",entry.name + "_input");
                inputEl.setAttribute("onchange","setInputLabelStatus(this)");


                let labelEl = document.createElement('label');
                labelEl.setAttribute("for", entry.name + "_input");
                labelEl.setAttribute("id", entry.name + "_label");
                nameEl.innerHTML = entry.name;

                startDateEl.innerHTML = entry.startTime;
                stopDateEl.innerHTML = entry.stopTime;
                if (entry.enabled){
                    labelEl.innerHTML = "Enabled";
                    inputEl.checked = true;
                } else{
                    labelEl.innerHTML = "Disabled";
                    inputEl.checked = false;
                }
                //item.enabled ? labelEl.innerHTML = "Enabled" : labelEl.innerHTML = "Disabled";
                enabledEl.appendChild(inputEl);
                enabledEl.appendChild(labelEl);

                rowEl.appendChild(selectEl);
                rowEl.appendChild(nameEl);
                rowEl.appendChild(startDateEl);
                rowEl.appendChild(stopDateEl);
                rowEl.appendChild(enabledEl);

                if (entry.started){
                    rowEl.classList.add("recordOnClass");
                };

                
                containerElement.appendChild(rowEl);
        }
        function changeElement(inputData, entrysList) {
            if(entrysList.length == 0) throw "Nothing to change in function chengeElement";
            for (let entry of entrysList){
                let enabledEl = document.getElementById(entry + "_input");
                let labelEl = document.getElementById(entry + "_label");
                if (!enabledEl) throw `Element ${entry}_input not found`;
                if (entrysList.length == 1){
                    let startTimeEl = document.getElementById(entry + "_starttimecell");
                    if (!startTimeEl) throw `Element ${entry}_starttimecell not found`;
                    let stopTimeEl = document.getElementById(entry + "_stoptimecell");
                    if (!stopTimeEl) throw `Element ${entry}_stoptimecell not found`;
                    startTimeEl.innerHTML = inputData.startTime;
                    stopTimeEl.innerHTML = inputData.stopTime;
                }
                enabledEl.checked = inputData.enabled;
                if (inputData.enabled){
                    labelEl.textContent = "Enabled"
                } else {
                    labelEl.textContent = "Disabled"
                }
            
            }
        }
        function removeElementsFromHTML(namesSet) {
            const removedEntrysNames = Array.from(namesSet);
            for(let name of removedEntrysNames){
                let elementId = name + "Row";
                let element = document.getElementById(elementId);
                element.remove();

            }
        }
        function deselectSelectedRows(namesArray){
            for (let name of namesArray){
                let selectEl = document.getElementById(name + "_select");
                selectEl.checked = false;
            }
        }
        function setInputLabelStatus(object){
            let objectId = object.id;
            let entryName = objectId.split('_');
            let labelToChangeEl = document.getElementById(entryName[0] + "_label");
            console.log(labelToChangeEl);
            if (!labelToChangeEl) throw "Cant't find the label to change!";
            object.checked ? labelToChangeEl.innerHTML = "Enabled" : labelToChangeEl.innerHTML = "Disabled";
            //console.log(object.id);
            //console.log(entryName[0]);
        }
        
        function hideModal(){
            unDisplayError();
            let modalWindow = document.getElementById("modal");
            modalWindow.style.visibility = "hidden";
            resetModal();

        }
        function resetModal() {
            let form = document.forms.inputNewEntry;
            form.elements.entryName.disabled = false;
            form.elements.entryName.disabled = false;
            form.elements.startTime.disabled = false;
            form.elements.stopTime.disabled = false;
            form.reset();
        }

        function setSelectedStatus(object) {
            let objectId = object.id;
            let entryName = objectId.split('_');
            if (object.checked){
                selectedEntryNames.add(entryName[0]);
            } else{
                let deleteStatus = selectedEntryNames.delete(entryName[0]);
                if (!deleteStatus) throw "deselecting not selected element!!!";
            }
            
        }

        function displayError(error) {
            let messageEl = document.getElementById("errorMessageElement");
            //let message = messageEl.innerText;
            messageEl.innerText = error;
            messageEl.classList.add("errorMessageClassDisplay");
        }

        function unDisplayError() {
            let messageEl = document.getElementById("errorMessageElement");
            messageEl.innerText = "";
            messageEl.classList.remove("errorMessageClassDisplay");
        }

        function displaySchedule(schedule) {
            let containerElement = document.getElementById("schedule_container");
            for (let entry of schedule){
                addElement(entry, containerElement);
                
            }
        }
        async function openSchedule(){
            let schedule = await getSchedule();
            displaySchedule(schedule);

        }

        async function addEntry(){
            unDisplayError();
            resetModal();
            await showModal("add");
        }
        async function editEntry(namesSet){
            unDisplayError();
            await showModal("edit");
        }
        async function showModal(mode){
            let saveOnModalButtonEl = document.getElementById("saveOnModalButton");
            if (mode == "add"){
                saveOnModalButtonEl.onclick = processingAdd;
                resetAndEnableModalFields();
            } else if (mode == "edit"){
                saveOnModalButtonEl.onclick = processingEdit;
                await setAndDisableModalFields(selectedEntryNames);
            } else {
                throw `Unexpected mode ${mode} for showModal function!`;
            }
            let modalWindow = document.getElementById("modal");
            modalWindow.style.visibility = "visible";
        }
        async function processingAdd() {
            let data = getInputData();
            let checkFirst = checkFirstLevel(data);
            if (!checkFirst) throw "Error first level checking input data";
            let checkSecond = await checkAndAddData(data);
            if (!checkSecond) throw "Error second level checking or add input data ";
            let containerElement = document.getElementById("schedule_container");
            addElement(data,containerElement);  
            hideModal();
        }

        async function processingEdit() {
            let data = getInputData();
            let entrysList = Array.from(selectedEntryNames);
            if (entrysList.length == 1){  //первичная проверка только для режима изменения одной записи
                let checkFirst = checkFirstLevel(data);
                if (!checkFirst) throw "Error first level checking input data";
            }

            let checkSecond = await checkAndEditData(data,entrysList);
            if (!checkSecond) throw "Error second level checking or add input data ";
            changeElement(data, entrysList);
            deselectSelectedRows(entrysList);
            removeNamesFromSelected(selectedEntryNames); //здесь должно быть entrysList, но эта процедура принимает только Set, исправить
            hideModal();
            //обработка изменения HTML
        }
        async function setAndDisableModalFields(namesSet){
            const namesArray = Array.from(namesSet);
            let form = document.forms.inputNewEntry;
            let inputNameEl = form.elements.entryName;
            let inputStartTimeEl = form.elements.startTime;
            let inputStopTimeEl = form.elements.stopTime;
            let inputEnabledEl = form.elements.enabled;
            if (namesArray.length > 1){
                inputNameEl.disabled = true;
                inputStartTimeEl.disabled = true;
                inputStopTimeEl.disabled = true;
            } else if (namesArray.length == 1){
                let schedule = await getSchedule();
                let editEntry = schedule.filter(function(item){
                    return item.name == namesArray[0];
                })
                if (editEntry.length > 1) throw "Finded more than 1 entry with selection by edit";
                inputNameEl.value = editEntry[0].name;
                inputNameEl.disabled = true;
                inputStartTimeEl.value = editEntry[0].startTime;
                inputStopTimeEl.value = editEntry[0].stopTime;
            } else {
                throw "Nothing selected";
            }
        }
        function resetAndEnableModalFields(){
            let form = document.forms.inputNewEntry;
            let inputNameEl = form.elements.entryName;
            let inputStartTimeEl = form.elements.startTime;
            let inputStopTimeEl = form.elements.stopTime;
            let inputEnabledEl = form.elements.enabled;
            inputNameEl.disabled = false;
            inputStartTimeEl.disabled = false;
            inputStopTimeEl.disabled = false;
            form.reset();
        }

        async function removeEntry(namesSet){
            let response = await removeEntryFromServer(namesSet);
            if (response.ok) {
                removeElementsFromHTML(namesSet);
                removeNamesFromSelected(namesSet);
            } else {
                //обработка ошибки удаления!
            }
        }
        async function removeEntryFromServer(namesSet) {
            let url = location.origin + "/delete_schedule_entry";
            let method = "POST";
            let entryNamesToRemove = Array.from(namesSet)
            let body = JSON.stringify(entryNamesToRemove);
            
            let params = {
                method: method,
                body: body
            }
            let response = await fetch(url, params);
            return response;
        }
        
        function removeNamesFromSelected(namesSet) {
            const removedEntrysNames = Array.from(namesSet);
            for(let name of removedEntrysNames){
                let deleteStatus = selectedEntryNames.delete(name);
                if (!deleteStatus) throw `Cannot remove ${name} from selectedEntryNames`;
            }
        }

        function getInputData(){
            unDisplayError();
            const form = document.forms.inputNewEntry;
            let inputData = {};
            if (form.elements.entryName.value != "") inputData.name = form.elements.entryName.value;
            if (form.elements.startTime.value != "") inputData.startTime = form.elements.startTime.value;
            if (form.elements.stopTime.value != "") inputData.stopTime = form.elements.stopTime.value;
            inputData.enabled = form.elements.enabled.checked;

            return inputData;

        }
        function checkFirstLevel(data) {
            if ((!data.name) || (data.name == "")) {
                displayError("The name is empty!");
                return false;
            } 
            
            if ((!isTime(data.startTime)) || (!isTime(data.stopTime))) {
                displayError("Start or/and stop time is absent");
                return false;
            }
            if (data.startTime == data.stopTime) {
                displayError("Start and stop time are the same");
                return false;
            }
            return true;
        }
        async function checkAndAddData(data) {          
            let method = "POST";
            let headers = {'Content-Type': 'application/json;charset=utf-8'};
            let body = JSON.stringify(data);
            let params = {
                method: method,
                headers: headers,
                body: body
            }
            let url = location.origin + "/add_schedule_entry"
            let response = await fetch(url, params);
            if (response.status != 204){
                let errorText = await response.text();
                displayError(errorText);
                return false;
            } 
            return true;     
        }
        async function checkAndEditData(data,entrysList) {
            if (entrysList.length == 0){
                alert("Не выбрано ни одного элемента расписания!")
                return;
            }
            const url = location.origin + "/modify_schedule_entry";
            const method = "POST";
            const headers = {'Content-Type': 'application/json;charset=utf-8'};
            const dataToSend = [data, entrysList];
            const body = JSON.stringify(dataToSend);
            let params = {
                method: method,
                headers: headers,
                body: body
            }
            let response = await fetch(url, params);
            if (response.status != 204){
                let errorText = await response.text();
                displayError(errorText);
                return false;
            } 
            return true;     
        }
        function isTime(textValue) {
            let regexp = /(\d{2}):(\d{2})/;
            return regexp.test(textValue);
        }
        async function getAndHighlightRecording(){
            let schedule = await getSchedule();
            for (let entry of schedule){
                highlightEntry(entry);
            }
        }
        function highlightEntry(entry){
            let rowEl = document.getElementById(entry.name + "Row");
            if (!rowEl) throw `cant find row element for ${entry.name}`;
            if (entry.started){
                rowEl.classList.add("recordOnClass");
            } else {
                rowEl.classList.remove("recordOnClass");
            }
            console.log("tick");
        }


        openSchedule();
        let updateTimer = setInterval(getAndHighlightRecording,1000);

        
        