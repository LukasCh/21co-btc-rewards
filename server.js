const http = require("http");
const url = require("url");
const port = 3000;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');

app.use(express.static('plugin'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var router = require("./app/routes");

app.use("/api", router);

var swaggerJSDoc = require('swagger-jsdoc');

var options = {
    swaggerDefinition: {
        info: {
            title: '21.co Rewards API', // Title (required)
            version: '1.0.0' // Version (required)
        },
        basePath: '/api'
    },
    apis: ['./app/routes.js'], // Path to the API docs
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
var swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server
app.listen(port, () => {
    console.log("nodejs server is running in port " + port);
});
