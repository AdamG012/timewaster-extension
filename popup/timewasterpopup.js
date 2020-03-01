import {calculateTimeStandard, getDateFormat, logTabs, onError} from "../libs/date/date_helper.js";


function getResponse(response) {
	console.log(response);
}

function handleError(e) {
	console.log(`Error value: ${e}`);
}

function getStorage() {
	return browser.runtime.sendMessage("getall");
}

/**
 * Add timeout to the website
 * Given the date will calculate the date at which the timeout will trigger
 */
async function setTimeout() {

	const currentDate = getDateFormat(new Date());

	const timeout = document.getElementById("set-timeout").value;

	const hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	if (timeout == null || timeout.length == 0 || isNaN(timeout) || timeout <= 0) {
		alert("Invalid number");
		return;
	}

	console.log(timeout);

	const receivedObject = await browser.runtime.sendMessage({message: "getall"});

	const dates = receivedObject["dateEntry"];

	const hostsObjects = receivedObject["hostsList"];

	hostsObjects["hosts"][hostname]["timeout"] = timeout * 60;
	
	await browser.storage.local.set(hostsObjects);

	await addTimeout();
}


async function addTimeout() {
	var currentDate = getDateFormat(new Date());

	var timeout = document.getElementById("set-timeout").value;

        var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	if (timeout == null || timeout.length == 0 || isNaN(timeout) || timeout <= 0) {
		alert("Invalid number");
		return;
	}

	await browser.runtime.sendMessage({ message : "setTimeout", value : hostname, time: timeout * 60});


}

/**
 * Remove site from the browser storage
 */
async function removeSite() {
        var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	await browser.runtime.sendMessage({ message : "removeSite", value : hostname, date : getDateFormat(new Date())});

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

	var timer = setInterval(async function() {
		var hostsObjects = await browser.storage.local.get("hosts"); 

		dateEntry = await browser.storage.local.get("dates");
		dispTimeout(hostsObjects, hostname, dateEntry["dates"][date][hostname]);
		document.getElementById("timewaster-counter").innerHTML = calculateTimeStandard(dateEntry["dates"][date][hostname]);
	}, 1000);
}

/**
 * Display the timeout and stop if timesout
 */
function dispTimeout(hosts, hostname, seconds) {
	
	if (!hosts["hosts"][hostname].hasOwnProperty("timeout")) {
		document.getElementById("timeout-display").innerHTML = "No timeout set";
		return;	
	}

	document.getElementById("timeout-display").innerHTML = calculateTimeStandard(hosts["hosts"][hostname]["timeout"]);

}


/**
 * Simple button redirect to usage page
 */
async function viewStats() {
	window.open("usage.html");

}

document.getElementById("set-timeout-button").onclick = setTimeout;
document.getElementById("clear-timeout").onclick = clearTimeout;
document.getElementById("view-stats").onclick = viewStats;
document.getElementById("clear-site").onclick = removeSite;
dispTime();
