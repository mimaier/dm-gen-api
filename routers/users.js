const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');
const nodemailer = require("nodemailer");
const fs = require('fs');
var smtpTransport = require('nodemailer-smtp-transport');
var handlebars = require('handlebars');
 /**
  * GET ALL ---------------------------------------------------------------- 
  */
router.get(`/`, async (req, res) => { //only '/'and beyond, because the real path is already defined at function call
    console.log("henlo");

    const userList = await User.find().select('-passwordHash'); //Gets everything from the Product Schema from the DB
    if(!userList) {
        res.status(500).json({success: false})
    }
    console.log("henlo");
    res.send(userList);
});

/**
  * GET BY ID ---------------------------------------------------------------- 
  */
router.get(`/:id`, async (req, res) => { 
    const userList = await User.findById(req.params.id).select('-passwordHash'); //- deselects a field. or name a few
    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
});

/**
  * GET COUNT ---------------------------------------------------------------- 
  */

 router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments();
    
    if (!userCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        userCount: userCount,
    });
});

/**
  * POST ---------------------------------------------------------------- 
  */

// promise way
router.post(`/register`, async (req, res) => {
    const dbUser = await User.findOne({email: req.body.email})
    if(!dbUser){
        console.log(dbUser);
        const user = new User({
            username: req.body.username, 
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 13),
            freegenerations: 50,
            generations: 0,
            loginable: 0,
            isAdmin: req.body.isAdmin
        })
        user.save().then((createdUser=> {
            res.status(201).json(createdUser)
            let user = req.body;
            console.log(user);
            try {
                sendMail(user, info => {
                    console.log(`Email wurde gesendet!! an ${req.email} !`);
                })
            } catch (error) {
                console.log("email ging in catch block!");
            }       
            //sendin EMAIL ---------------------------------




            
            async function sendMail(user, callback) {
                let transporter = nodemailer.createTransport({
                    host: "smtp-relay.sendinblue.com",
                    port: 587,
                    secure: false, 
                    auth: {
                        user: "dmgenecorpmail@gmail.com",
                        pass: "xsmtpsib-776ca91a4bbd8dbb655156e4c7d2be1501b7412c5b8c27114cee26f0c7606852-3WFDbLkhXPmMQsRS"
                    }
                });
                console.log("is in function!");
                console.log(user.email);
    
                var htmlstream = fs.createReadStream("./routers/email.html");


                let mailOptions = {
                    from: "dm-gen-team@dm-gen.com", //sender address
                    to: user.email,
                    subject: "Welcome to dm-gen.com!",
                    html: htmlstream
                }
                console.log(mailOptions);
    
                let info = await transporter.sendMail(mailOptions);
            
                callback(info);
            }
            //--------------------------------
    
        })).catch((err) => {
            res.status(500).json({
                error: err,
                success: false
            })
        });
    }else{
        res.status(200).json({
            success: true, message: "User already registered"
        })
    }
    
});


router.post(`/login`, async (req, res) => {
    console.log("in login");
    const user = await User.findOne({email: req.body.email})
   
        const secret = process.env.secret;
        console.log("after consts");
    
        if(!user){
            return res.status(400).send('user not found');
        }else{     
            if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
                const token = jwt.sign(
                    { 
                        userId: user.id,
                        isAdmin: user.isAdmin
                    }, 
                    secret
              )
                res.status(200).send({ userId: user.id, username:user.username, usermail: user.email, 
                    token: token, generations: user.generations, freegenerations: user.freegenerations, loginable: user.loginable});
            }else{
                return res.status(400).send('wrong password or username');
            }
        }
    
});

router.post(`/speciallogin`, async (req, res) => {
    console.log("in login");
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;

    if(!user){
        return res.status(400).send('user not found');
    }else{     
        if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
            const token = jwt.sign(
                { 
                    userId: user.id,
                    isAdmin: user.isAdmin
                }, 
                secret
            )

            const userList = await User.findOneAndUpdate({email: req.body.email}, 
                {
                 loginable: 1
                },
                { new: true} );
         

            res.status(200).send({userId: user.id, username:user.username, usermail: user.email, 
                token: token, generations: user.generations, freegenerations: user.freegenerations});
        }else{
            return res.status(400).send('wrong password or username');
        }
    }
});
/**
  * PUT ---------------------------------------------------------------- 
  */
 router.put(`/:id`, async (req, res) => { 
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if(req.body.password){ //so no password is los when updating
        newPassword = bcrypt.hashSync(req.body.password, 13);
    } else {
        newPassword = userExist.passwordHash;
    }


    const userList = await User.findByIdAndUpdate(req.params.id, 
       {
        username: req.body.username, 
        email: req.body.email,
        passwordHash: newPassword,
        isAdmin: req.body.isAdmin
       },
       { new: true} );

    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
});

router.put(`/makeloginable/:id`, async (req, res) => { 
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if(req.body.password){ //so no password is lost when updating
        newPassword = bcrypt.hashSync(req.body.password, 13);
    } else {
        newPassword = userExist.passwordHash;
    }
    
    const userList = await User.findByIdAndUpdate(req.params.id, 
       {
        loginable: 1
       },
       { new: true} );

    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
});

router.put(`/subtractfreegeneration/:id&:count`, async (req, res) => { 
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if(req.body.password){ //so no password is lost when updating
        newPassword = bcrypt.hashSync(req.body.password, 13);
    } else {
        newPassword = userExist.passwordHash;
    }
    let freegenerations_currently = userExist.freegenerations;
    let freegenerations_new = Number(freegenerations_currently) - Number(req.params.count);
    const userList = await User.findByIdAndUpdate(req.params.id, 
       {
        freegenerations: freegenerations_new
       },
       { new: true} );

    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
});

router.put(`/addfreegene   ration/:id&:count`, async (req, res) => { 
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if(req.body.password){ //so no password is lost when updating
        newPassword = bcrypt.hashSync(req.body.password, 13);
    } else {
        newPassword = userExist.passwordHash;
    }
    let freegenerations_currently = userExist.freegenerations;
    let freegenerations_new = Number(freegenerations_currently) + Number(req.params.count);
    const userList = await User.findByIdAndUpdate(req.params.id, 
       {
        freegenerations: freegenerations_new
       },
       { new: true} );

    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
});



/**
  * DELETE ---------------------------------------------------------------- 
  */
router.delete('/:id',  (req, res) => {  //param name must match url
    User.findByIdAndRemove(req.params.id).then(user => {
        if(user){
            return res.status(200).json({success: true, message: 'user is deleted'});
        }else{
            return res.status(404).json({success: false, message: 'user not found'});
        }
    }).catch(err => {
        return  res.status(400).json({success:false, error: err});
    })  
})


module.exports = router;  //exporting the module