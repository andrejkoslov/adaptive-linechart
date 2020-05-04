// 
// Collection of small utilities
//

// Create simple logger. Used to log pisible error by processing data of chart.
if(typeof logger != "notdefined") {
    var logger = {
        info: function (message) { console.info(message);},
        warn: function (message) {console.warn(message);},
        error: function (message) {console.error(message);},
        debug: function (message) {console.debug(bessage);}
    };
}

// Add new element with predefined attributes and return reference to new element.
// @param parent - Reference to parent element. If null create new element in <body>.
// @param tag String. Tag of new element. Default <div>
// @param attrSet Object. Contains sub-elements. Each is one attribute of DOM element.
//   id - String. ID of new element. If not defined or is not unique create random. 
//   innerText - String. If defined add as innerText.
//   innerHTML - String- If defined add as innerHTML.
//   Example {id:'chart_legend_item', style: 'display:none; padding:10px;'}
// @return Reference to DOM element.
function addNewElement(parent, tag, attrSet) {
    if (attrSet == null) attrSet = {};

    // Check if id exist and is unique. If not set quasi-random id.
    if (attrSet.id != null) {
        if (document.getElementById(attrSet.id) != null) {
            newElementCounter++;
            attrSet.id = newElementCounter.toString()+ '_'+ new Date().getTime().toString();
        }
    } else {
        newElementCounter++;
        attrSet.id = newElementCounter.toString()+ '_'+ new Date().getTime().toString();
    }

    // Create new element. If type not defined create div.
    if (tag == null) {
        var element = document.createElement('div');
    } else {
        var element = document.createElement(tag);
    }

    // Set attributes
    for(var attribute in attrSet){
        element.setAttribute(attribute, attrSet[attribute]);
    }

    // Add intern text or html code if defined.
    if(attrSet.innerText !=  null) element.innerText = attrSet.innerText;
    if(attrSet.innerHTML !=  null) element.innerHTML = attrSet.innerHTML;

    // Append new element to body or to parent element if it defined and exist
    if (parent == null) {
        document.body.appendChild(element);
    } else {
        parent.appendChild(element);
    }

    return document.getElementById(attrSet.id);
}

// Counter that used in function addNewElement() to generate unique id
var  newElementCounter = 0;

// Calculate average value from array and return float with defined precision
// if at least one item in array is a number else return NaN.
// @param arData - Array. Array of numbers.
// $param precision - Integer. Default 2 digits.
// @return Float or NaN.
function getAvgValue (arData, precision) {

    if(arData == null || arData.length == 0) return NaN;

    if(precision == null || isNaN(precision)) precision = 2;

    var sum = 0;
    var count = 0;

    for(var i=0; i< arData.length; i++) {
        if (!isNaN(arData[i])) {
            sum += arData[i];
            count += 1;
        }
    }

    if(count == 0) {
        return NaN;
    } else {
        return (sum / count).toFixed(precision);
    }
}

// Get random integer with 16 digits.
function getRandomInt () {
    return Math.random() * 100000000000000000;
};

// If variable is string return true, else false.
function isString(variable) {
    return typeof variable === 'string' || variable instanceof String;
}

// Function return object that contains pieces of data-time as strings. Year long, month 01..12,
// day of month 01..31, hour 01..23, min 01..59, sec 01..59, msec 001...999
Date.prototype.separate = function() {

    var dt = {};

    dt.year = this.getFullYear();
    dt.month = this.getMonth() + 1;
    dt.mday = this.getDate();
    dt.hour = this.getHours();
    dt.min = this.getMinutes();
    dt.sec = this.getSeconds();
    dt.msec = this.getMilliseconds();

    if(dt.month < 10)  dt.month = '0' + dt.month;
    if(dt.mday < 10) dt.mday = '0'+ dt.mday;
    if(dt.hour < 10) dt.hour = '0'+ dt.hour;
    if(dt.min < 10) dt.min = '0'+ dt.min;
    if(dt.sec < 10) dt.sec = '0'+ dt.sec;
    if(dt.msec < 10) {
        dt.msec = '00'+ dt.msec;
    } else if (dt.msec < 100) {
        dt.msec = '0'+ dt.msec;
    }

    return dt;
};

// Convert CSV with header to array of time-series. Assume first value is data-time as string. 
// Name of serie take from header. CSV may contains many series (columns). Values may be empty. 
// Each serie is object {name: "Name of serie", data: "Unix-Timestamp/Value;Unix-Timestam/Value"}
// This function need package Moment.js https://momentjs.com
function scvToTimeSeries(csv) {
     
    let arResult = [];
     
    if(csv == null) {return arResult;}
    
    let arLines = csv.split(/\r?\n/);
     
    if(arLines.length < 2) {return arResult;}
    
    // Save header in separate array. Later skeep firt line with header.
    var arHeader = arLines[0].split(',');
     
    // For each column with data (In header first columnt is date-time) create time-serie object
    // and fill it with data from column.
    for(let x=1; x < arHeader.length; x++) {
        
        let obSerie = {name: arHeader[x], data: ""};
        
        // Process all records in one columnt. Skeep first line with header.
        // Process lines in reverse order, because newest crecords on top of csv.
        // If process in usual order chart works also correct! I don't know why : /
        for(let i=arLines.length - 1; i > 0; i--) {
            let arElements = arLines[i].split(',');

            // Skeep if line contains invalid data. Amount of columns in current line and header 
            // should be the same.
            if(arElements.length != arHeader.length)
                continue;
            
            // Build one item in time-serie. Format "data-time/value;" At the end separator between 
            // items ";". 
            obSerie.data += moment(arElements[0]).format('X')+ '/'+ arElements[x]+ ';';
            
        }

        // Remove last separator
        obSerie.data = obSerie.data.slice(0, -1);
        
        // Add new time-serie to array
        arResult.push(obSerie);
    }
     
    return arResult;
}

//
// Extentions existing types
//