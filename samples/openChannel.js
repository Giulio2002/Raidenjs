const Raiden = require('../index.js')

let raiden = new Raiden("http://localhost:5001")
raiden.channel.openChannel("0x61C808D82A3Ac53231750daDc13c777b59310bD2","0xc778417E063141139Fce010982780140Aa0cD5Ab",5000000, 500 , (value, error) => {
	if(error) throw error
	console.log(value)
})
