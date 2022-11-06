const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');
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
router.post(`/register`, (req, res) => {
    const user = new User({
        username: req.body.username, 
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 13),
        isAdmin: req.body.isAdmin
    })

    user.save().then((createdUser=> {
        res.status(201).json(createdUser)
    })).catch((err) => {
        res.status(500).json({
            error: err,
            success: false
        })
    });
});


router.post(`/login`, async (req, res) => {
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
            res.status(200).send({username:user.username, usermail: user.email, token: token});
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