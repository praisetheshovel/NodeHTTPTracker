const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4');

const Stat = require('../../models/Stat');
const User = require('../../models/User');

// @route       GET api/stats/me
// @desc        Get current users stat page
// @access      Private
router.get('/me', auth, async (req, res) => {
  try {
    const stat = await Stat.findOne({ user: req.user.id }).populate('User', [
      'name',
      'avatar'
    ]);

    if (!stat) {
      return res
        .status(400)
        .json({ msg: 'There is no stat data for this user' });
    }

    res.json(stat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       POST api/stats
// @desc        Create or update a user stat profile
// @access      Private
router.post('/', auth, async (req, res) => {
  // Build stat object
  const statFields = {};
  statFields.user = req.user.id;
  try {
    let stat = await Stat.findOne({ user: req.user.id });

    if (stat) {
      // Update
      stat = await Stat.findOneAndUpdate(
        { user: req.user.id },
        { $set: statFields },
        { new: true }
      );
      return res.json(stat);
    }
    // Create
    stat = new Stat(statFields);
    await stat.save();
    return res.json(stat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       PUT api/stats/{{matchidentifier}}
// @desc        Update stats related to a match
// @access      Private
router.put('/matches/matchidentifier', auth, async (req, res) => {
  // Build shot object from request
  const { shots } = req.body;
  const dataShots = shots;

  try {
    let stat = await Stat.findOne({ user: req.user.id });

    if (stat) {
      // Update
      stat = await Stat.findOneAndUpdate(
        { user: req.user.id },
        {
          $push: {
            matches: {
              matchsessionid: uuidv4(),
              shots: dataShots
            }
          }
        },
        { new: true, upsert: true }
      );
      return res.json(stat);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/*  Dead route - Useful for updating adding a single object to an array of objects - E.G. array[{},{},...]
// @route       PUT api/stat/NOACCESS
// @desc        Update stats related to a match
// @access      Private
router.put(
  '/NOACCESS',
  [
    auth,
    [
      check('impact', 'Impact point required')
        .not()
        .isEmpty(),
      check('distance', 'Distance of shot required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Request body
    const { impact, distance } = req.body;

    // Build profile object
    const newShot = {
      impact,
      distance
    };

    try {
      let stat = await Stat.findOne({ user: req.user.id });

      stat.shots.unshift(newShot);

      await stat.save();

      res.json(stat);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
*/

module.exports = router;
