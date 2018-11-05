/*
The following Script contains all the possible interaction with token networks in the raiden node
TODO: Converting automatically token address recognized as non EIP55 in EIP55 address.

MIT License

Copyright (c) 2018 Giulio rebuffo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
const Web3 = require("web3")
const HTTPRequest = require("./httpRequest.js")

function Token () {
	// Register new token (Function Currently disabled)
	this.newTokenNetwork = function (token) {
		let checksum = Web3.utils.toChecksumAddress(token);

		console.log(this.url + '/api/1/tokens/' + checksum)
		let res = HTTPRequest(this.url + '/api/1/tokens/' + checksum, 'PUT');
		switch (res.status) {
			case 402:
				throw '402: Insufficient ETH to pay for the gas of the register on-chain transaction';
			case 404:
				throw '404: Not a valid EIP55 encoded address or method disabled';
			case 409:
				throw 'The token was already registered before, or The registering transaction failed.';
			case 501:
				throw 'Method disabled';
		}

		return res.message.token_network_address;
	}
	// get every registred tokens in the network
	this.getRegisteredTokens = function () {
		let res = HTTPRequest(this.url + '/api/1/tokens', 'GET')

		if (res.status !== 200) {
			throw res.status + ': Raiden internal error';
		}

		return res.message;
	}
}


module.exports = Token;