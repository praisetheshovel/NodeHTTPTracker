const mongoose = require('mongoose');

var ShotData = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now
  },

  impact: {
    type: String,
    required: true
  },

  distance: {
    type: String,
    required: true
  }
});

const StatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },

  matches: [
    {
      matchsessionid: String,
      shots: [ShotData]
    }
  ]
});

module.exports = Stat = mongoose.model('Stat', StatSchema);
