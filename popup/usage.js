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
	var datePicker = "<form><label for=\"start\">Enter date:</label><input type=\"date\" id=\"date-value\" name=\"date-select\" value="+getDateFormatUS(date)+" ></form>";

	document.getElementById('stats-display').innerHTML = datePicker;
	document.getElementById('date-value').addEventListener("change", dailyStats);
	dailyStats();
}

/**
 * Calculate the daily usage stats
 * Get values from local storage
 * Iterate through keys and load names and time
 */
async function dailyStats() {

	var selectedDate = convertDate(document.getElementById('date-value').value);
	var dateEntry = await browser.storage.local.get(selectedDate);

	if (dateEntry == null || Object.keys(dateEntry).length == 0) {
		clearDatePicker();
		alert('Invalid Date');
		return;
	}
	
	var currentDate = dateEntry[selectedDate];

	var tableData = "<table id=\"site-table\"><tr><th>Website</th><th>Time</th><th>Remove</th></tr>";

	for (var website in currentDate) {
		tableData += "<tr><th>" + website + "</th><th>" + currentDate[website] + "</th><th><input type=\"button\" id=\"remove-site\" value=\"X\"></input></th></tr>"; 
	}

	tableData += "</table>";
	
	document.getElementById('stats-display').innerHTML += tableData;

	document.getElementById('remove-site').onsubmit = removeSite;

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
			clearDatePicker();
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

function clearDatePicker() {
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
	var data = {
		labels: labels,
		datasets: [{
			label: 'Daily Time(s)',
			backgroundColor: 'rgb(255, 99, 132)',
			hoverBackgroundColor: 'rgb(230, 100, 10)',
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

async function removeSite(site, date) {
	
}

showStats();
document.getElementById("select-value").onchange = showStats;

