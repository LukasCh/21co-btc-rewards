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

function approveDomains(opts, certs, cb) {
    if (certs) {
        opts.domains = certs.altnames;
    } else {
        opts.email = 'mail@lukaschmelar.sk';
        opts.agreeTos = true;
    }

    // NOTE: you can also change other options such as `challengeType` and `challenge`
    // opts.challengeType = 'http-01';
    // opts.challenge = require('le-challenge-fs').create({});

    cb(null, {
        options: opts,
        certs: certs
    });
}

greenlockExpress.create({
    server: 'staging',
    challenges: {
        'http-01': require('le-challenge-fs').create({webrootPath: '/tmp/acme-challenges'})
    },
    store: require('le-store-certbot').create({webrootPath: '/tmp/acme-challenges'}),
    domains: ["vps379184.ovh.net"],
    approveDomains: approveDomains,
    app: app
}).listen(80, 443);
