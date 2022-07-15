const {Creds} = require('../models/credModel')
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
    addCred: async (req, res) => {
        try {
            const {title, url, key} = req.body
            const newCred = new Creds({
                title, url, key
            })
            await newCred.save()
            res.json({msg: "Credential added successfully."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    getCred: async (req, res) => {
        try {
            const creds = await Creds.find()
            res.json(creds)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
};





module.exports = userCtrl