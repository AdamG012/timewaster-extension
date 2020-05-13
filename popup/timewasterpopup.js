import {calculateTimeStandard, getDateFormat, logTabs, onError} from "../libs/date/date_helper.js";

function getResponse(response) {
	console.log(response);
}

function handleError(e) {
	console.log(`Error value: ${e}`);
}


/**
 * Get the storage of all hosts and dates
 */
function getStorage() {
	return browser.runtime.sendMessage("getall");
}


/**
 * Add timeout to the website
 * Given the date will calculate the date at which the timeout will trigger
 */
async function setTimeout() {

	if (!(await getToggle())) {
		alert('Must enable timer');
		return;
	}

	const currentDate = getDateFormat(new Date());

	const timeout = document.getElementById("set-timeout").value;

	// Get the current hostname
	const hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	// Check if the timeout is invalid
	if (timeout == null || timeout.length == 0 || isNaN(timeout) || timeout <= 0) {
		alert("Invalid number");
		return;
	}

	// Log the timeout
	console.log(timeout);

	// Get all the objects required
	const receivedObject = await browser.runtime.sendMessage({message: "getall"});

	const dates = receivedObject["dateEntry"];

	const hostsObjects = receivedObject["hostsList"];

	hostsObjects["hosts"][hostname]["timeout"] = timeout * 60;
	
	await browser.storage.local.set(hostsObjects);

	await addTimeout();
}


/**
 * Sends message to the background js to add a timeout to this host
 */
async function addTimeout() {
	var currentDate = getDateFormat(new Date());

	var timeout = parseInt(document.getElementById("set-timeout").value);

    	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	if (timeout == null || timeout.length == 0 || isNaN(timeout) || timeout <= 0) {
		alert("Invalid number");
		return;
	}

	await browser.runtime.sendMessage({ message : "setTimeout", value : hostname, time: timeout * 60});


}

/**
 * Adds a blacklist so this website will not be counted or timed on
 */
async function toggleCount() {
	
	// Check the value of the toggle
	var toggle = document.getElementById('toggle-time-site').checked;

	// Get the hostname
	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	// Then send a message to the background script to toggle counting
	await browser.runtime.sendMessage({ message : "toggleCount", value : hostname, isCount : toggle});

	// Get the title of the page
	var title = await browser.tabs.query({currentWindow: true, active: true});
	title = title[0].title;

	// Change the message to on or off
	document.getElementById("on-off-switch").innerHTML = "TimeWaster is <b>" + (toggle ? "ON " : "OFF ") + "</b>for " + title;

	// Change the display of the check box
	changeCheckBoxToggle();

}


/**
 * Change the box toggle and set the checed value to false
 *
 */
async function changeCheckBoxToggle() {
	var toggle = await getToggle();

	if (!toggle) {
		document.getElementById('toggle-time-site').checked = false;
	} else {
		document.getElementById('toggle-time-site').checked = true;
	}
}


/**
 * Remove site from the browser storage
 */
async function removeSite() {

	// Get the hostname
	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	// Send a message to the background script to remove the site
	await browser.runtime.sendMessage({ message : "removeSite", value : hostname, date : getDateFormat(new Date())});

	// Reload the page 
	location.reload();
}

/**
 * Clear the timeout
 *
 */
async function clearTimeout() {
        var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	await browser.runtime.sendMessage({ message : "clearTimeout", value : hostname});

	location.reload();
}


/**
 * Display the time on the popup
 * Gets value of time from the datentry and converts to HHMMSS format
 */
async function dispTime() {
	
	var date = getDateFormat(new Date());

	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
	
	var dateEntry = await browser.storage.local.get("dates");

	document.getElementById("timewaster-counter").innerHTML = calculateTimeStandard(dateEntry["dates"][date][hostname]);

	dispTimeout(hostname);
	var timer = setInterval(async function() {
		var toggle = await getToggle();
		if (toggle) {
			dateEntry = await browser.storage.local.get("dates");
			hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
			dispTimeout(hostname);
			document.getElementById("timewaster-counter").innerHTML = calculateTimeStandard(dateEntry["dates"][date][hostname]++);
		}
	}, 1000);
}

/**
 * Display the timeout and stop if timesout
 */
async function dispTimeout(hostname) {
	
	var timeout = await browser.storage.local.get("timeout");

	if (!timeout.hasOwnProperty('timeout')) {
		return;
	}

	if (!timeout["timeout"].hasOwnProperty(hostname)) {
		document.getElementById("timeout-display").innerHTML = "No timeout set";
		return;	
	}

	document.getElementById("timeout-display").innerHTML = calculateTimeStandard(timeout["timeout"][hostname]);

}

/**
 * Load from DB whether the toggle has been flicked on or off
 */
async function getToggle() {
	var blacklisted = await browser.storage.local.get("blacklisted");

	if (!blacklisted.hasOwnProperty('blacklisted')) {
		return true;
	}

	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	return !blacklisted['blacklisted'].hasOwnProperty(hostname);
}


/**
 * Simple button redirect to usage page
 */
async function viewStats() {
	window.open("../src/usage/usage.html");

}

toggleCount();
document.getElementById("set-timeout-button").onclick = setTimeout;
document.getElementById("clear-timeout").onclick = clearTimeout;
document.getElementById("view-stats").onclick = viewStats;
document.getElementById("clear-site").onclick = removeSite;
document.getElementById('toggle-time-site').onchange = toggleCount;
changeCheckBoxToggle();
dispTime();
