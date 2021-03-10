const connectDB = require('../db/api');
const app = require('./app');

connectDB().then(() => {
    app.listen(process.env.PORT || 8080, () => {
        console.log(`Listening on port ${process.env.PORT || 8080}...`);
    });    
});
