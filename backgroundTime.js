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


async function createDatesMap(hostname, date) {
	dateEntry = await browser.storage.local.get("dates");

        if (dateEntry == null || !dateEntry.hasOwnProperty("dates")) {
                dateEntry = new Object();
                dateEntry["dates"] = new Object();
        }
        
        if (!dateEntry["dates"].hasOwnProperty(date)) {
                dateEntry["dates"][date] = new Object();
        }

        if (!dateEntry["dates"][date].hasOwnProperty(hostname)) {
                dateEntry["dates"][date][hostname] = 0;
        }


        await browser.storage.local.set(dateEntry);

}


async function createHostsMap(hostname, date) {

	hostsList = await browser.storage.local.get("hosts");

        if (hostsList == null || !hostsList.hasOwnProperty("hosts")) {
                hostsList = new Object();
                hostsList["hosts"] = new Object();
        }

        if (!hostsList["hosts"].hasOwnProperty(hostname)) {
                hostsList["hosts"][hostname] = new Object();
                hostsList["hosts"][hostname]["dateList"] = [];
        }

        if (!hostsList["hosts"][hostname]["dateList"].includes(date)) {
                hostsList["hosts"][hostname]["dateList"].push(date);
        	await browser.storage.local.set(hostsList);

	}



}


/**
 * Init tab 
 * initialise hostname, webistes map and seconds
 */
async function initTab() {

	date = getDateFormat(new Date());

        hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	await createHostsMap(hostname, date);

	await createDatesMap(hostname, date);
}


/**
 * Increments value of seconds and updates storage for browser
 */
async function loopCounter() {
        initTab();
	dateEntry["dates"][date][hostname]++;
	checkTimeout();
        await browser.storage.local.set(dateEntry);
}

async function checkTimeout() {
	if (!hostsList["hosts"][hostname].hasOwnProperty("timeout")) {
		return;
	}

	if (hostsList["hosts"][hostname]["timeout"] - dateEntry["dates"][date][hostname] <= 0) {
		delete hostsList["hosts"][hostname]["timeout"]; 
		await browser.storage.local.set(hostsList);
		browser.windows.create({url: "src/timeout.html"});
	}


}

/**
 * Remove the site from the list
 * Set values to 0 for time
 */
async function removeSite(host) {

	if (!hostsList["hosts"].hasOwnProperty(host)) {
		return;
	}


	if (!dateEntry["dates"][date].hasOwnProperty(host)) {
		return;
	}

	dateEntry["dates"][date][host] = 0;

	delete hostsList["hosts"][hostname]["timeout"];

	await browser.storage.local.set(dateEntry);

	await browser.storage.local.set(hostsList);
	
}

/**
 * Handle messages from the content scripts
 * Given message 
 * - getDates - returns dates
 * - gethosts - return hsots
 * - getall - returns both
 * - removeSite - will remove site given a hostname
 */
function sendObjects(request, sender, sendResponse) {

	if (request.message === 'getdates') {
		sendResponse({dateEntry : dateEntry});
	} else if (request.message === 'gethosts') {
		sendResponse({hostsList : hostsList});
	} else if (request.message === 'removeSite') {
		removeSite(request.value);
	} else if (request.message === 'getall') {
		console.log("The request was " + request);
		sendResponse({dateEntry : dateEntry, hostsList : hostsList});
	}

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

browser.runtime.onMessage.addListener(sendObjects);

