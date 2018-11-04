const HTTPRequest = require("./httpRequest.js")

function Channel () {

	this.getChannels = function () {
		let res = HTTPRequest(this.url + '/api/1/channels', 'GET')
		
		if (res.status !== 200) {
			throw res.status + ': Raiden internal error';
		}
		
		return res.message;
	}

	this.getChannelsForToken = function (token) {
		let res = HTTPRequest(this.url + '/api/1/channels/' + token, 'GET')
		
		if (res.status !== 200) {
			throw res.status + ': Raiden internal error';
		}
		
		return res.message;
	}

	this.getChannel = function (token, partner) {
		let res = HTTPRequest(this.url + '/api/1/channels/' + token + '/' + partner, 'GET')
		
		if (res.status !== 200) {
			return null;
		}
		return res.message;
	}

	this.getPartners = function(token) {
		let res = HTTPRequest(this.url + '/api/1/tokens/' + token + '/partners', 'GET')
		
		switch (res.status) {
			case 404:
				throw '404: Token Address not found or given token is not a valid EIP-55 Encoded Ethereum address';
			case 500: 
				throw 'Internal Error';
		}
		
		return res.message;
	}


}


module.exports = Channel;