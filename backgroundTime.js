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

function isLogged() {
	if (!dateEntry["dates"][date].hasOwnProperty(date)) {
		return false;
	}

	if (!hostsList["hosts"].hasOwnProperty(host)) {
		return false;
	}
	
	return dateEntry["dates"][date].hasOwnProperty(host);




}



/**
 * Log tabs determining the current tab
 * return the url hostname of tab
 */
function logTabs(tabs) {
	if (tabs.length == 0) {
		return null;
	}
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

	if (!hostsList["hosts"][hostname].hasOwnProperty("counter")) {
		hostsList["hosts"][hostname]["counter"] = 0;
	}

        if (!hostsList["hosts"][hostname]["dateList"].includes(date)) {
        	hostsList["hosts"][hostname]["dateList"].push(date);
	}

        await browser.storage.local.set(hostsList);


}

async function createTimeoutList() {
	if (await browser.storage.local.get("timeoutList") !== undefined) {
		return;
	}

	var timeoutList = new Object();
	timeoutList["timeout"] = new Object();

	await browser.storage.local.set(timeoutList);

}


/**
 * Init tab 
 * initialise hostname, webistes map and seconds
 */
async function initTab() {

	date = getDateFormat(new Date());

        hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	if (hostname == null) {
		return;
	}

	await createHostsMap(hostname, date);

	await createDatesMap(hostname, date);
}


/**
 * Increments value of seconds and updates storage for browser
 */
async function loopCounter() {
	initTab();
	if (hostname != null) {
		dateEntry["dates"][date][hostname]++;
		hostsList["hosts"][hostname]["counter"]++;
		await checkTimeout();
		await browser.storage.local.set(hostsList);
		await browser.storage.local.set(dateEntry);
	}
}


/**
 * Check whether the tab has been timed out
 * If so then close the tab alerting the user
 * TODO provide option to reset timeout
 */
async function checkTimeout() {
	if (!hostsList["hosts"][hostname].hasOwnProperty("timeout")) {
		return;
	}

	if (hostsList["hosts"][hostname]["timeout"]-- <= 0) {
		await updateCurrentTab();
	}

	await browser.storage.local.set(hostsList);

}


/**
 * update the current tab to load the timeout html
 */
async function updateCurrentTab() {

        var currentHostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
	var tabs = await browser.tabs.query({currentWindow: true});
	console.log(tabs);
	for (i = 0; i < tabs.length; i++) {
		let tab = tabs[i];
		console.log(tab);
		if (tab.active && new URL(tab.url).hostname === currentHostname) {
			await browser.tabs.update(tab.id, {active:true, url:"src/timeout.html"});
			break;
		}
	}
}

/**
 * Remove the site from the list
 * Set values to 0 for time
 */
async function removeSite(host) {

	if (!isLogged) {
		return;
	}

	dateEntry["dates"][date][host] = 0;

	if (hostsList["hosts"][host].hasOwnProperty("timeout")) {
		delete hostsList["hosts"][host]["timeout"];
		await browser.storage.local.set(hostsList);
	}

	await browser.storage.local.set(dateEntry);

	
}


/**
 * Remove the timeout
 */
async function clearTimeout(host) {
	
	if (!isLogged) {
		return;
	}

	if (!hostsList["hosts"][host].hasOwnProperty("timeout")) {
		return;
	}

	delete hostsList["hosts"][host]["timeout"];

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
	} else if (request.message === 'clearTimeout') {
		clearTimeout(request.value);
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

