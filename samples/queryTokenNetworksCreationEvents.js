const Raiden = require('../index.js')

let raiden = new Raiden("http://localhost:5001")
let events = raiden.getTokenNetworksCreationEvents()
console.log(events);