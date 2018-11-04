const HTTPRequest = require("./httpRequest.js")

function Token () {
	this.newTokenNetwork = function (token) {
		console.log(this.url + '/api/1/tokens/' + token)
		let res = HTTPRequest(this.url + '/api/1/tokens/' + token, 'PUT');
		switch (res.status) {
			case 402:
				throw '402: Insufficient ETH to pay for the gas of the register on-chain transaction';
			case 404:
				throw '404: Not a valid EIP55 encoded address';
			case 409:
				throw 'The token was already registered before, or The registering transaction failed.';
			case 501: 
				throw 'Not Implemented';
		}

		return res.message.token_network_address;
		
	}

	this.getRegisteredTokens = function () {
		let res = HTTPRequest(this.url + '/api/1/tokens', 'GET')
		
		if (res.status !== 200) {
			throw res.status + ': Raiden internal error';
		}
		
		return res.message;
	}
}


module.exports = Token;