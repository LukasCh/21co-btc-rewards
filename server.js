const http = require("http");
const https = require("https");
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

    cb(null, {
        options: opts,
        certs: certs
    });
}

var leStore = require('le-store-certbot').create({
    configDir: '~/letsencrypt/etc', // or /etc/letsencrypt or wherever
    privkeyPath: ':configDir/live/:hostname/privkey.pem', //
    fullchainPath: ':configDir/live/:hostname/fullchain.pem', // Note: both that :configDir and :hostname
    certPath: ':configDir/live/:hostname/cert.pem', //       will be templated as expected by
    chainPath: ':configDir/live/:hostname/chain.pem', //       node-letsencrypt
    workDir: '~/letsencrypt/var/lib',
    logsDir: '~/letsencrypt/var/log',
    webrootPath: '~/letsencrypt/srv/www/:hostname/.well-known/acme-challenge',
    debug: true
});

var lex = greenlockExpress.create({
    server: 'https://acme-v01.api.letsencrypt.org/directory',
    challenges: {
        'http-01': require('le-challenge-fs').create({webrootPath: '~/letsencrypt/var/acme-challenges'})
    },
    store: leStore,
    approveDomains: approveDomains,
    app: app
});

http.createServer(lex.middleware(require('redirect-https')())).listen(80, function() {
    console.log("Listening for ACME http-01 challenges on", this.address());
});

https.createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function() {
    console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
});
