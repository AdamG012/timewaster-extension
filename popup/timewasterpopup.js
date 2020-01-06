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

class WebsiteEntry {

	constructor(name) {
		this.name = name;
		this.time = 0;
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
		if (!siteExists(website)) {
			this.websiteList[website] = new WebsiteEntry(name);
		}
	}

	getWebsite(website) {
		if (siteExists(website)) {
			return this.websiteList[website];
		}
		return null;
	}

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



/**
 * Add the site to the browser storage
 */
async function addSite() {

	var date = getDateFormat(new Date());
	
	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	var websites = await browser.storage.local.get(date);

	if (websites[date] == null) {
		websites[date] = new Object();
		websites[date][hostname] = new Object(); 	
	}

	await browser.storage.local.set(websites);
	location.reload();

}

/**
 * Remove site from the browser storage
 */
async function removeSite() {
        var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

        var websites = await browser.storage.local.get(hostname);

	if (!siteExists(websites, hostname)) {
		return;
	}

        websites[hostname] = null;
	await browser.storage.local.set(websites);
	await browser.storage.local.remove(hostname);
	location.reload();
}

async function dispTime() {

	
	var date = getDateFormat(new Date());

	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	var dateEntry = await browser.storage.local.get(date);

	document.getElementById("timewaster-counter").innerHTML = calculateTimeStandard(dateEntry[date][hostname]);


	var timer = setInterval(async function() {
		dateEntry = await browser.storage.local.get(date);
		document.getElementById("timewaster-counter").innerHTML = calculateTimeStandard(dateEntry[date][hostname]);
	}, 1000);
}

async function viewStats() {
	window.open("usage.html");

}

document.getElementById("add-site").onclick = addSite;
document.getElementById("remove-site").onclick = removeSite;
document.getElementById("view-stats").onclick = viewStats;
dispTime();
