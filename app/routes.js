// Routes
const express = require("express");
var router = express.Router();

const request = require('request');

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

const TeamService = require("./services/TeamService");
TeamService.init(db);

const UserService = require("./services/UserService");
UserService.init(db);

const WAValidator = require('wallet-address-validator');
/**
 * @swagger
 * /:
 *   get:
 *     description: Tests if the API is running or not
 *     tags:
 *       - Test
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: status
 */
router.get("/", function(req, res) {
    res.status(200).json({message: "BTC Bounty server is alive!"}).end();
});

// Team API routes
/**
 *  @swagger
 *  definitions:
 *    Team:
 *      type: object
 *      properties:
 *        rowid:
 *          type: integer
 *          description: Team ID
 *        name:
 *          type: string
 *          description: Team Name
 *        satoshiBalance:
 *          type: integer
 *          description: Satoshi balance
 *    TeamLite:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: Team Name
 *    Balance:
 *      type: object
 *      properties:
 *        amount:
 *          type: integer
 *          description: Amount to add/subtract
 */

/**
 * @swagger
 * /teams:
 *   post:
 *     description: Creates a team
 *     operationId: createTeam
 *     tags:
 *       - Teams
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Team that will be crated
 *         schema:
 *           $ref: '#/definitions/TeamLite'
 *     responses:
 *       201:
 *         description: Created Team
 *         schema:
 *           $ref: '#/definitions/Team'
 *   get:
 *     description: Returns all teams
 *     operationId: getTeams
 *     tags:
 *       - Teams
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Arrays of Teams
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Team'
 */
router.route("/teams").post(function(req, res) {
    TeamService.createTeam({
        name: req.body.name
    }, function(result) {
        if (result) {
            res.status(201).json(result).end();
        } else {
            res.status(400).end();
        }
    });
}).get(function(req, res) {
    TeamService.getTeams(function(result) {
        if (result) {
            res.status(200).json(result).end();
        } else {
            res.status(404).end();
        }
    });
});

/**
 * @swagger
 * /teams/{teamId}:
 *   get:
 *     description: Returns a Team
 *     operationId: getTeam
 *     tags:
 *       - Teams
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *     responses:
 *       200:
 *         description: Team with the ID provided
 *         schema:
 *           $ref: '#/definitions/Team'
 *       404:
 *         description: Returned if the Team does not exist
 *   put:
 *     description: Updates a Team
 *     operationId: updateTeam
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *       - in: body
 *         name: body
 *         description: Team with updated values
 *         schema:
 *           $ref: '#/definitions/TeamLite'
 *     responses:
 *       204:
 *         description: no content
 *   delete:
 *     description: Deletes a Team
 *     operationId: deleteTeam
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *     responses:
 *       204:
 *         description: no content
 */
router.route("/teams/:teamId").get(function(req, res) {
    TeamService.getTeam(req.params.teamId, function(result) {
        if (result) {
            res.status(200).json(result).end();
        } else {
            res.status(404).end();
        }
    });
}).put(function(req, res) {
    TeamService.updateTeam(req.params.teamId, req.body, function(result) {
        if (!result) {
            res.status(204).end();
        } else {
            res.status(400).json(result).end();
        }
    });
}).delete(function(req, res) {
    TeamService.deleteTeam(req.params.teamId, function(result) {
        if (!result) {
            res.status(204).end();
        } else {
            res.status(400).json(result).end();
        }
    });
});

/**
 * @swagger
 * /teams/{teamId}/balance:
 *   put:
 *     description: Changes Team balance, used for paying and adding of funds to a team
 *     operationId: updateTeam
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *       - in: body
 *         name: body
 *         description: Satoshi amount to add/subtract
 *         schema:
 *           $ref: '#/definitions/Balance'
 *     responses:
 *       204:
 *         description: no content
 */
router.route("/teams/:teamId/balance").put(function(req, res) {
    TeamService.changeBalance(req.params.teamId, req.body.amount, function(result) {
        if (!result) {
            res.status(204).end();
        } else {
            res.status(400).json(result).end();
        }
    });
});

// User API routes
/**
 *  @swagger
 *  definitions:
 *    User:
 *      type: object
 *      properties:
 *        rowid:
 *          type: integer
 *          description: User ID
 *        name:
 *          type: string
 *          description: User Name
 *        paymentAddress:
 *          type: string
 *          description: User BTC Address/21.co username
 *        teamId:
 *          type: integer
 *          description: Team ID
 *    UserLite:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: User Name
 *        paymentAddress:
 *          type: string
 *          description: User BTC Address/21.co username
 *    PaymentDetails:
 *      type: object
 *      properties:
 *        amount:
 *          type: integer
 *          description: Amount to add/subtract
 *        description:
 *          type: string
 *          description: Payment description
 */

/**
 * @swagger
 * /teams/{teamId}/users:
 *   post:
 *     description: Creates a User in a Team
 *     operationId: createUser
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *       - in: body
 *         name: body
 *         description: User that will be crated
 *         schema:
 *           $ref: '#/definitions/UserLite'
 *     responses:
 *       201:
 *         description: Created User
 *         schema:
 *           $ref: '#/definitions/User'
 *   get:
 *     description: Returns all Users in a Team
 *     operationId: getUsers
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *     responses:
 *       200:
 *         description: Arrays of Users
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 */
router.route("/teams/:teamId/users").post(function(req, res) {
    UserService.createUser(req.params.teamId, {
        name: req.body.name,
        paymentAddress: req.body.paymentAddress
    }, function(result) {
        if (result) {
            res.status(201).json(result).end();
        } else {
            res.status(400).end();
        }
    });
}).get(function(req, res) {
    UserService.getUsers(req.params.teamId, function(result) {
        if (result) {
            res.status(200).json(result).end();
        } else {
            res.status(404).end();
        }
    });
});

/**
 * @swagger
 * /teams/{teamId}/users/{userId}:
 *   get:
 *     description: Returns a User
 *     operationId: getUser
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *       - in: path
 *         name: userId
 *         description: User ID or Name
 *         type: string
 *     responses:
 *       200:
 *         description: User with the ID provided
 *         schema:
 *           $ref: '#/definitions/User'
 *       404:
 *         description: Returned if the User does not exist
 *   put:
 *     description: Updates a User
 *     operationId: updateUser
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *       - in: path
 *         name: userId
 *         description: User ID or Name
 *         type: string
 *       - in: body
 *         name: body
 *         description: User with updated values
 *         schema:
 *           $ref: '#/definitions/UserLite'
 *     responses:
 *       204:
 *         description: no content
 *   delete:
 *     description: Deletes a User
 *     operationId: deleteUser
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *       - in: path
 *         name: userId
 *         description: User ID or Name
 *         type: string
 *     responses:
 *       204:
 *         description: no content
 */
router.route("/teams/:teamId/users/:userId").get(function(req, res) {
    UserService.getUser(req.params.teamId, req.params.userId, function(result) {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).end();
        }
    });
}).put(function(req, res) {
    UserService.updateUser(req.params.teamId, req.params.userId, req.body, function(result) {
        if (!result) {
            res.status(204).end();
        } else {
            res.status(400).json(result).end();
        }
    });
}).delete(function(req, res) {
    UserService.deleteUser(req.params.teamId, req.params.userId, function(result) {
        if (!result) {
            res.status(204).end();
        } else {
            res.status(400).json(result).end();
        }
    });
});

/**
 * @swagger
 * /teams/{teamId}/users/{userId}/pay:
 *   post:
 *     description: Pays the specified amount of satoshi to the Users address
 *     operationId: payUser
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: teamId
 *         description: Team ID or Name
 *         type: string
 *       - in: path
 *         name: userId
 *         description: User ID
 *         type: string
 *       - in: body
 *         name: body
 *         description: Satoshi amount to pay to the user
 *         schema:
 *           $ref: '#/definitions/PaymentDetails'
 *     responses:
 *       204:
 *         description: no content
 *       400:
 *         description: error when getting team data
 *       500:
 *         description: error performing the payment
 */
router.route("/teams/:teamId/users/:userId/pay").post(function(req, res) {
    var amount = req.body.amount;
    var description = req.body.description;
    var teamId = req.params.teamId;
    var userId = req.params.userId;

    TeamService.getTeam(teamId, function(team) {
        // if the team exists
        if (team) {
            // and has enough satoshi to pay the user
            if (team.satoshiBalance - amount >= 0) {
                // update satoshi balance
                TeamService.changeBalance(teamId, -amount, function(result) {
                    if (!result) {
                        //retrieve users BTC address/21.co account to perform the payment on 21.co
                        UserService.getUser(teamId, userId, function(user) {
                            var url;
                            if (typeof user !== "undefined" && user && typeof user.paymentAddress !== "undefined") {
                                if (WAValidator.validate(user.paymentAddress, 'BTC')) {
                                    url = "http://127.0.0.1:5000/payAddress?address=" + user.paymentAddress + "&amount=" + amount + "&description=" + description;
                                } else {
                                    url = "http://127.0.0.1:5000/payUser?user=" + user.paymentAddress + "&amount=" + amount + "&description=" + description;
                                }
                                console.log(url);
                                request(url, function(error, response, body) {
                                    console.log('error:', error); // Print the error if one occurred
                                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                                    if (response && response.statusCode == 200) {
                                        res.status(204).end();
                                    } else {
                                        // rollback the balance change
                                        TeamService.changeBalance(teamId, amount, function(result) {
                                            res.status(500).json({message: "Error performing payment."}).end();
                                        });
                                    }
                                });
                            } else {
                                // rollback the balance change
                                console.log("Unknown user " + user);
                                TeamService.changeBalance(teamId, amount, function(result) {
                                    res.status(400).json({message: "Invalid user or a user without paymentAddress."}).end();
                                });
                            }
                        })
                    } else {
                        res.status(400).json(team).end();
                    }
                })
            } else {
                res.status(400).json({message: "Not enough satoshi to send payment."}).end();
            }
        } else {
            res.status(400).json(team).end();
        }
    });
});

router.route("/webhook").post(function(req, res) {
    //console.dir(req.body);
    var userKey = req.body.user.key;
    var reward = req.body.properties[0].value;
    //console.log("props are " + properties['bitcoin-reward']);
    //console.dir(properties);
    for (var key in req.body.changelog.items) {
        if (req.body.changelog.items.hasOwnProperty(key)) {
            item = req.body.changelog.items[key];
            //console.log(item);
            if ((item.field === "resolution") && (item.toString !== null)) {

                var options = {
                    url: 'https://vps.lukaschmelar.sk/api/teams/hotovo/users/' + userKey + '/pay',
                    method: 'POST',
                    form: {
                        'amount': reward,
                        'description': 'payment for JIRA issue ' + req.body.issue.key
                    }
                }

                request(options, function(error, response, body) {
                    //console.log(body);
                    if (!error && response.statusCode == 200) {
                        // Print out the response body
                        console.log(body);
                    } else {
                        console.log(error);
                    }
                })

                console.log("I found close event!");
            }
        }
    }
    res.status(200).json({message: "Yay, webhook!"}).end();
});

module.exports = router;
