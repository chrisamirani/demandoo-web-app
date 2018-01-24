var http = require('http'),
    express = require('express');
    

var app = express()

// set up a route to redirect http to https
app.get('*',function(req,res){  
    res.redirect('your HTTPS Server' + req.url)
})

// have it listen on 8080
app.listen(80);