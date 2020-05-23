import {convertDate, getDateFormatUS, getDateFormat, calculateTimeStandard} from '../../libs/date/date_helper.js';


/**
 * Simple function to load and create html that is meant with selecting date
 * Will need to revise a better way of adding html to pages
 */
function createDatePicker() {

	// Create the date
	var date = new Date();

	// If the display has been loaded before
	document.getElementById("stats-display").innerHTML = "<label for=\"start\">Enter date:</label><input type=\"date\" id=\"date-value\" name=\"date-select\" value=" + getDateFormatUS(date) + "></input><input type=\"button\" id=\"date-button\" value=\"Set date\"></input>";
}


/**
 * Calculate the daily usage stats
 * Get values from local storage
 * Iterate through keys and load names and time
 */
async function dailyStats() {

	// Clear the table if it exists
	clearTable();

	// Get the value of the date, the converted form and the map of dates
	const dateValue = document.getElementById("date-value").value;
	const dateMap = (await browser.storage.local.get("dates"))["dates"];

	// If the map is null return
	if (dateMap == null || Object.keys(dateMap).length === 0) {
		return;
	}

	// Get the hosts list
	var hosts = getTotalTime(dateMap, new Array(new Date(dateValue)));
	
	// Load the table
	loadTable(hosts, [dateValue]);

	document.getElementById('date-button').onclick = dailyStats;

	// Load the chart
	loadChart(hosts);

	// Set the value of the date
	document.getElementById('date-value').value = dateValue;

}


/**
 * Clear the table if it exists
 */
function clearTable() {

	// Clear the existing table if there is one
	if (document.getElementById("site-table") != null) {
		document.getElementById("site-table").remove();
	}
}

/**
 * Responsible for loading a table with times given 
 * Also responsible for adding a button to remove each element from the table
 */
function createTable(selectedDate, dateEntry) {
	const currentDate = dateEntry[selectedDate];

	let tableData = "<table class=\"websiteTable\" id=\"site-table\"><thead><tr><th>Website</th><th>Time</th><th>Remove</th></tr></thead>";

	for (const website in currentDate) {
		tableData += "<tr id=" + website + "-row" + "><td>" + website + "</td><td>" + calculateTimeStandard(currentDate[website]) + "</td><td><input type=\"button\" id=\"remove-site-" + website  + "\" value=\"X\"></input></td></tr>";

	}

	tableData += "</table>";

	document.getElementById('stats-display').innerHTML += tableData;
	
	for (const website in currentDate) {
		
		document.getElementById("remove-site-" + website).addEventListener('click', function(){removeSite(website, selectedDate)});
	}

}


var state = null;
/**
 * Gets value selected from dropdown and calls the appropriate function
 */
function showStats() {
	const selected = document.getElementById("select-value").value;
	clearStatsDisplay();
	clearChart();

	// If the selected usage was all
	if (selected === "all") {
		state = "ALL";
		loadAll();

	// DAILY USAGE
	} else if (selected === "daily") {
		state = "DAILY";
		createDatePicker();
		dailyStats();

	// WEEKLY USAGE
	} else if (selected === "weekly") {
		state = "WEEKLY";
		createDatePicker();
		loadWeek();

	// ELSE CLEAR THE DISPLAY OF BOTH
	} else {
		state = null;
		clearStatsDisplay();
		clearChart();
		return;
	}
	
}

/*
 * Add a sort listener to the table
 */
function addTableSortEvent() {

	const table = document.querySelector('table'); //get the table to be sorted

	// Check if the table is not null then add the table sort listener
	if (table == null) {
		return;
	}

	table.querySelectorAll('th') // get all the table header elements
  		.forEach((element, columnNo)=>{ // add a click handler for each
    		element.addEventListener('click', event => {
        		sortTable(table, columnNo); //call a function which sorts the table by a given column number
    			})
		})
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
 * Given the date map and the days
 * Calculate the amount of time spent across those days
 */
function getTotalTime(dateMap, days) {

	var hosts = new Object();

	// Loop over the days
	for (let i in days) {
		// Get the date in the correct format
		let date = getDateFormat(new Date(days[i]));

		// Loop over the websites in that day
		for (const website in dateMap[date]) {

			var websiteName = website;
			// TODO if it is a firefox host then give it a name

			// If it has the website then add onto it
			if (hosts.hasOwnProperty(website)) {
				hosts[websiteName] += dateMap[date][website]; 
			} else {
				hosts[websiteName] = dateMap[date][website];
			}
		}
	}

	return hosts;

}

async function getDates() {

        const dateMap = (await browser.storage.local.get("dates"))["dates"];

}

/*
 * Loads the weekly statistics for the table
 */
async function loadWeek() {

	// Clear the existing table
	clearTable();

        const dateMap = (await browser.storage.local.get("dates"))["dates"];

	// Get the selected date
	var rawDate = document.getElementById("date-value").value;
	var date = new Date(rawDate);

	// Create days to loop over
	var days = new Array(date);

	// Loop over days adding to the list
	for (let i = 1; i < 7; i++) {
		// Get the previous day and add to list
		days[i] = new Date(days[i - 1]);
		days[i].setDate(date.getDate() - i);
	}

	// Get the hosts list mapped to time across the dates
	var hosts = getTotalTime(dateMap, days);
	
	// Load the table and the chart
	loadTable(hosts, days);
	loadChart(hosts);

	// Set the date button to link to call load week so it updates the table
	document.getElementById('date-button').addEventListener("click", loadWeek);

	// Set the date value to the selected value
	document.getElementById("date-value").value = rawDate;
}


/**
 * Given a map of hosts to times
 * Load the table with columns of time and hostname
 */
function loadTable(hosts, dates) {
	// Get the table data
	let tableData = "<table class=\"websiteTable\" id=\"site-table\"><thead><tr><th>Website</th><th>Time</th><th>Remove</th></tr></thead>";

	// For every website inside the hosts lists add to table
	for (let website in hosts) {
		tableData += "<tr id=" + website + "-row" + "><td><a href=" + ("https://" + website) + ">" + website + "</a></td><td>" + calculateTimeStandard(hosts[website]) + "</td><td><input type=\"button\" id=\"remove-site-" + website  + "\" value=\"X\"></input></td></tr>";
	}

	// Append the ending tag
        tableData += "</table>";
        document.getElementById('stats-display').innerHTML += tableData;

	// Get the type of remove function to use
	var removeFunction = null;
	if (dates == null) {
		removeFunction = removeAll;
	} else {
		removeFunction = removeSite;

	}

	// Add the remove function to the sites
	for (const website in hosts) {
		
		document.getElementById("remove-site-" + website).addEventListener('click', function(){removeFunction(website, dates)});
	}

	// Sort the table
	addTableSortEvent();
}


/**
 * Loads the weekly statistics for the chart
 * - takes in hosts which is the object containing hosts to days used
 */
async function loadChart(hosts) {
	// Clear existing chart
	clearChart();

	// Get the context of the chart
        const ctx = document.getElementById("chart").getContext("2d");
	
	// Load labels and data values
        const labels = [];
        const dataValues = [];

	for (let website in hosts) {
		labels.push(website);
		dataValues.push(hosts[website]);
	}

	// Given the length of the array of datavalues get unique colours
        const colourArray = loadColours(dataValues.length);

	// Load this into the data
        const data = {
                labels: labels,
                datasets: [{
                        label: 'Usage Chart',
                        backgroundColor: colourArray,
                        hoverBackgroundColor: colourArray,
                        borderColor: 'rgb(100, 20, 0)',
                        data: dataValues
                }]
        };
        const chart = new Chart(ctx, {
                type: 'pie', //TODO change to option via dropdown

                data: data,

                options: {}
        });


}


/*
 * Loads all the results across all periods of time
 */
async function loadAll() {

	// Get all the hosts 
 	let hostsList = (await browser.storage.local.get("hosts"))["hosts"];

	var hosts = new Object();

	// Put all of the hosts into an array mapped to time
	for (let website in hostsList) {

		hosts[website] = hostsList[website]["counter"];
	}

	// Load the table and the chart
	loadTable(hosts, null);
	loadChart(hosts);

}


/**
 * Clear html displaying stats
 */
function clearStatsDisplay() {
	document.getElementById('stats-display').innerHTML = "";

}


/**
 * Load random colours based on length of data
 */
function loadColours(length) {
	const backgroundCol = [];

	for (let i = 0; i < length; i++) {
	   	backgroundCol[i] = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";

	}

	return backgroundCol;

}


/**
 * Remove site from saved browser storage and update table
 */
async function removeSite(site, dates) {
	
	// TODO check for firefox sites not working

	// For every date in the list of dates remove the site from that date
	for (var i in dates) {
		await browser.runtime.sendMessage({ message : "removeSite", value : site, date : getDateFormat(new Date(dates[i]))});
	}

	showStats();
}


/**
 * Remove all entries of site
 */
async function removeAll(site) {

	console.log(site);

	await browser.runtime.sendMessage({ message : "removeAll", value : site });

	showStats();

}


/*
 * Change whether the item should be collapsed or not.
 */
function checkCollapsible() {
	let collapsibleItems = document.getElementsByClassName("collapsible");
	for (var i = 0; i < collapsibleItems.length; i++) {
		collapsibleItems[i].addEventListener("click", function() {
			this.classList.toggle("active");
			var content = this.nextElementSibling;
			if (content.style.display === "block") {
				content.style.display = "none";
			} else {
				content.style.display = "block";
			}
		});
	}
}


/**
 * Given whether daily weekly or all add sites to remove
 */
function addRemoveSites() {


}


/**
 * Sort the tables checking which way to sort
 */
function sortTable(table, column) {
	
	// Change the value of clicked
	sortClicked = !sortClicked;

	// Sort based on whether the button has been clicked before
	if (sortClicked) {
		
		sortTableAsc(table, column);
	} else {

		sortTableDesc(table, column);
	}
}

/*
 * Will sort the table by ascending order
 */
function sortTableAsc(table, column) {

	const tableB = document.querySelector('tbody');
	const tableData = table2data(tableB); 

	// Sort the data
	
	tableData.sort((a, b) => {
		if(a[column] > b[column]) {
			return 1;
		}
		return -1;
	});

	data2table(tableB, tableData);

}

/*
 * Will sort the table by descending order
 */
function sortTableDesc(table, column) {

	const tableB = document.querySelector('tbody');
	const tableData = table2data(tableB); 

	// Sort the data
	
	tableData.sort((a, b) => {
		if(a[column] < b[column]) {
			return 1;
		}
		return -1;
	});

	data2table(tableB, tableData);

}


// https://stackoverflow.com/questions/10683712/html-table-sort
function table2data(tableBody){
	const tableData = []; // create the array that'll hold the data rows
	tableBody.querySelectorAll('tr')
		.forEach(row=>{  // for each table row...
      		const rowData = [];  // make an array for that row
      		row.querySelectorAll('td')  // for each cell in that row
        	.forEach(cell=>{
			rowData.push(cell.innerHTML);  // add it to the row data
        	})
      		tableData.push(rowData);  // add the full row to the table data
		});
	return tableData;
}


// this function puts data into an html tbody element
function data2table(tableBody, tableData){
	tableBody.querySelectorAll('tr') // for each table row...
		.forEach((row, i)=>{
			const rowData = tableData[i]; // get the array for the row data
			const websiteName = rowData[i];
			var i = 0;
			row.querySelectorAll('td')  // for each table cell ...
				.forEach((cell, j)=>{
					if (i % 3 == 2) {
						const id = cell.firstChild.id;
						const website = id.substring(12);
						document.getElementById(id).addEventListener('click', function(){removeAll(website)});
					}
					cell.innerHTML = rowData[j]; // put the appropriate array element into the cell
					i++;
				})
			tableData.push(rowData);
		});
}



// Set the default font
var sortClicked = false;
Chart.defaults.global.defaultFontColor = 'white';
Chart.defaults.global.defautlFontSize = 14;
checkCollapsible();
showStats();
document.getElementById("select-value").onchange = showStats;
document.getElementById("refresh-button").onclick = showStats;
