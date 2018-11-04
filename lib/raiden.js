const Provider = require('./provider.js')
const Token = require('./token.js');
const Channel = require('./channel.js');

function Raiden (url) {
	Provider.call(this, url);
	Token.call(this);
	Channel.call(this);
}

module.exports = Raiden;