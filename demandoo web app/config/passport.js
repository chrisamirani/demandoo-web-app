var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User=require('../models/user');

//serialize and deserialize

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
//middleware
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    User.findOne({
        email: email
    }, function (err, user) {
        if (err) return done(err);

        if (!user) {
            return done(null, false, req.flash('loginMessage', '用户不存在。要不去注册一下？'));
        }

        if (!user.comparePass(password)) {
            return done(null, false, req.flash('loginMessage', '您输入的密码或邮箱不对哦。请再输入一次。'));
        }
        
        return done(null, user);
    })
}))


//custom function
exports.isAuthenticated=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}