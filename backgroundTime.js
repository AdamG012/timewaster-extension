
// Helper functions for console
function setItem() {
          console.log("OK");
}

function onGot(item) {
        console.log(item);
}

function onError(error) {
        console.log(`Error: ${error}`);
}

/**
 * Log tabs determining the current tab
 * return the url hostname of tab
 */
function logTabs(tabs) {
        return new URL(tabs[0].url).hostname;
}

/**
 * Pad zeros to number given the number of places
 */
function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}


function getDateFormat(d) {
        return zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4);

}


class WebsiteEntry {

        constructor(name) {
                this.name = name;
                this.time = 0;
        }

	getTime() {
		return this.time;
	}

	setTime(time) {
		this.time = time;
	}

	incrementTime() {
		this.time++;
	}
}

class DateEntry {
        constructor() {
                this.websiteList = new Object();
        }

        siteExists(website) {
                return this.websiteList[website] != null && this.websiteList[website] != undefined;
        }

        addWebsite(website) {
                if (!this.siteExists(website)) {
                        this.websiteList[website] = new WebsiteEntry(website);
                }
        }

        getWebsite(website) {
                if (this.siteExists(website)) {
                        return this.websiteList[website];
                }
                return null;
        }

}


/**
 * Init tab 
 * initialise hostname, webistes map and seconds
 */
async function initTab() {

	date = getDateFormat(new Date());

        hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	hostsList = await browser.storage.local.get(hostname);

	if (hostsList[hostname] == undefined) {
		hostsList[hostname] = new Object();
		hostsList[hostname]["dateList"] = [];
		hostsList[hostname]["dateList"].push(date);
	}

	else if (hostsList[hostname]["dateList"]) {
	
	}

	await browser.storage.local.set(hostsList);

	dateEntry = await browser.storage.local.get(date);

        if (dateEntry[date] == undefined) {
                dateEntry[date] = new Object();
        }
	if (dateEntry[date][hostname] == undefined) {
                dateEntry[date][hostname] = 0;
	}
}

/**
 * Increments value of seconds and updates storage for browser
 */
async function loopCounter() {
        await initTab();
	dateEntry[date][hostname]++;
        await browser.storage.local.set(dateEntry);
}

/**
 * Counts the time by initiating setInterval every seconds on loopCounter
 */
function countTime() {

        var timer = setInterval(loopCounter, 1000);
}

function init() {

        initTab();
        countTime();
}


// Init variables required
var seconds = 0;
var hostname = null;
var hostsList = null;
var date = null;
var dateEntry = null;

init();

