const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const HTTPRequest = (url, method) => {
		// make request
	let request = new XMLHttpRequest();  
	request.open(method, url, false);
	// Send request
	request.send(null);
	let parsed;
	
	if (request.responseText === undefined) {
		parsed = null;
	} else {
		parsed = JSON.parse(request.responseText);
	}

	return {
		"message" : parsed,
		"status" : request.status
		}
}

module.exports = HTTPRequest;