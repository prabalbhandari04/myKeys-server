const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;





const credSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, "Please enter a title!"],
    },
    url :{
        type: String,
        required: [true, "Please enter a url!"],
        unique: true
    },
    key:{
        type: String,
        required: [true, "Please enter a key!"],
        unique: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Creds", credSchema)


const Creds = mongoose.model('Creds', credSchema);
module.exports = {
    Creds
};

