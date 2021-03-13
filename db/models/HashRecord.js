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
        unique: true
    },
    contract: {
        type: mongoose.SchemaTypes.String,
    },
    network: {
        type: mongoose.SchemaTypes.String,
        default: 'matic',
        enum: ['matic']
    },
    status: {
        type: mongoose.SchemaTypes.String,
        default: 'in progress',
        enum: ['in progress', 'failed', 'done']
    },
    message: {
        type: mongoose.SchemaTypes.String
    },
    date: {
        type: mongoose.SchemaTypes.String,
        default: new Date()
    },
    fileName: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});

const HashRecord = mongoose.model('HashRecord', hashRecordSchema);

module.exports = HashRecord;
