/**
 * Responsible for loading a table with times given 
 * Also responsible for adding a button to remove each element from the table
 */
function createTable(hostsList) {
	let tableData = "<thead><tr><th>Website</th><th>Clear Timeout</th></tr></thead>";

	for (let website in hostsList["hosts"]) {
		if (hostsList["hosts"][website].hasOwnProperty("timeout")) {
			tableData += "<tr id=" + website + "-row" + "><td>" + website + "</td><td><input type=\"button\" id=\"remove-site-" + website  + "\" value=\"X\"></input></td></tr>";

		}
        }

        document.getElementById('timed-out-table').innerHTML += tableData;

        for (const websiteName in hostsList["hosts"]) {

		if (hostsList["hosts"][websiteName].hasOwnProperty("timeout")) {
                	let website = websiteName;
                	document.getElementById("remove-site-" + website).addEventListener('click', function(){removeTimeout(website, hostsList)});
		}
        }
}

async function removeTimeout(website, hostsList) {

	delete hostsList["hosts"][website]["timeout"];

	await browser.storage.local.set(hostsList);
	
	location.reload();
}

async function getHosts() {
	
	hostsList = await browser.storage.local.get("hosts");
}

var hostsList = browser.storage.local.get("hosts").then(createTable);
