var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var modelSchema=new Schema({
   title:String,
   testType:String,
   score:Number,
    body:String,
    date:{type:Date,default:Date.now}
});

module.exports= mongoose.model('Models',modelSchema);