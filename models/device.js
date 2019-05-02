const mongoose = require('mongoose')

const Schema = mongoose.Schema

const deviceSchema = new Schema({
  mac: {
    // MAC Address of default network interface
    type: String,
    required: true
  },
  authKey: {
    // Used by Device to authenticate itself
    type: String,
    required: true
  },
  pin: String, // 4 digit number, used to unlock Device
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  managers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

module.exports = mongoose.model('Device', deviceSchema)