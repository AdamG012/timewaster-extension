import {setItem, onGot, onError, logTabs, siteExists, getDateFormat, zeroPad, calculateTimeStandard} from "../libs/date/date_helper.js";

/**
 * Add timeout to the website
 * Given the date will calculate the date at which the timeout will trigger
 */
async function addTimeout() {

	var currentDate = new Date();

	var timeout = parseInt(document.getElementById("set-timeout").value);

	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	let hostsList = await browser.storage.local.get("hosts");

	let dateTimeout = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds() + timeout * 60);

	hostsList["hosts"][hostname]["timeout"] = dateTimeout;
	
	await browser.storage.local.set(hostsList);
	
}

/**
 * Remove site from the browser storage
 */
async function removeSite() {
        var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	var websites = await browser.storage.local.get("hosts");

	if (!siteExists(websites["hosts"], hostname)) {
		return;
	}

	delete websites["hosts"][hostname];

	await browser.storage.local.set(websites);

	var dateEntry = await browser.storage.local.get("dates");

	dateEntry["dates"][getDateFormat(new Date())][hostname] = 0;

	await browser.storage.local.set(dateEntry);

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
		dateEntry = await browser.storage.local.get("dates");
		document.getElementById("timewaster-counter").innerHTML = calculateTimeStandard(dateEntry["dates"][date][hostname]);
	}, 1000);
}

/**
 * Simple button redirect to usage page
 */
async function viewStats() {
	window.open("usage.html");

}

document.getElementById("timeout-form").onsubmit = addTimeout;
document.getElementById("view-stats").onclick = viewStats;
document.getElementById("clear-site").onclick = removeSite;
dispTime();
