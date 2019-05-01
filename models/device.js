const mongoose = require('mongoose')

const Schema = mongoose.Schema

const deviceSchema = new Schema({
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