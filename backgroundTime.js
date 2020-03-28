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


/**
 * Gets the format of the date in DDMMYYYY
 */
function getDateFormat(d) {
        return zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4);

}


/**
 * Creates a map of dates to hosts to time
 * Will load on every new host encountered
 */
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

}


/**
 * Creates a map of hosts to dates
 * Will add new hosts 
 */
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
}


/**
 * Increments value of seconds and updates storage for browser
 */
async function loopCounter() {
	initTab();
	if (hostname != null && !blacklisted['blacklisted'].hasOwnProperty(hostname)) {

		await createHostsMap(hostname, date);

		await createDatesMap(hostname, date);
		
		dateEntry["dates"][date][hostname]++;
		hostsList["hosts"][hostname]["counter"]++;
		await browser.storage.local.set(hostsList);
		await browser.storage.local.set(dateEntry);
		checkTimeout();
	}
}


/**
 * Check whether the tab has been timed out
 * If so then close the tab alerting the user
 * TODO provide option to reset timeout
 */
async function checkTimeout() {
	if (!timeout["timeout"].hasOwnProperty(hostname)) {
		return;
	}

	if (timeout["timeout"][hostname]-- <= 0) {
		await updateCurrentTab();
		return;
	}

	await browser.storage.local.set(timeout);

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
			await browser.tabs.update(tab.id, {active:true, url:"src/timeout/timeout.html"});
			break;
		}
	}
}

/**
 * Remove the site from the list
 * Set values to 0 for time
 */
async function removeSite(host, currentDate) {
	
	if (timeout["timeout"].hasOwnProperty(host)) {
		delete timeout["timeout"][host];
	}

	delete dateEntry["dates"][currentDate][host];
	delete hostsList["hosts"][host];
	hostname = null;
	clearTimeout(host);
	toggleCount(host, false);

	await browser.storage.local.set(hostsList);
	await browser.storage.local.set(dateEntry);

	
}


/**
 * Given message from popup will add timeout to the host
 */
async function addTimeout(host, time) {
	if (timeout === undefined || timeout === null) {
		timeout = new Object();
	}

	if (!timeout.hasOwnProperty("timeout")) {
		timeout["timeout"] = new Object();
	}

	timeout["timeout"][host] = time;

	await browser.storage.local.set(timeout);
}


/**
 * Remove the timeout
 */
async function clearTimeout(host) {
	
	if (!isLogged) {
		return;
	}

	delete timeout["timeout"][host];

	await browser.storage.local.set(timeout);
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


	switch (request.message) {
		case 'getdates':
			sendResponse({dateEntry : dateEntry});
			break;
		case 'gethosts':
			sendResponse({hostsList : hostsList});
			break;
		case  'removeSite':
			removeSite(request.value, request.date);
			break;
		case 'getall':
			console.log("The request was " + request);
			sendResponse({dateEntry : dateEntry, hostsList : hostsList});
			break;
		case 'setTimeout':
			addTimeout(request.value, request.time);
			break;
		case 'clearTimeout':
			clearTimeout(request.value);
			break;
		case 'toggleCount':
			toggleCount(request.value, request.isCount)
			break;

	}
}

/**
 * Toggles on or off whether to count the website
 */
async function toggleCount(value, toggle) {
	if (!toggle) {
		blacklisted['blacklisted'][value] = toggle;
	} else if (blacklisted['blacklisted'].hasOwnProperty(value)) {
		delete blacklisted['blacklisted'][value];
	}

	await browser.storage.local.set(blacklisted);
}

/**
 * Counts the time by initiating setInterval every seconds on loopCounter
 */
function countTime() {

    var timer = setInterval(loopCounter, 1000);
}


/**
 * Basic initialisation
 * Loads asynchronous calls to begin counting
 */
function init() {

	timeout = new Object();
	timeout["timeout"] = new Object();
	
    initTab();
    countTime();
}


// Init variables required
var seconds = 0;
var hostname = null;
var hostsList = null;
var timeout = null;
var date = null;
var dateEntry = null;
var blacklisted = new Object();
blacklisted['blacklisted'] = new Object();

init();

browser.runtime.onMessage.addListener(sendObjects);

