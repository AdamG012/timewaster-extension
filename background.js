
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
 * Init tab 
 * initialise hostname, webistes map and seconds
 * call counter
 */
async function initTab() {
 	hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
        websites = await browser.storage.local.get(hostname);
	if (!siteExists()) {
		seconds = null;
	} else {
		seconds = websites[hostname];
	}
}

/**
 * Checks whether the current tab has been registered
 */
function siteExists() {
	return !(Object.keys(websites).length == 0 || websites == null);
}

/**
 * Increments value of seconds and updates storage for browser
 */
async function loopCounter() {
	await initTab();
	if (seconds == null) {
		return;
	}
	seconds++;
	websites[hostname] = seconds;;
	await browser.storage.local.set(websites);
}

/**
 * Counts the time by initiating setInterval every seconds on loopCounter
 */
function countTime() {

        var timer = setInterval(loopCounter, 1000);
}

function init() {
	
	initTab();
	if (seconds == null) {
		return;
	}
	
	countTime();
}


// Init variables required
var seconds = 0;
var hostname = null;
var websites = null;

init();
