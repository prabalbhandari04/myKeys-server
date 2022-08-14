const {Users} = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require('../utils/sendMail')
const {google} = require('googleapis')
const {OAuth2} = google.auth
const { json } = require('express')
const mongoose = require('mongoose')
// mailing env key
const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID)

// client url from dot env
const {CLIENT_URL} = process.env


// user controller
const userCtrl = {

    // register user controller using name, email, password
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body

            // validation for name email and password            
            if(!name || !email || !password)
                return res.status(400).json({msg: "Please fill in all fields."})
            
            // validation for email
            if(!validateEmail(email))
                return res.status(400).json({msg: "Invalid emails."})

            // redundancy check for email
            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: "This email already exists."})

            // password length check
            if(password.length < 6)
                return res.status(400).json({msg: "Password must be at least 6 characters."})

            // password hash
            const passwordHash = await bcrypt.hash(password, 12)

            // create user
            const newUser = {
                name, email, password: passwordHash
            }
        
            // create activation token 
            const activation_token = createActivationToken(newUser)

            // send activation token via email
            const url = `${CLIENT_URL}/user/activate/${activation_token}`
            sendMail(email, url, "Verify your email address")

            // email send waiting for activation
            res.json({msg: "Register Success! Please activate your email to start."})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
    // activate user controller using activation token
    activateEmail: async (req, res) => {
        try {
            const {activation_token} = req.body
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)
            
            const {name, email, password} = user


            const check = await Users.findOne({email})
            if(check) return res.status(400).json({msg:"This email already exists."})

            const newUser = new Users({
                name, email, password
            })

            await newUser.save()
            res.json({msg: "Account has been activated!"})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    // login user controller using email and password
    login: async (req, res) => {
        try {
            const {email, password} = req.body
            const user = await Users.findOne({email})

            // email not found
            if(!user) return res.status(400).json({msg: "This email does not exist."})

            // password incorrect
            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: "Password is incorrect."})

            // create access token
            const refresh_token = createRefreshToken({id: user._id})
            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7 days
            })


            res.json({msg: "Login success!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    // refresh token controller
    getAccessToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if(!rf_token) return res.status(400).json({msg: "Please login now!"})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if(err) return res.status(400).json({msg: "Please login now!"})

                const access_token = createAccessToken({id: user.id})
                res.json({access_token})
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    // forget password controller
    forgotPassword: async (req, res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})

            // email not found
            if(!user) return res.status(400).json({msg: "This email does not exist."})

            // create activation token
            const access_token = createAccessToken({id: user._id})
            const url = `${CLIENT_URL}/user/reset/${access_token}`

            // send activation token via email
            sendMail(email, url, "Reset your password")
            res.json({msg: "Re-send the password, please check your email."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    // reset password controller
    // reset password controller
    resetPassword: async (req, res) => {
        try {
            const {password} = req.body
            
            // password length check
            const passwordHash = await bcrypt.hash(password, 12)
            
            // update password
            await Users.findOneAndUpdate({_id: req.user.id}, {
                password: passwordHash
            })

            res.json({msg: "Password successfully changed!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    // get user info controller
    getUserInfo: async (req, res) => {
        try {
            const id = req.params.id
            const user = await Users.findById(id).select('-password')

            res.json(user)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    // update user info controller
    getUsersAllInfo: async (req, res) => {
        try {
            const users = await Users.find().select('-password')
            res.json(users)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/user/refresh_token'})
            return res.json({msg: "Logged out."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

};





function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn: '15m'})
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '45m'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = userCtrl