/*
 * Set the item given a promise
 */
export function setItem() {
          console.log("OK");
}


/*
 * On retrieval of promise log the item
 */
export function onGot(item) {
        console.log(item);
}


/*
 * On error, log the error of function
 */
export function onError(error) {
        console.log(`Error: ${error}`);
}


/*
 * Determine the hostname given the set of tabs
 */
export function logTabs(tabs) {
        return new URL(tabs[0].url).hostname;
}


/*
 * Check whether site exists given a object and a key
 */
export function siteExists(websites, hostname) {
        return websites.hasOwnProperty(hostname);
}


/**
 * Get the date format in DDMMYYYY
 */
export function getDateFormat(d) {
        return zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4);

}


/*
 * Get the date format in YYYYMMDD
 */
export function getDateFormatUS(d) {
        return zeroPad(d.getFullYear(), 4) + "-" + zeroPad(d.getMonth() + 1, 2) + "-" + zeroPad(d.getDate(), 2);
}


/**
 * Convert the date from a date input into a readable form
 */
export function convertDate(d) {
        var arr = d.split("-");
        return arr[2] + arr[1] + arr[0];
}

/**
 * Pad zeros to number given the number of places
 */
export function zeroPad(num, places) {
        // Check if undefined
        if (num == undefined || places == undefined) {
                return;
        }
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
}

/**
 * Calculate standard HH:MM:SS time given seconds
 */
export function calculateTimeStandard(seconds) {

        if (seconds == NaN || seconds == undefined) {
                return "Not Counting";
        }

        var hours = parseInt(seconds / 3600);
        if (hours >= 1) {
                seconds -= hours * 3600;
        }
        var min = parseInt(seconds / 60);
        if (min >= 1) {
                seconds -= min * 60;
        }

        return zeroPad(hours, 2) + ":" + zeroPad(min, 2) + ":" + zeroPad(seconds, 2);
}

