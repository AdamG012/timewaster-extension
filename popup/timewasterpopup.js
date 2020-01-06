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
 * Given the time is being counted
 * Update the timewaster html to the corresponding time
 */
async function countTime() {

	var seconds = 0;

	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	var websites = await browser.storage.local.get(hostname);

	if (!siteExists(websites, hostname)) {
		document.getElementById("timewaster-counter").innerHTML = "Site not added";
		return;
	}

	document.getElementById("timewaster-counter").innerHTML = calculateTimeStandard(websites[hostname]);

	var timer = setInterval(async function() {
		websites = await browser.storage.local.get(hostname);
		document.getElementById("timewaster-counter").innerHTML = calculateTimeStandard(websites[hostname]);
	}, 1000);
}


/**
 * Add the site to the browser storage
 */
async function addSite() {
	var hostname = await browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);

	var websites = await browser.storage.local.get(hostname);

	if (Object.keys(websites).length == 0) {
		websites = new Object();
	} 

	if (websites[hostname] == null) {
		websites[hostname] = 0;
	}

	var sites = new Object();
	var d = new Date();
	sites[zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4)] = new Object();
	sites[zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4)][hostname] = 0;

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

document.getElementById("add-site").onclick = addSite;
document.getElementById("remove-site").onclick = removeSite;
countTime();
