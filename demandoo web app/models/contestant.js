var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var contestantSchema=new Schema({
   name:String,
   email:String,
   wechat:String,
    essay:String
});

module.exports= mongoose.model('Contestants',contestantSchema);