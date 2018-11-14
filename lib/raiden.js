const Provider = require('./provider.js')
const Token = require('./token.js');
const Channel = require('./channel.js');
const Events = require('./events.js');

function Raiden (url) {
	Provider.call(this, url);
	Token.call(this);
	Channel.call(this);
	Events.call(this);
}

module.exports = Raiden;