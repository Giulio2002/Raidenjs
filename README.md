# Raidenjs

Raidenjs is a library written in javascript to interact with [raiden](https://github.com/raiden-network/raiden) node

## Install

```
npm install raidenjs
```

## Usage

Here we are some examples

```js
const Raiden = require('../index.js')
# You need first  to start your raiden node
let raiden = new Raiden("http://localhost:5001")
# query every registred token in the network
let tokens = raiden.getRegisteredTokens()
console.log(tokens);
```

> Other Examples can be seen in the sample directory of this repository

If you are new to raiden you can check [the documentation](https://raiden-network.readthedocs.io/en/stable/). if you are interested in the Raiden Project don't hesitate in asking questions in the raiden [gitter](https://gitter.im/raiden-network/raiden).

## License

raidenjs is released under the [MIT License](LICENSE).

# Other Links
	* [Documentation](https://github.com/Giulio2002/Raidenjs/wiki)
	* [Raiden API docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html)
	* [Gitter](https://gitter.im/raiden-network/raiden)
	* [Raiden](https://raiden.network/) 