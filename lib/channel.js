/*
The following Script contains all the possible interaction with channels in the raiden node

MIT License

Copyright (c) 2018 Giulio rebuffo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
const Web3 = require("web3")
const HTTPRequest = require("./httpRequest.js")

function Channel () {
	// query All the usettled channels of the node address
	this.getChannels = function () {
		let res = HTTPRequest(this.url + '/api/1/channels', 'GET')

		if (res.status !== 200) {
			throw res.status + ': Raiden internal error';
		}

		return res.message;
	}
	// query every unsettled channels for a given token
	this.getChannelsForToken = function (token) {
		let checksum = Web3.utils.toChecksumAddress(token);
		let res = HTTPRequest(this.url + '/api/1/channels/' + checksum, 'GET')

		if (res.status !== 200) {
			throw res.status + ': Raiden internal error';
		}

		return res.message;
	}
	// query a specific channel. you shoud pass the token_address and the partner of the channel
	this.getChannel = function (token, partner) {
		let checksum_token = Web3.utils.toChecksumAddress(token);
		let checksum_partner = Web3.utils.toChecksumAddress(partner);
		let res = HTTPRequest(this.url + '/api/1/channels/' + checksum_token + '/' + checksum_partner, 'GET')

		if (res.status !== 200) {
			return null;
		}
		return res.message;
	}
	// query every address that have unsettled channels with the node address that trade a given token
	this.getPartners = function(token) {
		let checksum = Web3.utils.toChecksumAddress(token);
		let res = HTTPRequest(this.url + '/api/1/tokens/' + checksum + '/partners', 'GET')

		switch (res.status) {
			case 404:
				throw '404: Token Address not found or given token is not a valid EIP-55 Encoded Ethereum address';
			case 500:
				throw 'Internal Error';
		}

		return res.message;
	}

}

// IMPORTANT: these functions will count just the unsettled channels in which the given node is involved
module.exports = Channel;
