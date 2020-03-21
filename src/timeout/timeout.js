/**
 * Responsible for loading a table with times given 
 * Also responsible for adding a button to remove each element from the table
 */
function createTable(timeout) {
	let tableData = "<thead><tr><th>Website</th><th>Clear Timeout</th></tr></thead>";

	for (let website in timeout["timeout"]) {
		tableData += "<tr id=" + website + "-row" + "><td>" + website + "</td><td><input type=\"button\" id=\"remove-site-" + website  + "\" value=\"X\"></input></td></tr>";
        }

        document.getElementById('timed-out-table').innerHTML += tableData;

        for (const websiteName in timeout["timeout"]) {

                let website = websiteName;
                document.getElementById("remove-site-" + website).addEventListener('click', function(){removeTimeout(website, timeout)});
        }
}

async function removeTimeout(website) {
	
	await browser.runtime.sendMessage({ message: "clearTimeout", value: website});
	location.reload();
}

async function getHosts() {
	
	hostsList = await browser.storage.local.get("hosts");
}

var hostsList = browser.storage.local.get("timeout").then(createTable);
