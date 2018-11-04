const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


const getNodeAddress = function (url) {
	// make request
	let request = new XMLHttpRequest();  
	request.open('GET', url + '/api/1/address', false);
	// Send request
	request.send(null);
	if (request.responseText === undefined) {
		throw JSON.stringify(request.statusText);
	}
	let parsed = JSON.parse(request.responseText);
	return parsed.our_address;
}

function Provider (url) {

	this.isConnected = function() {
			// make test request
			let request = new XMLHttpRequest();  
			request.open('GET', this.url + '/api/1/address', false);
			// Send request
			request.send(null);
			if (request.status === 200 ) return true
			else return false;
	}

	this.setProvider = function() {
			this.url = url;
			try {
				this.address = getNodeAddress(this.url);
			} catch(e) {
				this.address = e.toString(this.url);
			}
	}

	this.setProvider(url);

}



module.exports = Provider;
