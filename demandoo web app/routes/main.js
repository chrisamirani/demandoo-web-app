var router = require('express').Router();
var Contact = require('../models/contact');
var Blog = require('../models/blog');
var Contestant = require('../models/contestant');
var User = require('../models/user');
var Model = require('../models/models');
var Essay = require('../models/essay');
var mongoose= require('mongoose');
var axios = require('axios');
var qs= require('qs');


router.get('/', function (req, res, next) {
   res.render('main/home',{
              title:'Demandoo | 您的语言好伴',
              description:'Demandoo是一个在学外方面的重要配件。我们的智能语法修改器是在中国唯一的一个工具。如果考雅思或托福，您可以使用这个工具提高自己作文的语法。同时可以从我们作文圈看到很多不同的写作例子。'
              });

});



router.get('/contact', function (req, res, next) {
    res.render('main/contact',{
         title:'联系我们',
              description:'我们很期待收到您的意见。您可以随时跟我们联系。我们会尽快回复您。'
    });
});

router.post('/contact', (req, res, next) => {
    var contact = new Contact();

    contact.subject = req.body.subject;
    contact.email = req.body.email;
    contact.message = req.body.message;

    contact.save((done, err) => {
        if (err) return next(err);

        
    }).then( res.redirect('/contact') );
})


//terms of use page
router.get('/tou',function(req,res,next){
    res.render('main/terms-of-use',{
         title:'使用规定',
              description:'Demandoo是一个有好的社群。请在注册前读我们的几个小规定。这样我们可以避免未来的一些误会。感谢您用 Demandoo'
    });
});
//terms of use for IOS app
router.get('/app-get-tou',function(req,res,next){
    res.render('main/mobile-tou',{
         title:'使用规定',
              description:'Demandoo是一个有好的社群。请在注册前读我们的几个小规定。这样我们可以避免未来的一些误会。感谢您用 Demandoo'
    });
});
//essay writing page
router.get('/editor',function(req,res,next){
        res.render('main/editor',{
             title:'智能语法修改器',
              description:'智能修改器是一个用到 AI 科技的语法工具。您可以把自己的作文填进去后查到您的一些语法问题。请注意这个工具不可以提供 100% 对的语法提示。所以建议您改完作文再发作文群收到其他同学和专家的意见。'
        })
  
});


router.post('/new-blog-post',function(req,res,next){
    
    var blog = new Blog;
    blog.title = req.body.title;
    blog.body = req.body.body;
    
    blog.save(function(err,done){
        if(err) return next(err);
        res.redirect('/blog');
    })
    
})

router.get('/blog',function(req,res,next){
    
    Blog.find({},function(err,blog){
        if(err) return next(err);
        var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
        res.render('main/blog',{
            blog : blog,
            monthNames : monthNames,
             title:'每日看 Blog',
              description:'在我们 Blog 里面我们会挑选不同的话题给您写小作文或新闻。每日您可以看完后好好学有用的英语知识。'
        })
    })
})

router.get('/app-get-blog',function(req,res,next){
    
    Blog.find({},function(err,blog){
        if(err) return next(err);
        var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
        res.render('main/mobile-blog',{
            blog : blog,
            monthNames : monthNames
        })
    })
})


router.get('/blog/:blogId',function(req,res,next){
    
    Blog.findById({_id:req.params.blogId},function(err,blog){
        if(err){
            if(res.headerSent){
                return next(err);
            }
            res.render('main/error',{
                error:err,
                title:'Error 404',
                description:'Something went wrong.'
                                    });
            
        }else{
            
             Blog.find({},function(err,blogPosts){
        if(err) return next(err);
       var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
        res.render('main/blogPage',{
            blog : blog,
            title: blog.title,
            description:blog.title + ' Read more about this on Demandoo blog and get more information.',
            blogPosts: blogPosts,
            monthNames : monthNames
        })
    })
            
            
 
        }
    })
    
})

router.get('/post-blog',function(req,res,next){
    if(req.user && req.user._id.toString() === 'your Admin mongodb ID'){
        res.render('main/post-blog',{
             title:'发作文圈',
              description:'您可以发您的作文到我们作文圈去。发完后很多朋友和专家可以看到您的作文然后给您评论一些提示和建议。'
        })
    }else{
        res.redirect('/');
    
    }
})

//new

router.get('/post-essay',function(req,res,next){
    if(req.user){
        res.render('main/post-essay',{
             title:'发作文圈',
              description:'您可以发您的作文到我们作文圈去。发完后很多朋友和专家可以看到您的作文然后给您评论一些提示和建议。',
            message:''
        })
    }else{
        res.render('accounts/login', {
        message: '发作文需要登录的哦',
        title:'登录',
        description:'登录后您可以发您的作文到我们作文圈去。发完后很多朋友和专家可以看到您的作文然后给您评论一些提示和建议。'
    });
    }
})

router.post('/post-essay',function(req,res,next){
    if(req.user){
        if(req.body.title.length > 0 && req.body.essay.length > 0){
        var essay = new Essay();
        essay.title = req.body.title;
        essay.body = req.body.essay;
        essay.writer = req.user._id;
        
        essay.save(function(err,savedEssay){
            if(err) return next(err);
           
            if(req.user.teacher != 1){
                 User.find({teacher:1}, 'email')
            .exec(function(err,teachers){
        if(err) return next(err);
        let emails = '';
            for(i=0;i < teachers.length; i++){
                emails += teachers[i].email + ','
            }
        'use strict';
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    host: 'smtp server',
    port: 587,
    secure: false, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'Your smpt mail username',
        pass: 'your smtp mail password'
    }
}); 

var body = '<html><body style=""><div style="width:100%;background-color:#4184f3;padding:10px;height:10%;"><img src="https://your domain/imgs/logo-footer-white.png" style="width:auto;max-height:6em"></div><div style="height:auto;width:100%;font-family:sans-serif;width:80%;margin-left:7%;background-color:white;;padding:20px;margin-top:-20px;box-shadow: 4px 6px 23px grey;"><p>亲爱的老师,</p><p>有个学生刚发了一篇作文 title 是：' + req.body.title +'</p><p>您如果有空去看一下咯。</p><p style="text-align:center;"><a href="https://your domain/essay/' + savedEssay._id + '" style="background-color:transparent;padding:10px;border-radius:8px;text-decoration: none;border-style: solid;color: #3fd69f;border-color: #3fd69f;border-width: 1px;">查看新作文</a></p><p>Peace,<br>Demandoo Team</p></div><div style="text-align:center;height:auto;width:100%;font-family:sans-serif;width:80%;margin-left:7%;padding:5px;margin-top:15px"><small style="color:#dcdcdc">Demandoo | 你的语言好伴</small><br><small style="color:#dcdcdc">Pazhou New Village, Guangzhou</small></div></body></html>';
    
// setup email data with unicode symbols 
var mailOptions = {
    from: '"Demandoo"<your mail address >', // sender address
    to: emails.toString("utf8"), // list of receivers
    subject: '有新作文', // Subject line
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
    })
            
            }
            
            res.redirect('/essays')
        })
        }else{
            res.render('main/post-essay',{
             title:'发作文圈',
              description:'您可以发您的作文到我们作文圈去。发完后很多朋友和专家可以看到您的作文然后给您评论一些提示和建议。',
                message:'请确认您填写题目和整体再发作文'
        })
        }
    }else{
        res.render('accounts/login', {
        message: '发作文需要登录的哦',
         title:'登录',
              description:'登录后您可以发您的作文到我们作文圈去。发完后很多朋友和专家可以看到您的作文然后给您评论一些提示和建议。'
    });
    }
})

router.get('/essays',function(req,res,next){
    Essay.find({})
    .populate('writer')
    .exec(function(err,essays){
        if(err) return next(err);
        res.render('main/essays',{
            essays:essays,
             title:'作文圈',
              description:'每日看到很多同学的作文。如果他们的作文比您的好，那您可以向他们学学。也可以把你自己知道的知识说一下给大家。'
        })
    })
})
router.get('/app-get-essays',function(req,res,next){
    Essay.find({})
    .populate('writer')
    .exec(function(err,essays){
        if(err) return next(err);
        res.render('main/mobile-essays',{
            essays:essays
        })
    })
})
router.get('/essay/:essayId',function(req,res,next){
   if (req.user){
    Essay.findById({_id:req.params.essayId})
    .populate('writer')
    .populate('comments.user')
    .exec(function(err,essay){
        if(err) return next(err);
        
        var voted = []
        for(i=0;i < essay.vote.length; i++){
            voted.push(essay.vote[i].user.toString());
        }
        
        if (voted.includes(req.user._id.toString())){
            res.render('main/essay',{
            essay:essay,
            voted : true,
             title:essay.writer.profile.name,
              description:essay.body
        })
        }else{
            if(err) return next(err);
             res.render('main/essay',{
             essay:essay,
             voted : false,
             title:essay.writer.profile.name,
              description:essay.body
        })
        
        }
        
        
       
    })
   }else{
       res.render('accounts/login', {
        message: '看作文的细节或评论需要登录',
            title:'登录',
              description:'登录后您可以发您的作文到我们作文圈去。发完后很多朋友和专家可以看到您的作文然后给您评论一些提示和建议。'
    });
   }
})
router.get('/chat',function(req,res,next){
    if(req.user){
    res.render('main/chat',{
         title:'Chatter Box',
              description:'在 Chatter Box 您可以每天找一些朋友来聊不同话题。也可以学很多英语单词。我们挑选了500个在考试最常用的英语单词您可以慢慢背。'
    });
    }else{
        res.render('accounts/login', {
        message: '如果要聊天先登录咯',
         title:'登录',
              description:'登录后您可以发您的作文到我们作文圈去。发完后很多朋友和专家可以看到您的作文然后给您评论一些提示和建议。'
    });
    }
})

router.post('/v2/check',function(req,res,next){

     axios.post('https://languagetool.org/api/v2/check',qs.stringify({text:req.body.text,language:'en-US'}))
    .then(function (response) {
         res.json(response.data);
    
  })
  .catch(function (error) {
    console.log(error);
  });
});

router.get('/ielts-model-tests',function(req,res,next){
    if(req.user){
        Model.find({testType:new RegExp( 'ielts' ,"i")})
    .exec(function(err,models){
        if(err) return next(err);
        res.render('main/models',{
            models:models,
            title:'IELTS雅思写作模版',
              description:'Demandoo是一个在学外方面的重要配件。我们的智能语法修改器是在中国唯一的一个工具。如果考雅思或托福，您可以使用这个工具提高自己作文的语法。同时可以从我们作文圈看到很多不同的写作例子。'
        });
    })}else{
            res.redirect('/login')
        }
})

router.get('/toefl-model-tests',function(req,res,next){
   if(req.user){
       Model.find({testType:new RegExp( 'toefl' ,"i")})
    .exec(function(err,models){
        if(err) return next(err);
        res.render('main/models',{
            models:models,
            title:'TOEFL托付写作模版',
              description:'Demandoo是一个在学外方面的重要配件。我们的智能语法修改器是在中国唯一的一个工具。如果考雅思或托福，您可以使用这个工具提高自己作文的语法。同时可以从我们作文圈看到很多不同的写作例子。'
        });
    })
   }else{
       res.redirect('/login')
   }
})
router.post('/new-model-test',function(req,res,next){
    if(req.user){
        if(req.user.teacher == 1){
    var model = new Model;
    model.title = req.body.title;
    model.testType = req.body.testType;
    model.body = req.body.body;
    model.score = req.body.score;
    
    model.save(function(err,model){
        if(err) return next(err);
        
        res.redirect('/model-test/' + model._id.toString())
    })
        }else{
            res.redirect('/')
        }
    }else{
        res.redirect('/login')
    }
})

router.get('/model-test/:modelTestId',function(req,res,next){
    if(req.user){
        Model.findById({_id:req.params.modelTestId})
    .exec(function(err,model){
         if (err) return next(err);
        
        res.render('main/model-test',{
            model:model,
            title:model.title,
              description:'Demandoo是一个在学外方面的重要配件。我们的智能语法修改器是在中国唯一的一个工具。如果考雅思或托福，您可以使用这个工具提高自己作文的语法。同时可以从我们作文圈看到很多不同的写作例子。'
        })
    })
    }else{
        res.redirect('/login')
    }
})
router.get('/post-model-test',function(req,res,next){
    if(req.user){
        if(req.user.teacher == 1){
          res.render('main/model-post',{
              title:'Demandoo | 您的语言好伴',
              description:'Demandoo是一个在学外方面的重要配件。我们的智能语法修改器是在中国唯一的一个工具。如果考雅思或托福，您可以使用这个工具提高自己作文的语法。同时可以从我们作文圈看到很多不同的写作例子。'
              });  
        }else{
            res.redirect('/');
        }
        
        
    }else{
        res.redirect('/login');
    }
    
})

router.get('/pick-model-test',function(req,res,next){
   if(req.user){
       res.render('main/choose-model-test',{
           title:'选择想要的模版',
              description:'Demandoo是一个在学外方面的重要配件。我们的智能语法修改器是在中国唯一的一个工具。如果考雅思或托福，您可以使用这个工具提高自己作文的语法。同时可以从我们作文圈看到很多不同的写作例子。'
       });
   }else{
       res.redirect('/login')
   }
})



router.get('/writing-competition',function(req,res,next){
    /*res.render('main/competition',{
        error:''
    });*/
    res.send('Competition Time Has Ended')
})
router.post('/writing-competition',function(req,res,next){
    /*if(req.body.name.length > 0 && req.body.email.length > 0 && req.body.wechat.length > 0 && req.body.essay.length > 50 ){
        var contestant = new Contestant;
         contestant.name= req.body.name;
        contestant.email = req.body.email;
        contestant.wechat = req.body.wechat;
        contestant.essay = req.body.essay;
        
        contestant.save(function(err,done){
            res.render('main/submition-success')
        })
    }else{
        res.render('main/competition',{
            error:'请不要提交空白表格。先确认填写姓名，邮箱地址，微信号和作文整体。谢谢'
        })
    }*/
    res.send('Competition Time Has Ended')
})
module.exports = router;