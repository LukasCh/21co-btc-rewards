var db;

var UserService = {
    init: function($db) {
        db = $db;
        db.run("CREATE TABLE IF NOT EXISTS users (name VARCHAR(50), btcAddress VARCHAR(36), teamId INTEGER)");
    },

    createUser: function($teamId, $user, $callback) {
        db.serialize(function() {
            db.run("INSERT INTO users VALUES(?, ?, ?)", {
                1: $user.name,
                2: $user.btcAddress,
                3: $teamId
            }, function(err) {
                db.get("SELECT rowid, name, btcAddress, teamId FROM users WHERE rowid = ?", {
                    1: this.lastID
                }, function(err, row) {
                    $callback(row);
                });
            });
        })
    },

    getUsers: function($teamId, $callback) {
        db.all("SELECT rowid, name, btcAddress, teamId FROM users WHERE teamId = ?", {
            1: $teamId
        }, function(err, rows) {
            $callback(rows);
        });
    },

    getUser: function($teamId, $userId, $callback) {
        db.get("SELECT rowid, name, btcAddress, teamId FROM users WHERE rowid = ? AND teamId = ?", {
            1: $userId,
            2: $teamId
        }, function(err, row) {
            $callback(row);
        });
    },

    updateUser: function($teamId, $userId, $user, $callback) {
        db.run("UPDATE users SET name = ?, btcAddress = ?, teamId = ? WHERE rowid = ? AND teamId = ?", {
            1: $user.name,
            2: $user.btcAddress,
            3: $user.teamId,
            4: $userId,
            5: $teamId
        }, function(err) {
            $callback(err);
        });
    },

    deleteUser: function($teamId, $userId, $callback) {
        db.run("DELETE FROM users WHERE rowid = ? AND teamId = ?", {
            1: $userId,
            2: teamId
        }, function(err) {
            $callback(err);
        });
    }
}

module.exports = UserService;
