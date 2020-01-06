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

document.getElementById("select-value").onchange = showStats;
