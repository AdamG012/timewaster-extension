function getDateFormat(d) {
        return zeroPad(d.getDate(),2) + zeroPad(d.getMonth() + 1, 2) + zeroPad(d.getFullYear(), 4);

}

/**
 * Pad zeros to number given the number of places
 */
function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}


/**
 * Calculate the daily usage stats
 * Get values from local storage
 * Iterate through keys and load names and time
 */
async function dailyStats() {
	var date = getDateFormat(new Date());
	
	var dateEntry = await browser.storage.local.get(date);
	
	var currentDate = dateEntry[date];

	var tableData = "<tr><th>Website</th><th>Time</th></tr>";

	for (var website in currentDate) {
		tableData += "<tr><th>" + website + "</th><th>" + currentDate[website] + "</th></tr>"; 
	}

	document.getElementById("site-table").innerHTML = tableData;

	

}

/**
 * Gets value selected from dropdown and calls the appropriate function
 */
function showStats() {
	var selected = document.getElementById("select-value").value;
	switch (selected) {
		case "daily":
			dailyStats();
			break;
		default:
			document.getElementById("site-table").innerHTML = "";
			return;
	}
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

async function loadChart() {
	var ctx = document.getElementById("chart").getContext("2d");
	var labels = await loadLabels(getDateFormat(new Date()));
	var dataValues = await loadData(getDateFormat(new Date()));
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

document.getElementById("select-value").onchange = showStats;
loadChart();

