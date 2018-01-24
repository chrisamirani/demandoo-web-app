var express = require('express');
var morgan = require('morgan');
var fs=require('fs');
var https=require('https');
var mongoose = require('mongoose');
var Logs = require('./models/logs');
var bodyParser = require('body-parser');
var secret = require('./config/secret');
var User = require('./models/user');
var socket = require('socket.io');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var formidable = require('express-formidable');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var axios = require('axios');
var qs = require('qs');
const uuidv1 = require('uuid/v1');



var app = express();

var options = {
   key  : fs.readFileSync(__dirname + '/config/demandoo.net.key'),
  cert : fs.readFileSync(__dirname + '/config/demandoo.net.chained.crt')
};

mongoose.connect(secret.dataBase, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to DB');
    }
});
mongoose.promise=global.promise;


app.use(express.static(__dirname + '/public'));
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new MongoStore({
        url: secret.dataBase,
        autoReconnect: true
    })
}));
app.use(flash());
app.use(passport.initialize());

app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

app.use(function(req,res,next){
    var log= new Logs;
    log.userIP = req.connection.remoteAddress
    log.reqUrl = req.url
    if(req.user){
        log.userName = req.user.profile.name;
    }else{
        log.userName = 'Unknown';
    }
    log.save(function(err,done){
        if(err) return next(err);
        next();
    })
    
    
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
var userRouter = require('./routes/user');
var mainRouter = require('./routes/main');
app.use(userRouter);
app.use(mainRouter);


var server = https.createServer(options,app).listen(secret.port,function(err){
    if(err) return Error;
    console.log('server running');
});

//this chat server uses language tool to correct grammar. Just add "demandoo" to the begining of your message
    var io=socket(server,{'pingInterval': 2000, 'pingTimeout': 5000});
    var userCount = 0
    
io.on('connection',function(socket){
    
    userCount += 1;
    socket.on('chat',function(data){
         
        
       if(data.text.slice(0,8).toLowerCase() === 'demandoo'){ 
           
           axios.post('https://languagetool.org/api/v2/check',qs.stringify({text:data.text.slice(8,data.text.length),language:'en-US'}))
    .then(function (response) {
     // Found a mistake ?
    if(response.data.matches.length > 0){
             
        var message = ''
        var replacement = ''
        var result = ''
        var phrases = ['Try using ','Why not use ','So you should use ','If you want to be grammatically correct use ','Write this instead: ']
        for (m=0; m < response.data.matches.length ; m++){
            message = response.data.matches[m].message + '. ';
        for (i=0;i < response.data.matches[m].replacements.length ; i++){
            replacement += response.data.matches[m].replacements[i].value + ' or '
        }
             // Extract the result and make plain text
        replacement = replacement.slice(-replacement.length , -3) + '. '
        result += message + phrases[Math.floor((Math.random() * 4) + 0)] + replacement;
        message = ''
        replacement = ''
        }
        
        // emit grammar correction
        io.sockets.emit('chat',{user :{name:'D-Bot',_id:'demand14565sdfs'}, text :'@'+data.user.name + ', ' + result, createdAt: new Date().toISOString() ,_id: uuidv1() });
    
        }
         
  })
  .catch(function (error) {
    console.log(error);
  });
        }
        io.sockets.emit('chat',{user :data.user, text : data.text, createdAt: new Date().toISOString() ,_id: uuidv1() });
    });
    socket.on('disconnect',function(){
       userCount -= 1;
   });
})

