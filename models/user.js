const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roles: {
    // Valid types: user, admin
    type: [String],
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  devicesOwning: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Device'
    }
  ],
  devicesManaging: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Device'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);