const mongoose = require('mongoose');

const hashRecordSchema = new mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    hash: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    tx: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    contract: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    network: {
        type: mongoose.SchemaTypes.String,
        required: true,
        enum: ['ethereum', 'matic']
    },
    date: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    fileName: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});

const HashRecord = mongoose.model('HashRecord', hashRecordSchema);

module.exports = HashRecord;
