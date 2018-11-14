const Raiden = require('../index.js')

let raiden = new Raiden("http://localhost:5001")
let channel = raiden.getTokenNetworksCreationEventsAsync((value, error) => {
	if(error) throw error.toString()
	console.log(value)
})