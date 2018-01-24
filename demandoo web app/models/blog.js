var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var blogSchema=new Schema({
  title:String,
    body:String,
    date:{type:Date,default:Date.now}
});

module.exports= mongoose.model('Blog',blogSchema);