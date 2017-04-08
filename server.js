const http = require("http");
const url = require("url");
const port = 3000;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var router = require("./app/routes");

app.use("/api", router);

// Start the server
app.listen(port, () => {
    console.log("nodejs server is running in port " + port);
});
