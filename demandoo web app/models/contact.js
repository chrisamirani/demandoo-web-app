var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var contactSchema=new Schema({
    
    subject:String,
    email:String,
    date:{type:Date,default:Date.now},
    message:String
});

module.exports= mongoose.model('Contact',contactSchema);