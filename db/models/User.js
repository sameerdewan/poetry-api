const mongoose = require('mongoose');
require('mongoose-type-email');

const userSchema = new mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true,
        min: [3, 'Username is too short'],
        max: [20, 'Username is too long']
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true,
        min: [5, 'Password is too short']
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        unique: true,
        required: true
    },
    validated: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
    validationCode: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    customerId: {
        type: mongoose.SchemaTypes.String,
        default: null
    },
    subscription: {
        type: mongoose.SchemaTypes.String,
        enum: [null, 'Basic', 'Professional', 'Business', 'Unlimited'],
        default: null
    },
    subscriptionId: {
        type: mongoose.SchemaTypes.String,
        default: null
    },
    monthToDatePings: {
        type: mongoose.SchemaTypes.Number,
        default: 0
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
