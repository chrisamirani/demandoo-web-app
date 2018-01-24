var router = require('express').Router();
var fs = require('fs');
var mongoose = require('mongoose');
var User = require('../models/user');
var Essay = require('../models/essay');
var passport = require('passport');
var passportConf = require('../config/passport');
var axios = require('axios');
var bcrypt = require('bcrypt-nodejs');


router.get('/login', function (req, res) {
    if (req.user) return res.redirect('/profile');
    res.render('accounts/login', {
        message: req.flash('loginMessage'),
        title: '登录您的账号',
        description: '登录您的 Demandoo 账号后可以开始使用很多功能。这包括聊天，发作文，看作文圈，评论等等。'
    });
});

router.post('/login',
    passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

router.post('/mobile-login', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({
            email: req.body.email
        })
        .exec(function (err, user) {
            if (err) return next(err);

            if (!user) {
                return res.json({
                    msg: 'User Not Found'
                });
            } else {
                bcrypt.compare(password, user.password, function (err, isMatch) {
                    if (err) return next(err);
                    if (isMatch) {
                        Essay.find({
                                writer: user._id
                            })
                            .exec(function (err, essays) {
                                if (err) return next(err);
                                if (essays.length > 0) {
                                    return res.json({
                                        user: user,
                                        essays: essays
                                    });
                                } else {
                                    return res.json({
                                        user: user,
                                        essays: 'No Essays'
                                    });
                                }
                            });

                    } else {
                        return res.json({
                            msg: 'Wrong Password'
                        })
                    }
                });
            }
        })
});

router.post('/mobile-update-password', function (req, res, next) {

    var userId = req.body.userId;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    User.findById({
            _id: userId
        })
        .exec(function (err, user) {
            if (err) return next(err);


            bcrypt.compare(oldPassword, user.password, function (err, isMatch) {
                if (err) return next(err);
                if (isMatch) {
                    user.password = newPassword;
                    user.save(function (err, done) {
                        if (err) return next(err);
                        return res.json({
                            msg: 'Password Updated Successfuly'
                        })
                    })


                } else {
                    return res.json({
                        msg: 'Old Password Is Wrong'
                    })
                }
            });

        })
});



router.get('/profile', function (req, res, next) {

    if (req.user) {
        Essay.find({
                writer: req.user._id
            })
            .exec(function (err, essays) {
                if (err) return next(err);
                res.render('accounts/profile', {
                    essays: essays,
                    title: '你的个人空间',
                    description: '在这里您可以查到您的D币，还有可以看到您发过作文的历史。',
                    success: ''
                })
            });
    }
});


router.post('/edit-profile', function (req, res, next) {

    User.findOne({
        _id: req.user._id
    }, function (err, user) {
        if (err) return next(err);

        if (req.body.subscribe) {
            user.subscribed = 1;
        } else {
            user.subscribed = 0;
        }
        if (req.body.password) user.password = req.body.password;



        user.save(function (err) {
            if (err) return next(err);
            Essay.find({
                    writer: req.user._id
                })
                .exec(function (err, essays) {
                    if (err) return next(err);
                    res.render('accounts/profile', {
                        essays: essays,
                        title: '你的个人空间',
                        description: '在这里您可以查到您的D币，还有可以看到您发过作文的历史。',
                        success: '保存成功'
                    });
                });
        });





    });
})


router.get('/signup', function (req, res) {
    res.render('accounts/signup', {
        errors: req.flash('errors'),
        title: '注册新账号',
        description: '登录您的 Demandoo 账号后可以开始使用很多功能。这包括聊天，发作文，看作文圈，评论等等。'
    });
});
router.post('/signup', function (req, res, next) {
    if (req.body.password.length !== 0 || req.body.email.length !== 0) {

        var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

        if (req.body.email.search(emailRegex) !== -1) {
            var user = new User();
            user.profile.name = req.body.name;
            user.email = req.body.email;
            user.password = req.body.password;

            User.findOne({
                email: req.body.email
            }, function (err, existingUser) {
                if (existingUser) {
                    req.flash('errors', '这个邮箱已经注册过');
                    return res.redirect('/signup');
                } else {
                    user.save(function (err, user) {
                        if (err) return next(err);
                        req.logIn(user, function (err) {
                            if (err) return next(err);

                            'use strict';
                            var nodemailer = require('nodemailer');

                            // create reusable transporter object using the default SMTP transport
                            var transporter = nodemailer.createTransport({
                                host: 'smtp domain',
                                port: 587,
                                secure: false, // secure:true for port 465, secure:false for port 587
                                auth: {
                                    user: 'smtp mail username',
                                    pass: 'smpt mail password'
                                }
                            });
                            var userEmailAndId = user.email + '/' + user._id;
                            var body = '<html><body style=""><div style="width:100%;background-color:#4184f3;padding:10px;height:10%;"><img src="https://your domain/imgs/logo-footer-white.png" style="width:auto;max-height:6em"></div><div style="height:auto;width:100%;font-family:sans-serif;width:80%;margin-left:7%;background-color:white;;padding:20px;margin-top:-20px;box-shadow: 4px 6px 23px grey;"><p>Hey there,</p><p>感谢您来陪我们走学一个外语的路。我确定你会喜欢我们的。</p><p>但我们开始一起学习前您还要做一个小事，也就是确认您的邮箱地址：</p><p style="text-align:center;"><a href="https://your domain/confirm-email/' + userEmailAndId + '" style="background-color:transparent;padding:10px;border-radius:8px;text-decoration: none;border-style: solid;color: #3fd69f;border-color: #3fd69f;border-width: 1px;">确认邮箱地址</a></p><p>再次感谢您使用 Demandoo 智能语言工具。如果您对我服务满意，也可以叫别的朋友过来一起学习。人越多，学习的效率和丰富性越好。</p><p>Peace,<br>Demandoo Team</p></div><div style="text-align:center;height:auto;width:100%;font-family:sans-serif;width:80%;margin-left:7%;padding:5px;margin-top:15px"><small style="color:#dcdcdc">Demandoo | 你的语言好伴</small>   <small><a href="https://your domain/unsubscribe/' + userEmailAndId + '" style="color:#dcdcdc">unsubscribe</a></small><br><small style="color:#dcdcdc">Pazhou New Village, Guangzhou</small></div></body></html>';

                            // setup email data with unicode symbols
                            var mailOptions = {
                                from: '"Demandoo"<your mail address>', // sender address
                                to: req.body.email.toString("utf8"), // list of receivers
                                subject: 'Welcome To Demandoo', // Subject line
                                text: '', // plain text body
                                html: body.toString("utf8") // html body
                            };

                            // send mail with defined transport object
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Message %s sent: %s', info.messageId, info.response);
                            });


                            res.redirect('/profile');
                        })
                    });

                }
            });

        } else {
            req.flash('errors', '您输入的邮箱地址有错误');
            return res.redirect('/signup');
        }

    } else {
        req.flash('errors', '请确认用对的信息填写这个表');
        return res.redirect('/signup');
    }
});

router.get('/confirm-email/:emailAdd/:userId', function (req, res, next) {
    User.findById({
            _id: req.params.userId
        })
        .exec(function (err, user) {
            if (err) return next(err);
            if (user.email == req.params.emailAdd) {
                user.confirmed = 1;
                user.save(function (err, done) {
                    if (err) return next(err);
                    req.logIn(user, function (err) {
                        if (err) return next(err);
                        res.redirect('/profile');
                    })
                })
            } else {
                res.render('main/error', {
                    title: 'Error',
                    description: '没找到这个网页'
                });
            }
        })
});

router.get('/unsubscribe/:emailAdd/:userId', function (req, res, next) {
    User.findById({
            _id: req.params.userId
        })
        .exec(function (err, user) {
            if (err) return next(err);
            if (user.email == req.params.emailAdd) {
                user.subscribed = 0;
                user.save(function (err, done) {
                    if (err) return next(err);

                    res.redirect('/');

                })
            } else {
                res.render('main/error', {
                    title: 'Error',
                    description: '没找到这个网页'
                });
            }
        })
});
router.get('/mobile-subscription/:emailAdd/:userId', function (req, res, next) {
    User.findById({
            _id: req.params.userId
        })
        .exec(function (err, user) {
            if (err) return next(err);
            if (user.subscribed == 1) {
                user.subscribed = 0;
                user.save(function (err, done) {
                    if (err) return next(err);
                    res.send('ok')
                })
            } else {
                user.subscribed = 1;
                user.save(function (err, done) {
                    if (err) return next(err);
                    res.send('ok')
                })
            }
        })
});
router.get('/subscribe/:emailAdd/:userId', function (req, res, next) {
    User.findById({
            _id: req.params.userId
        })
        .exec(function (err, user) {
            if (err) return next(err);
            if (user.email == req.params.emailAdd) {
                user.subscribed = 1;
                user.save(function (err, done) {
                    if (err) return next(err);

                    res.redirect('/');

                })
            } else {
                res.render('main/error', {
                    title: 'Error',
                    description: '没找到这个网页'
                });
            }
        })
})

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.post('/post-comment/:essayId', function (req, res, next) {
    if (req.user) {
        Essay.findById({
                _id: req.params.essayId
            })
            .populate('writer')
            .exec(function (err, essay) {
                if (err) return next(err);
                essay.comments.push({
                    user: req.user._id,
                    body: req.body.comment
                });
                essay.save(function (err, done) {
                    if (err) return next(err);
                    if (req.user._id.toString() !== essay.writer._id.toString() && essay.writer.subscribed == 1) {
                        'use strict';
                        var nodemailer = require('nodemailer');

                        // create reusable transporter object using the default SMTP transport
                        var transporter = nodemailer.createTransport({
                            host: 'smtp mail address',
                            port: 587,
                            secure: false, // secure:true for port 465, secure:false for port 587
                            auth: {
                                user: 'smtp mail username',
                                pass: 'smtp mail password'
                            }
                        });

                        var body = '<html><body style=""><div style="width:100%;background-color:#4184f3;padding:10px;height:10%;"><img src="https://your domain/imgs/logo-footer-white.png" style="width:auto;max-height:6em"></div><div style="height:auto;width:100%;font-family:sans-serif;width:80%;margin-left:7%;background-color:white;;padding:20px;margin-top:-20px;box-shadow: 4px 6px 23px grey;"><p>Hey there,</p><p>您发的 ' + essay.title + ' 作文收到了一个新的评论。快去看一下咯。</p><p style="text-align:center;"><a href="https://your domain/" style="background-color:transparent;padding:10px;border-radius:8px;text-decoration: none;border-style: solid;color: #3fd69f;border-color: #3fd69f;border-width: 1px;">查看评论</a></p><p>Peace,<br>Demandoo Team</p></div><div style="text-align:center;height:auto;width:100%;font-family:sans-serif;width:80%;margin-left:7%;padding:5px;margin-top:15px"><small style="color:#dcdcdc">Demandoo | 你的语言好伴</small>   <small><a href="https://your domain/unsubscribe/' + essay.writer.email + '/' + essay.writer._id + '" style="color:#dcdcdc">unsubscribe</a></small><br><small style="color:#dcdcdc">Pazhou New Village, Guangzhou</small></div></body></html>';

                        // setup email data with unicode symbols
                        var mailOptions = {
                            from: '"Demandoo"<your mail address>', // sender address
                            to: essay.writer.email.toString("utf8"), // list of receivers
                            subject: '评论通知', // Subject line
                            text: '', // plain text body
                            html: body.toString("utf8") // html body
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message %s sent: %s', info.messageId, info.response);
                        });
                    }



                    res.redirect('/essay/' + req.params.essayId);
                })
            })
    } else {
        res.render('accounts/login', {
            message: '发评论需要登录的哦',
            title: '登录',
            description: '登录您的 Demandoo 账号后可以开始使用很多功能。这包括聊天，发作文，看作文圈，评论等等'
        });
    }
})

router.get('/upvote/:essayId', function (req, res, next) {
    if (req.user) {
        Essay.findById({
                _id: req.params.essayId
            })
            .exec(function (err, essay) {
                if (err) return next(err);

                var voted = []
                for (i = 0; i < essay.vote.length; i++) {
                    voted.push(essay.vote[i].user.toString());
                }

                if (voted.includes(req.cookies['connect.sid'].toString())) {
                    res.send('ok')
                } else {
                    essay.vote.push({
                        user: req.cookies['connect.sid'].toString()
                    });
                    essay.voteCount += 1;
                    essay.save(function (err, done) {
                        if (err) return next(err);
                        res.send('ok')
                    })
                }
            })
    } else {
        res.render('accounts/login', {
            message: '发评论需要登录的哦。',
            title: '登录',
            description: '登录您的 Demandoo 账号后可以开始使用很多功能。这包括聊天，发作文，看作文圈，评论等等'
        });
    }
})

router.get('/mobile-essay-upvote/:essayId', function (req, res, next) {

    Essay.findById({
            _id: req.params.essayId
        })
        .exec(function (err, essay) {
            if (err) return next(err);

            var voted = []
            for (i = 0; i < essay.vote.length; i++) {
                voted.push(essay.vote[i].user.toString());
            }

            if (voted.includes(req.cookies['connect.sid'].toString())) {
                res.send('ok')
            } else {
                essay.vote.push({
                    user: req.cookies['connect.sid'].toString()
                });
                essay.voteCount += 1;
                essay.save(function (err, done) {
                    if (err) return next(err);
                    res.send('ok')
                })
            }
        })

})


module.exports = router;