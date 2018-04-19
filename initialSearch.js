require('dotenv').config();
var emojiStrip = require('emoji-strip')
var Tagger = require('node-stanford-postagger/postagger').Tagger;

var tagger = new Tagger({
    port: "9000",
    host: process.env.DIGITAL_OCEAN_IP
});

var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./trumptweets.json', 'utf8'));

// For each element: 0-NNP/NNPS 1-RB/RBR/RBS 2-VB/VBD 3-VBG 4-JJ/JJR/JJS
var allTweets = [];

var counter = 10;

//setInterval(printAllTweets, 30000);
var grab10Interval = setInterval(grab10, 5000);

function printAllTweets() {
    console.log(allTweets);
}

function grab10() {
    for (let i = 0; i < counter; i++) {
        tagger.tag(emojiStrip(obj[i].text), function(err, resp) {
            if (err) return console.error(err);
            // Split the results into individual words
            var splitResults = resp[0].split(" ");
            var tweetPOS = {
                tweetID: obj[i].id_str,
                NNP: "",
                RB: "",
                VB: "",
                VBG: "",
                JJ: ""
            };
            for (let wordIndex = 0; wordIndex < splitResults.length; wordIndex++){
                // Seperate those words from their part of speech
                var wordElements = splitResults[wordIndex].split("_");
                if (wordElements[1] == 'NNP'|| wordElements[1] == 'NNPS') {
                    tweetPOS.NNP = tweetPOS.NNP + wordElements[0] + ",";
                }
                else if (wordElements[1] == 'RB'|| wordElements[1] == 'RBR' || wordElements[1] == 'RBS') {
                    tweetPOS.RB = tweetPOS.RB + wordElements[0] + ",";
                }
                else if (wordElements[1] == 'VB'|| wordElements[1] == 'VBD') {
                    tweetPOS.VB = tweetPOS.VB + wordElements[0] + ",";
                }
                else if (wordElements[1] == 'VBG') {
                    tweetPOS.VBG = tweetPOS.VBG + wordElements[0] + ",";
                }
                else if (wordElements[1] == 'JJ'|| wordElements[1] == 'JJR' || wordElements[1] == 'JJS') {
                    tweetPOS.JJ = tweetPOS.JJ + wordElements[0] + ",";
                }
            }
            allTweets.push(tweetPOS);
        }); 
    }
    if(counter > 100){
        clearInterval(grab10Interval);
    }
    counter = counter + 10;
}

setTimeout(printAllTweets, 30000);