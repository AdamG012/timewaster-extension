function getDateFormat(d) {
        return zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4);

}

function getDateFormatUS(d) {
	return zeroPad(d.getFullYear(), 4) + "-" + zeroPad(d.getMonth() + 1, 2) + "-" + zeroPad(d.getDate(), 2); 
}

function convertDate(d) {
	var arr = d.split("-");
	return arr[2] + arr[1] + arr[0];
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


function createDatePicker(date) {
	var datePicker = "<label for=\"start\">Enter date:</label><input type=\"date\" id=\"date-value\" name=\"date-select\" value="+ getDateFormatUS(date) + "></input><input type=\"button\" id=\"date-button\" value=\"Set date\"></input>";

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

	var selectedDate = convertDate(document.getElementById('date-value').value);
	var dateEntry = await browser.storage.local.get(selectedDate);

	if (dateEntry == null || Object.keys(dateEntry).length == 0) {
		alert('Invalid Date');
		document.getElementById('date-value').value = getDateFormatUS(new Date());
		dailyStats();
		return;
	}
	
	createTable(selectedDate, dateEntry);

	document.getElementById('date-button').onclick = dailyStats;

}

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
			loadChart(getDateFormat(new Date()));
			break;
		default:
			clearStatsDisplay();
			clearChart();
			return;
	}
}

function clearChart() {
	const canvas = document.getElementById('chart');
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	document.getElementById('chart').innerHTML = "";
			
}

function clearStatsDisplay() {
	document.getElementById('stats-display').innerHTML = "";
	

}

async function loadLabels(date) {

	var dateEntry = await browser.storage.local.get(date);

	var currentDate = dateEntry[date];

	var labelArray = [];

	for (var label in currentDate) {
		labelArray.push(label);
	}

	return labelArray;

}

async function loadData(date) {
        var dateEntry = await browser.storage.local.get(date);

        var currentDate = dateEntry[date];
	
	var dataArray = [];

	for (var website in currentDate) {
		dataArray.push(currentDate[website]);	
	}

	return dataArray;

}

async function loadChart(date) {
	var ctx = document.getElementById("chart").getContext("2d");
	var labels = await loadLabels(date);
	var dataValues = await loadData(date);
	var backgroundCol = [];
	var hoverBGCol = [];
	
	for (var i = 0; i < dataValues.length; i++) {
		backgroundCol[i] = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
		hoverBGCol[i] = backgroundCol[i]

	}

	var data = {
		labels: labels,
		datasets: [{
			label: 'Daily Time(s)',
			backgroundColor: backgroundCol,
			hoverBackgroundColor: hoverBGCol,
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



async function removeSite(site, dateEntry, date) {

	delete dateEntry[date][site];
	await browser.storage.local.set(dateEntry);
	document.getElementById(site + "-row").innerHTML = "";
	console.log(site);
		
}

showStats();
document.getElementById("select-value").onchange = showStats;

