const Raiden = require('../index.js')

let raiden = new Raiden("http://localhost:5001")
let channel = raiden.getChannels();
console.log(channel);
