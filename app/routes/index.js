'use strict';

var UserHandler = require( process.cwd() + "/app/controllers/user.js");
var PollHandler = require( process.cwd() + "/app/controllers/poll.js");


module.exports = function (app, db) {
	var userHandler = new UserHandler(db);
	var pollHandler = new PollHandler(db);

	app.route('/')
		.get(function (req, res) {
			res.render(process.cwd() + '/public/views/index.pug');
		});

	app.route('/addUser').post(userHandler.addUser);
	app.route('/loginUser').post(userHandler.loginUser);
	app.route('/newPoll').get(pollHandler.newPoll);
	app.route('/addPoll').post(pollHandler.addPoll);
	app.route('/listPoll').get(pollHandler.listPoll);
	app.route('/vote/*').get(pollHandler.votePoll);
	app.route('/addVote').post(pollHandler.addVote);
	app.route('/myPolls').get(pollHandler.myPolls);
	app.route('/deletePoll').post(pollHandler.deletePoll);
	app.route('/readPoll').post(pollHandler.readPoll);


	app.route('*').get(function(req,res){ console.log(req.url);return;});

	// app.route('/api/:id/clicks')
	// 	.get(isLoggedIn, clickHandler.getClicks)
	// 	.post(isLoggedIn, clickHandler.addClick)
	// 	.delete(isLoggedIn, clickHandler.resetClicks);

};
