export function setItem() {
          console.log("OK");
}

export function onGot(item) {
        console.log(item);
}

export function onError(error) {
        console.log(`Error: ${error}`);
}

export function logTabs(tabs) {
        return new URL(tabs[0].url).hostname;
}

export function siteExists(websites, hostname) {
        return !(Object.keys(websites).length == 0 || websites[hostname] == null);
}

export function getDateFormat(d) {
        return zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4);

}

export function getDateFormatUS(d) {
        return zeroPad(d.getFullYear(), 4) + "-" + zeroPad(d.getMonth() + 1, 2) + "-" + zeroPad(d.getDate(), 2);
}

export function convertDate(d) {
        var arr = d.split("-");
        return arr[2] + arr[1] + arr[0];
}

/**
 * Pad zeros to number given the number of places
 */
export function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

/**
 * Calculate standard HH:MM:SS time given seconds
 */
export function calculateTimeStandard(seconds) {
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

