var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var twilio = require('twilio');
var TWILIO_ACCOUNT_SID = "ACad52b31b5cc537c9216800fbfd925661";
var TWILIO_AUTH_TOKEN = "fedaaff4e4906958b92aa67d281bfdff";
var client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
app.get('/resource/contact_list.json', function (req, res) {
    res.sendFile('' + __dirname + '/resource/contact_list.json');
});

app.get('/getMessages', function (req, res) {
    var messagesList = [];
    client.messages.list(function(err, data) {
        var len = data.length;
        for(var i =0; i<len;i++){
            messagesList.push(data[i]);
            if(i==len-1){
                res.send(messagesList);
                break
            }
        }
    });
});

app.post('/form/submit', function (req, res) {
    if (req.body) {
        var otp_message = req.body.otp_message;
        var contact = req.body.currentContact.phone;

        // Send the text message.
        client.messages.create({
            to: contact,
            from: '+19105012072',
            body: otp_message
        }, function(err, message) {
            if (err) {
                res.status(400);
                res.send('Text failed because: '+err.message);
            } else {
                res.send('Text sent! Message SID: '+message.sid);
            }
        });
    }
    else {
        res.status(400);
        res.send('Text failed to sent');
    }
});

app.use('/frontend/', function (req, res) {
    if (req.url.indexOf('/styles/') > -1) {
        res.sendFile('' + __dirname + '/frontend' + req.url + '');
    }
    else {
        res.sendFile('' + __dirname + '/frontend' + req.url + ''); // load the single view file (angular will handle the page changes on the front-end)
    }
});

app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname}); // load the single view file (angular will handle the page changes on the front-end)
});
app.listen(8080, function () {
    console.log('Server running at http://127.0.0.1:8080/');
});

