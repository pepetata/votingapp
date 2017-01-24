'use strict';

function UserHandler(db) {

	this.loginUser = function(req,res) {
      db.collection('users', function (err, users) {
      	if (err) throw err;
      	// check if user exists
      	var user = req.body;
      	console.log('find user =',user);
      	users.find({email: req.body.email}).toArray(function (err, doc) {
      		if (err) throw err;
      		if (doc.length === 0) {
      			// found
      			user.error = true;
      			user.errorMsg = "User does not exist in database";
      			res.end(JSON.stringify(user));
      			return;
      		}
			user.logged = true;
	      	user.error = false;
	      	user.errorMsg = "";
    	  	res.end(JSON.stringify(user));
      	})
      });
	};
	
	this.addUser= function(req,res) {
      db.collection('users', function (err, users) {
      	if (err) throw err;
      	// check if user exists
      	var user = req.body;
      	users.find({email: req.body.email}).toArray(function (err, doc) {
      		if (err) throw err;
      		if (doc.length > 0) {
      			// found
      			user.error = true;
      			user.errorMsg = "User already exist in database";
      			console.log(user);
      			res.end(JSON.stringify(user));
      			return;
      		}
	      	users.insert(user);
			user.logged = true;
	      	user.error = false;
	      	user.errorMsg = "";
    	  	res.end(JSON.stringify(user));
      	})
      });
	};
};

module.exports = UserHandler;