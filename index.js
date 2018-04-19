var request = require("request");
var emojiStrip = require('emoji-strip')
var oracledb = require('oracledb');
var Tagger = require('node-stanford-postagger/postagger').Tagger;
require('dotenv').config();

var twitter_api = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
var bearer_token = process.env.BEARER_TOKEN; // the token you got in the last step
var lastTweetID;

// Options for the twitter post request
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

// Create new tagger object
var tagger = new Tagger({
    port: "9000",
    host: process.env.DIGITAL_OCEAN_IP
});

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
        if(body[0].id != lastTweetID){
            console.dir(body[0]);
            lastTweetID = body[0].id;
            tagger.tag(body[0].text, function(err, resp) {
                if (err) return console.error(err);
                    console.log(resp);
            });
            // TODO: insert things into the database
        }
        else
        {
            console.log("Redundancy hit");
        }
    });
}
