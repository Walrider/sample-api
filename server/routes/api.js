const express = require('express');

const router = express.Router();
const {mongoose} = require('../db/mongoose');
const _ = require('lodash');

const {validateObjectId} = require('../middleware/validateObjectId');

const {User} = require('../models/User');

router.get('/users/:id', validateObjectId, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send('No user found with given id');
        }

        return res.send({user});
    } catch (e) {
        return res.status(400).send(e);
    }
});

router.get('/users/', async (req, res) => {
    const searchParameters = [];

    if (req.query && req.query.search) {
        const searchString = req.query.search;
        User.getSearchableFields().forEach((field) => {
            searchParameters.push({[field]: new RegExp(searchString, 'i')});
        });
    } else {
        searchParameters.push({});
    }

    try {
        const users = await User.find({$or: searchParameters});

        if (!users) {
            return res.status(404).send('No users found with given id');
        }

        return res.send({users});
    } catch (e) {
        return res.status(400).send(e);
    }
});

router.post('/users', async (req, res) => {
    try {

        const user = new User(req.body);
        await user.save();
        return res.send(user);
    } catch (e) {
        return res.status(400).send(e);
    }
});

router.patch('/users/:id', validateObjectId, async (req, res) => {
    const update = _.omit(req.body, 'password');

    try {
        const user = await User.findByIdAndUpdate(req.params.id,
            {
                $set: update,
            }, {
                new: true,
                runValidators: true
            });

        if (!user) {
            return res.status(404).send('No user found with given id');
        }

        return res.send({user});
    } catch (e) {
        return res.status(400).send(e);
    }
});

router.patch('/users/:id/password', validateObjectId, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        user['password'] = req.body.password;
        user = await user.save();

        if (!user) {
            return res.status(404).send('No user found with given id');
        }

        return res.send({user});
    } catch (e) {
        return res.status(400).send(e);
    }
});

router.delete('/users/:id', validateObjectId, async (req, res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);

        if (!user) {
            return res.status(404).send('No user found with given id');
        }

        return res.send({user});
    } catch (e) {
        return res.status(400).send(e);
    }
});

module.exports = router;
