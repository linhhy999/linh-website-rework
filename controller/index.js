var express = require('express');
var router = express.Router();
const userModel = require('../model/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.post('/', function(req, res, next) {
    if (req.body.typee=='login'){
        userModel.login(req.body, (err, item) =>{
            if (err)
                res.json(err)
            else 
                res.json({html: "<h1> Welcome to newfeed </h1>"})
        })
    }
    else{
        if (req.body.password == req.body.confirmpassword)
            userModel.create(req.body, (err, item) =>{
                res.json(err)
            })
        else 
            res.json({message: "Password are not matching!", color: "red"})
    }
  });
module.exports = router;
