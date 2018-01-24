var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
var Schema = mongoose.Schema;
/* Schema*/
var UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    teacher:{type:Number,default:0},

    profile: {
        name: String,
        picture: {
            type: String,
            default: ''
        }

    },
    date: {
        type: Date,
        default: Date.now
    },
    credit:{type: Number,default:10},
    confirmed:{type: Number, default:0},
    subscribed:{type: Number, default:1},
    history: [{
        essay: {
            type: Schema.Types.ObjectId,
            ref: 'Essay'
        }
    }]
    
});
/* Password hashing*/
UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(15, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();

        });
    });
});

/* comparing passwords*/
UserSchema.methods.comparePass = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('Users', UserSchema);