import {zeroPad, getDateFormat, getDateFormatUS, convertDate, calculateTimeStandard} from '../libs/date/date_helper.js';


/**
 * Simple function to load and create html that is meant with selecting date
 * Will need to revise a better way of adding html to pages
 */
function createDatePicker(date) {
	const datePicker = "<label for=\"start\">Enter date:</label><input type=\"date\" id=\"date-value\" name=\"date-select\" value="+ getDateFormatUS(date) + "></input><input type=\"button\" id=\"date-button\" value=\"Set date\"></input>";

	document.getElementById('stats-display').innerHTML = datePicker;
	dailyStats();
}

/**
 * Calculate the daily usage stats
 * Get values from local storage
 * Iterate through keys and load names and time
 */
async function dailyStats() {
	
	if (document.getElementById('site-table') != null) {
		document.getElementById('site-table').remove();
	}

	var dateValue = document.getElementById('date-value').value;

	const selectedDate = convertDate(document.getElementById('date-value').value);
	var dateEntry = (await browser.storage.local.get("dates"))["dates"];

	if (dateEntry == null || Object.keys(dateEntry).length == 0) {
		alert('Invalid Date');
		document.getElementById('date-value').value = getDateFormatUS(new Date());
		dailyStats();
		return;
	}
	
	createTable(selectedDate, dateEntry);

	document.getElementById('date-button').onclick = dailyStats;
	loadChart(selectedDate);

	// Set the value of the date
	document.getElementById('date-value').value = dateValue;

}

/**
 * Responsible for loading a table with times given 
 * Also responsible for adding a button to remove each element from the table
 */
function createTable(selectedDate, dateEntry) {
	var currentDate = dateEntry[selectedDate];

	var tableData = "<table class=\"websiteTable\" id=\"site-table\"><thead><tr><th>Website</th><th>Time</th><th>Remove</th></tr></thead>";

	for (var website in currentDate) {
		tableData += "<tr id=" + website + "-row" + "><td>" + website + "</td><td>" + currentDate[website] + "</td><td><input type=\"button\" id=\"remove-site-" + website  + "\" value=\"X\"></input></td></tr>"; 

	}

	tableData += "</table>";

	document.getElementById('stats-display').innerHTML += tableData;
	
	for (var websiteName in currentDate) {
		
		let website = websiteName; 
		document.getElementById("remove-site-" + website).addEventListener('click', function(){removeSite(website, dateEntry, selectedDate)});
	}
}

/**
 * Gets value selected from dropdown and calls the appropriate function
 */
function showStats() {
	var selected = document.getElementById("select-value").value;
	switch (selected) {
		case "daily":
			var date = new Date();
			createDatePicker(date);
			break;
		default:
			clearStatsDisplay();
			clearChart();
			return;
	}
}


/**
 * Clear html displaying chart
 */
function clearChart() {
	const canvas = document.getElementById('chart');
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	document.getElementById("chart-container").innerHTML = '&nbsp;';
	document.getElementById("chart-container").innerHTML = '<canvas id="chart"></canvas>';
}

/**
 * Clear html displaying stats
 */
function clearStatsDisplay() {
	document.getElementById('stats-display').innerHTML = "";

}

/**
 * Helper function to load the labels for the chart
 */
async function loadLabels(date) {

	var dateEntry = await browser.storage.local.get("dates");

	var currentDate = dateEntry["dates"][date];

	var labelArray = [];

	for (var label in currentDate) {
		labelArray.push(label);
	}

	return labelArray;

}

/**
 * Helper function to load the content of each label
 */
async function loadData(date) {
        var dateEntry = await browser.storage.local.get("dates");

        var currentDate = dateEntry["dates"][date];
	
	var dataArray = [];

	for (var website in currentDate) {
		dataArray.push(currentDate[website]);	
	}

	return dataArray;

}

/**
 * Load random colours based on length of data
 */
function loadColours(length) {
	var backgroundCol = [];

	for (var i = 0; i < length; i++) {
	   	backgroundCol[i] = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";

	}

	return backgroundCol;

}

/**
 * Loading chart given calls to Loadlabels and loadData
 * Creates chart based on date
 */
async function loadChart(date) {
	clearChart();
	var ctx = document.getElementById("chart").getContext("2d");
	var labels = await loadLabels(date);
	var dataValues = await loadData(date);
	var colourArray = loadColours(dataValues.length);

	var data = {
		labels: labels,
		datasets: [{
			label: 'Daily Time(s)',
			backgroundColor: colourArray,
			hoverBackgroundColor: colourArray,
            		borderColor: 'rgb(100, 20, 0)',
			data: dataValues
		}]
	};
	var chart = new Chart(ctx, {
		type: 'pie', //TODO change to option via dropdown

		data: data,

		options: {}
	});


}

/**
 * Remove site from saved browser storage and update table
 */
async function removeSite(site, dateEntry, date) {

	var dateEntry = await browser.storage.local.get("dates");
	delete dateEntry["dates"][date][site];
	await browser.storage.local.set(dateEntry);
	document.getElementById(site + "-row").innerHTML = "";
	clearChart();
	loadChart(date);
}

showStats();
document.getElementById("select-value").onchange = showStats;

