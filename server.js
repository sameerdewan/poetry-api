const app = require('./app');

app.listen(process.env.PORT || 80, () => {
    console.log(`Listening on port ${process.env.PORT || 80}...`);
});
