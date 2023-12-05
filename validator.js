exports.checkSingleEntry = function(entry){
    if (!entryHasName(entry)) return "entry has no name";
    if (!entryHasTime(entry)) return "entry has no start or/and stop time";
    if (!entryHasEnabledProp(entry)) return "entry has no enabled/disabled property";
    if (entry.startTime == entry.stopTime) return "entry has identical start and stop time";
    if ((!isTime(entry.startTime)) || (!isTime(entry.stopTime))) return "incorrect format start or/and stop time";
    return "ok";
}
exports.checkEnabledPropOnly = function(entry){
    if (!entryHasEnabledProp(entry)) return "entry has no enabled/disabled property";
    if (entryHasName(entry)) return "modifying entry has unacceptable property - name";
    if (entryHasTime(entry)) return "entry has unacceptable property - start or/and stop time";
    return "ok";
}



function entryHasName(entry){
    if (entry.name){
        let value = entry.name.trim();
        if (value.length > 0) return true;
    }
    return false;
}
function entryHasTime(entry){
    if ((entry.startTime) && (entry.stopTime)){
        let value1 = entry.startTime.trim();
        let value2 = entry.stopTime.trim();
        if ((value1.length > 0)|| (value2.length > 0)) return true;
    }
    return false;
}
function entryHasEnabledProp(entry){
    if ('enabled' in entry){
        if ((entry.enabled === true)||(entry.enabled === false)) return true;
    }
    return false;
}
function isTime(textValue) {
    let regexp = /(\d{2}):(\d{2})/;
    return regexp.test(textValue);
}