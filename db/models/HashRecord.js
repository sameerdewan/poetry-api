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
        default: 'matic',
        enum: ['matic']
    },
    date: {
        type: mongoose.SchemaTypes.Date,
        default: (() => {
            const date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
          })()
    },
    fileName: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});

const HashRecord = mongoose.model('HashRecord', hashRecordSchema);

module.exports = HashRecord;
