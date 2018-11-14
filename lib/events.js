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
const AsyncHTTPRequest = require("./AsyncHttpRequest.js")

function Events () {
	// Get Blockchain events of the creation of every Token Network 
	this.getTokenNetworksCreationEvents = function () {
		let res = HTTPRequest(this.url + '/api/1/_debug/blockchain_events/network', 'GET')

		if (res.status !== 200) {
			throw JSON.stringify(res.message);
		}

		return res.message;
	}
	// Get Blockchain events of the creation of every Token Network Asyncronously
	this.getTokenNetworksCreationEventsAsync = function (callback) {
		return AsyncHTTPRequest(this.url + '/api/1/_debug/blockchain_events/network', 'GET', null,callback)
	}
	// Get Every Blockchain events related to a specific Token Network
	this.getTokenNetworkEvents = function (token, partner) {
		let token_checksum = Web3.utils.toChecksumAddress(token);
		let res;
		if (partner) {
			let partner_checksum = Web3.utils.toChecksumAddress(partner);
			res = HTTPRequest(this.url + '/api/1/_debug/blockchain_events/tokens/' + token_checksum + '/' + partner_checksum, 'GET')
		} else {
			res = HTTPRequest(this.url + '/api/1/_debug/blockchain_events/tokens/' + token_checksum, 'GET')
		}

        
		if (res.status !== 200) {
			throw JSON.stringify(res.message);
		}

		return res.message;
	}   
	// Get events on the blockchain related to your channels that uses a given token
	this.getChannelsEvents = function (token, partner) {
		let token_checksum = Web3.utils.toChecksumAddress(token);
		let res;
		if (partner) {
			let partner_checksum = Web3.utils.toChecksumAddress(partner);
			res = HTTPRequest(this.url + '/api/1/_debug/blockchain_events/payment_networks/' + token_checksum + '/channels/' + partner_checksum, 'GET')
		} else {
			res = HTTPRequest(this.url + '/api/1/_debug/blockchain_events/payment_networks/' + token_checksum + '/channels', 'GET')
		}
        
        
		if (res.status !== 200) {
			throw JSON.stringify(res.message);
		}
        
		return res.message;
	}
	// Get events on the blockchain related to your channels that uses a given token
	this.getPaymentEventHistory = function (token, partner) {
		let token_checksum = Web3.utils.toChecksumAddress(token);
		let partner_checksum = Web3.utils.toChecksumAddress(partner);
		let res = HTTPRequest(this.url + '/api/1/payments/' + token_checksum + '/' + partner_checksum, 'GET')
        
		if (res.status !== 200) {
			throw JSON.stringify(res.message);
		}
        
		return res.message;
	}
}

// IMPORTANT: these functions will count just the unsettled channels in which the given node is involved
module.exports = Events;