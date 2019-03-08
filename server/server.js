require("./config/config");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT;

// require routes files
const apiRoutes = require("./routes/api");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Init routes
app.use("/api", apiRoutes);

//Start the app
app.listen(port, () => {
    console.log(`Started up at port ${ port }`);
});

module.exports = {app};
