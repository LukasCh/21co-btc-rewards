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

// test route
router.get("/", function(req, res) {
    res.json({
        message: "BTC Bounty server is alive!"
    });
});

// Team API routes
router.route("/teams")
    .post(function(req, res) {
        TeamService.createTeam({
                name: req.body.name
            },
            function(result) {
                if (result) {
                    res.status(201).json(result);
                } else {
                    res.status(400).end();
                }
            });
    })
    .get(function(req, res) {
        TeamService.getTeams(function(result) {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).end();
            }
        });
    });

router.route("/teams/:teamId")
    .get(function(req, res) {
        TeamService.getTeam(req.params.teamId, function(result) {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).end();
            }
        });
    }).put(function(req, res) {
        TeamService.updateTeam(req.params.teamId, req.body, function(result) {
            if (!result) {
                res.status(204).end();
            } else {
                res.status(400).json(result);
            }
        });
    }).delete(function(req, res) {
        TeamService.deleteTeam(req.params.teamId, function(result) {
            if (!result) {
                res.status(204).end();
            } else {
                res.status(400).json(result);
            }
        });
    });

// Used by the python server to modify balance when funds are added
router.route("/teams/:teamId/balance")
    .put(function(req, res) {
        TeamService.changeBalance(req.params.teamId, req.body.amount, function(result) {
            if (!result) {
                res.status(204).end();
            } else {
                res.status(400).json(result);
            }
        });
    });

// User API routes
router.route("/teams/:teamId/users")
    .post(function(req, res) {
        UserService.createUser(req.params.teamId, {
                name: req.body.name,
                btcAddress: req.body.btcAddress
            },
            function(result) {
                if (result) {
                    res.status(201).json(result);
                } else {
                    res.status(400).end();
                }
            });
    })
    .get(function(req, res) {
        UserService.getUsers(req.params.teamId, function(result) {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).end();
            }
        });
    });

router.route("/teams/:teamId/users/:userId")
    .get(function(req, res) {
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
                res.status(400).json(result);
            }
        });
    }).delete(function(req, res) {
        UserService.deleteUser(req.params.teamId, req.params.userId, function(result) {
            if (!result) {
                res.status(204).end();
            } else {
                res.status(400).json(result);
            }
        });
    });

router.route("/teams/:teamId/users/:userId/pay")
    .post(function(req, res) {
        var amount = req.body.amount;
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
                            //retrieve users BTC address to perform the payment on 21.co
                            UserService.getUser(teamId, userId, function(user) {
                                // TODO: call 21.co server to do the payment
                                request("http://127.0.0.1:5000/payAddress?address=" + user.btcAddress + "&amount=" + amount, function(error, response, body) {
                                    console.log('error:', error); // Print the error if one occurred
                                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                                    if (response && response.statusCode == 200) {
                                        res.status(200).end();
                                    } else {
                                        // rollback the balance change
                                        TeamService.changeBalance(teamId, amount, function(result) {
                                            res.status(500).end();
                                        });
                                    }
                                });
                            })
                        } else {
                            res.status(400).json(team);
                        }
                    })
                }
            } else {
                res.status(400).result(team);
            }
        });
    });

module.exports = router;
