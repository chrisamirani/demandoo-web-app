var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var logSchema=new Schema({
   userIP:String,
   reqUrl:String,
   userName:String
});

module.exports= mongoose.model('Logs',logSchema);