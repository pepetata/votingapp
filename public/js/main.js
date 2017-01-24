/* global $http angular $ $scope location localStorage google*/
    var app = angular.module('poll', []);
    
    app.controller('PollController', ['$http', '$scope', '$location',function($http, $scope,$location){
        var poll = this;
        poll.user= sessionStorage.user ? JSON.parse(sessionStorage.user) : {email: "a@a.com", password:"a", password2: "a"};
        poll.polls = [];
        poll.vote = {option:"", customOption:"", custom:""};
        poll.poll = { title:"", options: "", email:"" ,votes: []};
        
        console.log('user=',poll.user,'poll',poll.poll);


        $http.get('/listPoll').then(function(data){
            poll.polls = data.data;
        }, function(err) {
            console.log(err);
        });

        this.loadPoll = function () {
            var url = $location.absUrl();
            var loadpoll = url.substr(url.indexOf('/vote')+6);
            
            $http.post('/readPoll', {id:loadpoll}).then(function(data){
                poll.poll=  data.data;
                setPie(poll.poll.votes);
            }, function(err) {
                console.log(err);
            });

        };


        this.votePoll = function() {
            var polls;
            if (localStorage.polls) polls = JSON.parse(localStorage.polls);
            else polls = [];
            if (polls.indexOf(poll.poll.title) >=0) {
                poll.vote.error = true;
                poll.vote.errorMsg = "You already voted in this poll !!";
                return false;
            }
            console.log('optou',poll.poll,poll.vote);
            if (! poll.vote.option && !poll.vote.customOption) {
                poll.vote.error = true;
                poll.vote.errorMsg = "Select one option !!";
                return false;
            }
            if (poll.vote.customOption && ! poll.vote.custom) {
                poll.vote.error = true;
                poll.vote.errorMsg = "Type your option !!";
                return false;
            }
            
            //add vote to poll
            if (poll.poll.votes)
                poll.poll.votes.push(poll.vote);
            else
                poll.poll.votes = [poll.vote];
            poll.vote.poll = poll.poll.title;
            $http.post('/addVote', this.vote, this.poll).then(function(data){
                console.log(poll.vote);
                poll.vote = {option:"", customOption:"", custom:""};
                polls.push(poll.poll.title);
                localStorage.polls = JSON.stringify(polls);
                poll.vote.error = false;
                poll.vote.errorMsg = "";
                location.reload();
            }, function(err) {
                console.log(err);
            });

        };

        this.deletePoll = function() {
            console.log('deletePoll',poll.poll);
            event.preventDefault();
            $http.post('/deletePoll', this.poll).then(function(data){
                sessionStorage.removeItem('poll');
                location.href="/";
            }, function(err) {
                console.log(err);
            });
            return false;
        };

        this.pollSelected = function(poll) {
            console.log('selecionou',poll);
            event.preventDefault();
            // sessionStorage.poll=JSON.stringify(poll);
            location.href='/vote/' + poll._id;
        };

        this.cancel = function(poll) {
            event.preventDefault();
            sessionStorage.removeItem('poll');
            location.href='/';
        };


        this.loginUser = function(user) {
            console.log('login',poll.user);
            user = user || poll.user;
            user.error = false;
            user.errorMsg = "";
            $http.post('/loginUser', this.user).then(function(data){
                console.log(poll.user);
                poll.user = data.data;
                if (poll.user.error) return false;
                $("#signInModal").modal('hide');
                // save user
                sessionStorage.user=JSON.stringify(poll.user);
            }, function(err) {
                console.log(err);
            });
        };

        this.addPoll = function() {
            poll.poll.error = false;
            poll.poll.errorMsg = "";
            poll.poll.email = poll.user.email;
            console.log('clickou inserir poll',poll);
            $http.post('/addPoll', this.poll).then(function(data){
                console.log(data.data);
                poll.poll = data.data;
                if (poll.poll.error) return false;
                $("#signUpModal").modal('hide');
                $("#msg").html("New poll added with success!!");
                $("#msgModal").modal('show');

                this.pollSelected(poll.poll);
                
            }, function(err) {
                console.log(err);
            });
        };

        
        this.signOutUser = function() {
            poll.user.logged = false;
            sessionStorage.removeItem('user');
            console.log(poll.user);
            location.href ="/";
            };

        this.addUser = function(user) {
            user = user || poll.user;
            user.error = false;
            user.errorMsg = "";
            if (user.password != user.password2) {
                poll.user.error = true;
                poll.user.errorMsg = "Passwords don't match!!";
                return false;
            }
            $http.post('/addUser', this.user).then(function(data){
                console.log(data.data);
                poll.user = data.data;
                if (poll.user.error) return false;
                $("#signUpModal").modal('hide');
                $("#msg").html("New user added with success!!");
                $("#msgModal").modal('show');
            }, function(err) {
                console.log(err);
            });
        };
    }]);


function setPie(votes){
    var counts = [];
    votes.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
    var ar = [];
    for (var i in counts) {
        ar.push([i, counts[i]]);
        console.log([i, counts[i]]);
    }
    console.log(counts,ar);
    
    
          // Load the Visualization API and the corechart package.
      google.charts.load('current', {'packages':['corechart']});

      // Set a callback to run when the Google Visualization API is loaded.
      google.charts.setOnLoadCallback(drawChart);

      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
      function drawChart() {

        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows(ar);
        // data.addRows([
        //   ['Mushrooms', 3],
        //   ['Onions', 1],
        //   ['Olives', 1],
        //   ['Zucchini', 1],
        //   ['Pepperoni', 2]
        // ]);

        // Set chart options
        var options = {'title':'Votes statistics',
                      'width':600,
                      'height':400};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
      }
}

// per https://gist.github.com/Shoen/6350967
app.directive('twitter', [
    function() {
        return {
            link: function(scope, element, attr) {
                setTimeout(function() {
                        twttr.widgets.createShareButton(
                            attr.url,
                            element[0],
                            function(el) {}, {
                                count: 'none',
                                text: attr.text
                            }
                        );
                },1000);
            }
        }
    }
]);