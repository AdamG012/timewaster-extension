function setItem() {
          console.log("OK");
}

function onGot(item) {
        console.log(item);
}

function onError(error) {
        console.log(`Error: ${error}`);
}

function logTabs(tabs) {
        return new URL(tabs[0].url).hostname;
}

function siteExists(websites, hostname) {
        return !(Object.keys(websites).length == 0 || websites[hostname] == null);
}

function getDateFormat(d) {
        return zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4);

}

/**
 * Pad zeros to number given the number of places
 */
function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

/**
 * Calculate standard HH:MM:SS time given seconds
 */
function calculateTimeStandard(seconds) {
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

