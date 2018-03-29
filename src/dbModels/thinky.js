const auth = require('../../auth.json');

let thinky = require('thinky')({
	host: auth.dbHost,
	port: 28015,
	db: auth.db
});

module.exports = thinky;
