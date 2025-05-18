require('dotenv').config();
const { User } = require("../model/user.model");
const { mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

const jwtSecret = process.env.jwtSecret;

module.exports = {
  getAllUsers:(req,res)=>{
  User.find().then(resp=>{
      res.status(200).json({ success: true, data: resp})
  }).catch(error=>{
      res.status(400).json({ success: false, message: "Server Error, Try After sometime"})
   })
  },
  getUserWithId:(req,res)=>{
    let id = req.params.id;
    console.log(id)
    User.findById(id).then(resp=>{
      if(resp){
        res.status(200).json({success:true, data:resp});
       }else{
        res.status(200).json({success:false, message:"User Not Found"});
       }
    }).catch(error=>{
       console.log(error)
        res.status(400).json({ success: false, message: "Server Error, Try After sometime"})
   })

  },

  createUser: (req, res) => {
    console.log(req.body)
    User.find({ email: req.body.email }).then((resp) => {
      if (resp.length > 0) {
        res.status(200).json({ message: "Email Already Exist!" });
      } else {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (error, hash) {
            console.log(error)
            console.log(req.body)
            if (!error) {

              
              const newUser = new User({
                email: req.body.email,
                name: req.body.name,
                password: hash,
                role: 'student', // Default role for new users
              });

              newUser
                .save()
                .then((savedUser) => {
                  console.log("Saved User Message", savedUser);
                  res
                    .status(200)
                    .json({ message: "New User Saved Successfully!" });
                })
                .catch((e) => {
                  res
                    .status(500)
                    .json({ message: "There is an Unknown Error" });
                  console.log("There is an Error in saving New User",e);
                });

           






          
            } else {
              res.status(500).json({ message: "There is an Unknown Error" });
            }
          });
        });
      }
    });
  },

  login: (req, res) => {
    console.log("calling",req.body)
    User.find({ email: req.body.email }).then((resp) => {
        if (resp.length === 0) {
          return res.status(404).json({message: "User Not Found"});
        }
        console.log(resp,"response")
        bcrypt.compare(req.body.password, resp[0].password, (err,bycriptResp)=>{
          console.log(err,"err")
          console.log(bycriptResp,"bcriptResp")
          if(!err){
            if(bycriptResp){ 
              console.log("bycirpt")
              jwt.sign({ 
                userId: resp[0]._id,
                name: resp[0].name,
                role: resp[0].role 
              }, jwtSecret, (err, token)=>{
                  console.log("sign",err)
                if(!err){
                  console.log("No   Error")
                  res.header("Authorization", token)
                  res.status(200).json({
                    success: true, 
                    message: "Success Login",
                    user: {
                      id: resp[0]._id,
                      name: resp[0].name,
                      role: resp[0].role,
                      token
                    }
                  })
                } else {
                  res.status(500).json({ message: "Error generating token" });
                }
              })
            } else {
              res.status(401).json({ message: "Authentication Failed! Invalid password" });
            }
          } else {
            res.status(500).json({ message: "Server error during authentication" });
          }
        })
    }).catch(err=>{
      console.error("Login error:", err);
      res.status(500).json({message: "Server Error"})
    })
  },
  signOut: (req, res)=>{
    res.header("Authorization", '');
    console.log("Sign out")
    res.status(200).json({message: "Sign Out Successfully"})
  },
  isAuth:(req, res)=>{
    let token = req.header("Authorization");
    console.log("token", token)
    if(!token){
       return res.status(200).json({success:false, message: "You Are Not Authorized!"})
    }
    
    jwt.verify(token, jwtSecret, (err, decoded)=>{
        if(err){
            return res.status(200).json({success:false, message: "Invalid or expired token"});
        }
        
        req.user = decoded;
        res.status(200).json({success:true, data: decoded});
    });
  }
};
