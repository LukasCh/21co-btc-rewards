const http = require("http");
const url = require("url");
const express = require("express");
const greenlockExpress = require('greenlock-express');
const app = express();
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');

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

greenlockExpress.create({server: 'staging', email: 'mail@lukaschmelar.sk', agreeTos: true, approveDomains: ['vps379184.ovh.net'], app: app}).listen(80, 443);
