/************************************************************** *
 * ******************** METHOD LIBRARY ************************ *
 * ************************************************************ */


/************************************************************** *
 * ****************** FUNCTIONAL CONSTANTS ******************** *
 * ************************************************************ */


const LANGUAGE = "en";
let LANGUAGE_LIBRARY = {};


/************************************************************** *
 * ****************** SYSTEM ENHANCEMENTS ********************* *
 * ************************************************************ */


//creates splice function for Strings or overrides existing
if (!String.prototype.splice) {

    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function(start, delCount, newSubStr) {

        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));

    };

}

//creates includes function for Strings or overrides existing
if (!String.prototype.includes) {

    String.prototype.includes = function() {

        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;

    };

}


// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, " +
        "there's a framework conflict or you've got double inclusions in your code.");


// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {


    // if the other array is a falsy value, return
    if (!array)
        return false;


    // compare lengths - can save a lot of time
    if (this.length !== array.length)
        return false;

    for (let i = 0, l=this.length; i < l; i++) {


        // Check if we have nested arrays and if so, recurse into them
        if (this[i] instanceof Array && array[i] instanceof Array)
            if (!this[i].equals(array[i]))
                return false;

            else if (this[i] !== array[i])
                return false;

    }

    return true;

};


// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


//creates last function for Arrays or overrides existing
if (!Array.prototype.last) {

    Array.prototype.last = function() {

        return this[this.length - 1];

    };

}



/************************************************************** *
 * ************************ METHODS *************************** *
 * ************************************************************ */


//returns a String or random ace-sensitive alphanumeric characters of a given length
function randomChars(length) {

    let text = "",
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(let i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

}


//split a given cookie String into an Object and return it
function cookieToObj(cookie) {

    cookie = cookie.split('; ');

    let obj = {};

    for (let i = 0; i < cookie.length; i++) {

        let spl = cookie[i].split('=');
        obj[spl[0]] = spl[1];

    }

    return obj;

}


/***
 * returns a date from a string in the yyymmdd format.
 * types:
 *  y: return the year as yyyy
 *  c: return the full date with the month as a word
 *  .: return the date as dd.mm.yyyy
 * */
function stringToDate(str,type) {

    let day = "",
        month = "",
        year = "";

    if(type === "y" || str.length === 4) {

        if((str.length === 8 || str.length === 6 || str.length === 4) && !isNaN(str[0])) {

            return str[0] + str[1] + str[2] + str[3];

        } else {

            return "";

        }

    } else if(type === "c") {

        if((str.length === 8 || str.length === 6) && !isNaN(str[0])) {

            if(str.length === 8)
                day = parseInt(str[6] + str[7]) + ".";

            month = str[4] + str[5];
            year = str[0] + str[1] + str[2] + str[3];

            switch(month) {

                case "01":
                    month = "Januar";
                    break;

                case "02":
                    month = "Februar";
                    break;

                case "03":
                    month = LANGUAGE_LIBRARY[LANGUAGE]["March"];
                    break;

                case "04":
                    month = "April";
                    break;

                case "05":
                    month = "Mai";
                    break;

                case "06":
                    month = "Juni";
                    break;

                case "07":
                    month = "Juli";
                    break;

                case "08":
                    month = "August";
                    break;

                case "09":
                    month = "September";
                    break;

                case "10":
                    month = "Oktober";
                    break;

                case "11":
                    month = "November";
                    break;

                case "12":
                    month = "Dezember";
                    break;

            }

            if(str.length === 8)
                return day + " " + month + " " + year;

            if(str.length === 6)
                return month + " " + year;

        }

    } else if(type === ".") {

        if(str.length === 9 && str.startsWith("-")) {

            str = str.splice(0,1,"");

            if(str[6] === "0")
                str[6] = "";

            if(str[4] === "0")
                str[4] = "";

            return [str[6] + str[7],str[4] + str[5],str[0] + str[1] + str[2] + str[3]].join(".") + " BC";

        } else if(str.length === 8 && !isNaN(str[0])) {

            if(str[6] === "0")
                str[6] = "";

            if(str[4] === "0")
                str[4] = "";

            return [str[6] + str[7],str[4] + str[5],str[0] + str[1] + str[2] + str[3]].join(".");

        } else if(str.length === 6 && !isNaN(str[0])) {

            if(str[4] === "0")
                str[4] = "";

            return [str[4] + str[5],str[0] + str[1] + str[2] + str[3]].join(".");

        }

    } else {

        if(str.length === 9 && str.startsWith("-"))

            str = str.splice(0,1,"") + " BC";

        if(str.length === 8)
            return str.splice(6,0,"-").splice(4,0,"-");

        if(str.length === 6)
            return str.splice(4,0,"-");

    }

    return str;

}

function lang(expression){

    if(LANGUAGE_LIBRARY[LANGUAGE][expression])
        return LANGUAGE_LIBRARY[LANGUAGE][expression];

    return expression;

}

function setLanguageLibrary(lib){

    LANGUAGE_LIBRARY = lib;

}


/* **************************** *
 * ********* EXPORTS ********** *
 * **************************** */


module.exports.stringToDate = stringToDate;
module.exports.cookieToObj = cookieToObj;
module.exports.randomChars = randomChars;
module.exports.setLanguageLibrary = setLanguageLibrary;
module.exports.lang = lang;