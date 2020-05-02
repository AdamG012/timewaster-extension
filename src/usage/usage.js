import {convertDate, getDateFormatUS, getDateFormat, calculateTimeStandard} from '../../libs/date/date_helper.js';


/**
 * Simple function to load and create html that is meant with selecting date
 * Will need to revise a better way of adding html to pages
 */
function createDatePicker(date) {
	document.getElementById('stats-display').innerHTML = "<label for=\"start\">Enter date:</label><input type=\"date\" id=\"date-value\" name=\"date-select\" value=" + getDateFormatUS(date) + "></input><input type=\"button\" id=\"date-button\" value=\"Set date\"></input>";
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

	const dateValue = document.getElementById('date-value').value;

	const selectedDate = convertDate(document.getElementById('date-value').value);
	const dateEntry = (await browser.storage.local.get("dates"))["dates"];

	if (dateEntry == null || Object.keys(dateEntry).length === 0) {
		alert('Invalid Date');
		document.getElementById('date-value').value = getDateFormatUS(new Date());
		await dailyStats();
		return;
	}
	
	createTable(selectedDate, dateEntry);

	document.getElementById('date-button').onclick = dailyStats;
	await loadChart(selectedDate);

	// Set the value of the date
	document.getElementById('date-value').value = dateValue;

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

/**
 * Gets value selected from dropdown and calls the appropriate function
 */
function showStats() {
	const selected = document.getElementById("select-value").value;
	clearStatsDisplay();
	clearChart();

	// If the selected usage was all
	if (selected === "all") {
		loadAll();

	// DAILY USAGE
	} else if (selected === "daily") {
		const date = new Date();
		createDatePicker(date);

	// WEEKLY USAGE
	} else if (selected === "weekly") {
		const date = new Date();
		loadWeek(date);

	// ELSE CLEAR THE DISPLAY OF BOTH
	} else {
		clearStatsDisplay();
		clearChart();
	}
	
	// Load the events on each of the table headers
	addTableSortEvent();
	
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


/*
 * Loads the weekly statistics for the table
 */
async function loadWeek(date) {

        const dateEntry = (await browser.storage.local.get("dates"))["dates"];

	let currentDate = dateEntry[getDateFormat(date)];

        let tableData = "<table class=\"websiteTable\" id=\"site-table\"><thead><tr><th>Website</th><th>Time</th><th>Remove</th></tr></thead>";

	let hosts = new Object();

	for (var i = 0; i < 7; i++) {
		for (const website in currentDate) {
			if (hosts.hasOwnProperty(website)) {
				hosts[website] += currentDate[website]; 
			} else {
				hosts[website] = currentDate[website];
			}
		}
		date.setDate(date.getDate() - 1);
		currentDate = dateEntry[getDateFormat(date)];
	}

	for (let website in hosts) {
		tableData += "<tr id=" + website + "-row" + "><td>" + website + "</td><td>" + calculateTimeStandard(hosts[website]) + "</td><td><input type=\"button\" id=\"remove-site-" + website  + "\" value=\"X\"></input></td></tr>";
	}

        tableData += "</table>";

	for (const website in currentDate) {
		
		document.getElementById("remove-site-" + website).addEventListener('click', function(){removeSite(website, selectedDate)});
	}

	await loadWeekChart(hosts);

        document.getElementById('stats-display').innerHTML += tableData;
}


/**
 * Loads the weekly statistics for the chart
 * - takes in hosts which is the object containing hosts to days used
 */
async function loadWeekChart(hosts) {
	clearChart();
        const ctx = document.getElementById("chart").getContext("2d");
        const labels = [];
        const dataValues = [];

	for (let website in hosts) {
		labels.push(website);
		dataValues.push(hosts[website]);
	}

        const colourArray = loadColours(dataValues.length);

        const data = {
                labels: labels,
                datasets: [{
                        label: 'Daily Time(s)',
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
 	let hostsList = await browser.storage.local.get("hosts");

        let tableData = "<table class=\"websiteTable\" id=\"site-table\"><thead><tr><th>Website</th><th>Time</th></tr></thead>";

        for (const website in hostsList["hosts"]) {
                tableData += "<tr id=" + website + "-row" + "><td>" + website + "</td><td>" + calculateTimeStandard(hostsList["hosts"][website]["counter"]) + "</td></tr>";

        }

        tableData += "</table>";

        document.getElementById('stats-display').innerHTML += tableData;

	loadChartHosts(hostsList);

}


/*
 * Loads the daily chart hosts given a hosts list
 */
async function loadChartHosts(hostsList) {

	clearChart();
        const ctx = document.getElementById("chart").getContext("2d");
        const labels = [];
        const dataValues = [];

	for (let website in hostsList["hosts"]) {
		labels.push(website);
		dataValues.push(hostsList["hosts"][website]["counter"]);
	}

        const colourArray = loadColours(dataValues.length);

        const data = {
                labels: labels,
                datasets: [{
                        label: 'Daily Time(s)',
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

	const dateEntry = await browser.storage.local.get("dates");

	const currentDate = dateEntry["dates"][date];

	const labelArray = [];

	for (const label in currentDate) {
		labelArray.push(label);
	}

	return labelArray;

}

/**
 * Helper function to load the content of each label
 */
async function loadData(date) {
	const dateEntry = await browser.storage.local.get("dates");

	const currentDate = dateEntry["dates"][date];

	const dataArray = [];

	for (const website in currentDate) {
		dataArray.push(currentDate[website]);	
	}

	return dataArray;

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
 * Loading chart given calls to Loadlabels and loadData
 * Creates chart based on date
 */
async function loadChart(date) {
	clearChart();
	const ctx = document.getElementById("chart").getContext("2d");
	const labels = await loadLabels(date);
	const dataValues = await loadData(date);
	const colourArray = loadColours(dataValues.length);

	const data = {
		labels: labels,
		datasets: [{
			label: 'Daily Time(s)',
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

/**
 * Remove site from saved browser storage and update table
 */
async function removeSite(site, date) {

	await browser.runtime.sendMessage({ message : "removeSite", value : site, date : getDateFormat(new Date())});


	document.getElementById(site + "-row").innerHTML = "";
	await clearChart();
	await loadChart(date);
}

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

/*
 * Will sort the table by alphabetical
 */
function sortTable(table, column) {

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


// https://stackoverflow.com/questions/10683712/html-table-sort
function table2data(tableBody){
  const tableData = []; // create the array that'll hold the data rows
  tableBody.querySelectorAll('tr')
    .forEach(row=>{  // for each table row...
      const rowData = [];  // make an array for that row
      row.querySelectorAll('td')  // for each cell in that row
        .forEach(cell=>{
          rowData.push(cell.innerText);  // add it to the row data
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
      row.querySelectorAll('td')  // for each table cell ...
        .forEach((cell, j)=>{
          cell.innerText = rowData[j]; // put the appropriate array element into the cell
        })
      tableData.push(rowData);
    });
}


// Set the default font
Chart.defaults.global.defaultFontColor = 'white';
Chart.defaults.global.defautlFontSize = 14;
checkCollapsible();
showStats();
document.getElementById("select-value").onchange = showStats;


