var db;

var UserService = {
    init: function($db) {
        db = $db;
        db.run("CREATE TABLE IF NOT EXISTS users (name VARCHAR(50), paymentAddress VARCHAR(36), teamId INTEGER)");
    },

    dbCreateUser: function($teamId, $user, $callback) {
        db.run("INSERT INTO users VALUES(?, ?, ?)", {
            1: $user.name,
            2: $user.paymentAddress,
            3: $teamId
        }, function(err) {
            db.get("SELECT rowid, name, paymentAddress, teamId FROM users WHERE rowid = ?", {
                1: this.lastID
            }, function(err, row) {
                $callback(row);
            });
        });
    },

    createUser: function($teamId, $user, $callback) {
        if (isNaN($teamId)) {
            db.get("SELECT rowid FROM teams WHERE name = ?", {
                1: $teamId
            }, function(err, row) {
                UserService.dbCreateUser(row.rowid, $user, $callback);
            });
        } else {
            UserService.dbCreateUser($teamId, $user, $callback);
        }
    },

    getUsers: function($teamId, $callback) {
        db.all("SELECT rowid, name, paymentAddress, teamId FROM users WHERE teamId IN (" + (isNaN($teamId)
            ? "(SELECT rowid FROM teams WHERE name = ?)"
            : "?") + ")", {
            1: $teamId
        }, function(err, rows) {
            $callback(rows);
        });
    },

    getUser: function($teamId, $userId, $callback) {
        db.get("SELECT rowid, name, paymentAddress, teamId FROM users WHERE " + (isNaN($userId)
            ? "paymentAddress"
            : "rowid") + " = ? AND teamId IN (" + (isNaN($teamId)
            ? "(SELECT rowid FROM teams WHERE name = ?)"
            : "?") + ")", {
            1: $userId,
            2: $teamId
        }, function(err, row) {
            $callback(row);
        });
    },

    updateUser: function($teamId, $userId, $user, $callback) {
        db.run("UPDATE users SET name = ?, paymentAddress = ? WHERE " + (isNaN($userId)
            ? "paymentAddress"
            : "rowid") + " = ? AND teamId IN (" + (isNaN($teamId)
            ? "(SELECT rowid FROM teams WHERE name = ?)"
            : "?") + ")", {
            1: $user.name,
            2: $user.paymentAddress,
            3: $userId,
            4: $teamId
        }, function(err) {
            $callback(err);
        });
    },

    deleteUser: function($teamId, $userId, $callback) {
        db.run("DELETE FROM users WHERE " + (isNaN($userId)
            ? "paymentAddress"
            : "rowid") + " = ? AND teamId IN (" + (isNaN($teamId)
            ? "(SELECT rowid FROM teams WHERE name = ?)"
            : "?") + ")", {
            1: $userId,
            2: $teamId
        }, function(err) {
            $callback(err);
        });
    }
}

module.exports = UserService;
