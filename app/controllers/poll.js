/* global ObjectId */
'use strict';

function PollHandler(db) {

	this.myPolls= function(req,res) {
		res.render(process.cwd() + "/public/views/mypolls.pug");
	}
	
	this.votePoll= function(req,res) {
		res.render(process.cwd() + "/public/views/vote.pug");
	}
	
	this.newPoll= function(req,res) {
		res.render(process.cwd() + "/public/views/newpoll.pug");
	}
	
	this.readPoll= function(req,res) {
	  var ObjectId = require('mongodb').ObjectId; 
      db.collection('polls', function (err, polls) {
      	if (err) throw err;
      	var id = req.body.id;
      	var o_id = new ObjectId(id);
      	console.log('read',id);
      	polls.find({_id: o_id}).toArray(function (err, doc) {
      		if (err) throw err;
      	console.log('read doc',doc);
      		if (doc.length < 1) {
      			res.end(JSON.stringify(""));
      			return;
      		}
    	  	res.end(JSON.stringify(doc[0]));
    	  });
      });
	};


	this.deletePoll= function(req,res) {
      db.collection('polls', function (err, polls) {
      	if (err) throw err;
      	var poll = req.body;
      	polls.deleteOne({title: poll.title});
      	res.end("");
      	console.log('deleted',poll);
      });
	};


	this.listPoll= function(req,res) {
      db.collection('polls', function (err, polls) {
      	if (err) throw err;
      	polls.find().toArray(function (err, doc) {
      		if (err) throw err;
    	  	res.end(JSON.stringify(doc));
      	})
      });
	};


	this.addVote= function(req,res) {
      db.collection('polls', function (err, polls) {
      	if (err) throw err;
      	var vote = req.body;
      	polls.find({title: vote.poll}).toArray(function (err, doc) {
      		if (err) throw err;
      		if (doc.length < 1) {
      			// found
      			vote.error = true;
      			vote.errorMsg = "Poll not found";
      			console.log(vote);
      			res.end(JSON.stringify(vote));
      			return;
      		}
      		var option = vote.customOption === "customOption" ? vote.custom : vote.option;
      		
      		var votes = doc[0].votes;
      		votes.push(option);
      		doc.votes=votes;
      		
	      	polls.save(doc[0]);
    	  	res.end(JSON.stringify(doc[0]));
    	  });
      });
	};


	this.addPoll= function(req,res) {
      db.collection('polls', function (err, polls) {
      	if (err) throw err;
      	// check if user exists
      	var poll = req.body;
      	console.log('to insert',poll);
      	polls.find({title: req.body.title}).toArray(function (err, doc) {
      		
      		if (err) throw err;
      		if (doc.length > 0) {
      			// found
      			poll.error = true;
      			poll.errorMsg = "Poll already exist in database";
      			console.log(poll);
      			res.end(JSON.stringify(poll));
      			return;
      		}
      		var options=poll.options.split("\n");
      		options = options.filter( function (value, index, self) { 
			  return self.indexOf(value) === index;
			});
			
      		if (options.length < 2) {
      			poll.error = true;
      			poll.errorMsg = "Poll need ate least two unique options!!";
      			console.log(poll);
      			res.end(JSON.stringify(poll));
      			return;
      			
      		}
      		poll.options = options;
	      	polls.insert(poll);
	      	console.log("inserted new poll=", poll);
    	  	res.end(JSON.stringify(poll));
      	})
      });
	};
};

module.exports = PollHandler;