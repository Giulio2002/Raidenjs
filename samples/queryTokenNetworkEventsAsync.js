const Raiden = require('../index.js')

let raiden = new Raiden("http://localhost:5001")
raiden.getTokenNetworkEventsAsync("0xc778417E063141139Fce010982780140Aa0cD5Ab", (value, error) => {
	if(error) throw error
	console.log(value)
})
