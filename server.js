var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

const MongoClient = require('mongodb').MongoClient;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var Message = mongoose.model('messages', {
    name: String,
    message: String
});

const uri = 'mongodb+srv://admin:admin123@cluster0-8bide.mongodb.net/ChatBotdb?retryWrites=true';

//const client = new MongoClient(uri, { useNewUrlParser: true });

// MongoClient.connect(uri, { useNewUrlParser: true }, function (err, client) {
//     //const collection = client.db("ChatBotdb").collection("Message");
//     if (err) {
//         console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
//     }
//     console.log('Connected...');
//     // const collection = client.db("ChatBotdb").collection("messages");
//     // perform actions on the collection object
//     //client.close();
//     //console.log('mongodb connected', err);
// })

// var server = app.listen(3000, () => {
//     console.log('server is running on port', server.address().port);
// });
//var dbUrl = 'mongodb://username:pass@ds257981.mlab.com:57981/simple-chat'
//var dbUrl = 'mongodb+srv://admin:admin123@cluster0-8bide.mongodb.net/test?retryWrites=true'

// mongoose.connect(dbUrl, (err) => {
//     console.log('mongodb connected', err);
// });

//const uri = "mongodb+srv://admin:admin123@cluster0-8bide.mongodb.net/test?retryWrites=true";

app.get('/messages', (req, res) => {

    try {
        Message.find({}, (err, messages) => {
            if (err) {
                console.log('error', err);
            }
            console.log('getting All message....', messages);
            res.send(messages);
        })
    } catch (error) {
        res.sendStatus(500);
        return console.log('error', error);
    }
})


app.get('/messages/:user', (req, res) => {
    var user = req.params.user
    Message.find({ name: user }, (err, messages) => {
        res.send(messages);
    })
})


app.post('/messages', async (req, res) => {
    try {
        var message = new Message(req.body);
        console.log('Sending Message....', message);

        var savedMessage = await message.save()
        console.log('saved');

        var censored = await Message.findOne({ message: 'badword' });
        if (censored)
            await Message.remove({ _id: censored.id })
        else
            io.emit('message', req.body);
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('error', error);
    }
    finally {
        console.log('Message Posted')
    }

})
io.on('connection', () => {
    console.log('a user is connected')
})
mongoose.connect(uri, { useNewUrlParser: true }, (err) => {
    if (err) { console.log('Error while connecting', err) }
    console.log('mongodb connected ');
})
// client.connect(err => {
//     //const collection = client.db("ChatBotdb").collection("Message");

//     console.log('mongodb connected', err);
// })
// client.connect(err => {
//     const collection = client.db("ChatBotdb").collection("Message");
//     // perform actions on the collection object
//     console.log('mongodb connected', err);
//     //client.close();
// });

var server = http.listen(3000, () => {
    console.log('server is running on port', server.address().port);
});

