const thinky = require('./thinky.js');
const type = thinky.type;

let CustomCommand = thinky.createModel('CustomCommand', {
	id: type.string(),
	serverId: type.string(),
	// text that triggers the command (must have prefix ~)
	commandText: type.string(),
	// type of command ('image', 'text', or 'sound')
	commandType: type.string(),
	// the url for the image if it's an imageCommand
	imageUrl: type.string(),
	// the text the bot responds to the command with (if it's a 'text' command)
	commandResponse: type.string(),
	createDate: type.date(),
	createUser: type.string()
});

module.exports = CustomCommand;
