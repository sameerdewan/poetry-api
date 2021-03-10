const mongoose = require('mongoose');

function connectDB() {
    mongoose.connect(process.env.MONGO_DB_URL, { useUnifiedTopology: true, useNewUrlParser: true });
    const db = mongoose.connection;
    return new Promise((resolve, reject) => {
        db.on('error', err => {
            console.log(err.message);
            reject(err.message);
        });
        db.once('open', () => {
            console.log('MongoDB connection open');
            resolve();
        });
    });
}

module.exports = connectDB;
