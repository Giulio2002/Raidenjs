const Raiden = require('../index.js')

let raiden = new Raiden("http://localhost:5001")
let channel = raiden.getChannel("0xc778417E063141139Fce010982780140Aa0cD5Ab", "YOUR PARTNER")
console.log(channel);