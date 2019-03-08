const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minLength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must contain at least 8 characters'],
        validate: {
            validator: (password) => /^(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(password),
            message: () => `Password must contain only alphanumeric characters(at least 8) with at least one capital letter`
        },
    },
    first_name: {
        type: String,
        required: [true, 'First Name is required'],
        maxLength: 25,
        trim: true,
    },
    last_name: {
        type: String,
        required: [true, 'Last Name is required'],
        maxLength: 25,
        trim: true,
    },
    city: {
        type: String,
        required: false,
        minLength: 1,
        maxLength: 25,
        trim: true,
    }
});

UserSchema.statics.getSearchableFields = () => {
    return ['email', 'first_name', 'last_name', 'city'];
};

UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email', 'first_name', 'last_name', 'city']);
};

UserSchema.pre('save', async function (next) {
    try {
        let user = this;

        if (user.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            next();
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
    }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User};
