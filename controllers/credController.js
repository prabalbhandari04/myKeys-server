const {Creds} = require('../models/credModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const shareMail = require('../utils/shareMail')
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
            const {id} = req.params;
            const {title, url, key} = req.body
            const newCred = new Creds({
                title, url, key , user : id
            })
            await newCred.save()
            res.json({msg: "Credential added successfully."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    getCred: async (req, res) => {
        try {
            const id = req.params.id
            const creds = await Creds.find({user:id})
            res.json(creds)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    deleteCred : async (req, res) => {
        try {
            const id = req.params.id
            const creds = await Creds.findByIdAndDelete(id)
            res.json({msg: "Credential deleted successfully."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    share : async (req, res) => {
        try {
            const id = req.params.id
            const creds = await Creds.findById(id)
            const email = req.body.email
            shareMail(email, creds, "Hello, here are your credentials.")
            res.json({msg: "Credential shared successfully.Please check "+email+" for the Credential."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },


    findCred : async (req, res) => {
        try {
            const creds = await Creds.find()
            res.json(creds)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}







module.exports = userCtrl