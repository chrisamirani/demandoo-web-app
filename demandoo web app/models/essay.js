var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var essaySchema=new Schema({
    writer:{type:Schema.Types.ObjectId,ref:'Users'},
    title:String,
    body:String,
    date:{type:Date,default:Date.now},
      comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Users'
        },
        date:{type: Date, default:Date.now},
        body:String
    }],
    vote:[{
        user: String
    }],
    voteCount: {type: Number, default:0}
});

module.exports= mongoose.model('Essay',essaySchema);