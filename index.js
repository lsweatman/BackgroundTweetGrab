var request = require("request");
var oracledb = require('oracledb');
require('dotenv').config();

var twitter_api = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
var bearer_token = process.env.BEARER_TOKEN; // the token you got in the last step
var lastTweetID;

var options = {
    method: 'GET',
    url: twitter_api,
    qs: {
        "screen_name": "realDonaldTrump",
        "exclude_replies": true,
        "count": 1
    },
    json: true,
    headers: {
        "Authorization": "Bearer " + bearer_token
    }
};

oracledb.getConnection(
    {
        user: process.env.DB_CONNECT_USER,
        password: process.env.DB_CONNECT_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING
    },
    function(err, connection) {
      if (err) {
        console.error(err.message);
        return;
      }
      console.log('Connection was successful!');
  
      connection.close(
        function(err) {
          if (err) {
            console.error(err.message);
            return;
          }
        });
  });

setInterval(sendRequest, 60000);

function sendRequest() {
    request(options, function(error, response, body) {
        console.dir(body[0].text);
        if(body[0].id != lastTweetID){
            lastTweetID = body[0].id;
            // TODO: insert things into the database
        }
    });
}
