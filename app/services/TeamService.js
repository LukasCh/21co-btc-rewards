var db;

var TeamService = {
    init: function($db) {
        db = $db;
        db.run("CREATE TABLE IF NOT EXISTS teams (name VARCHAR(50), satoshiBalance BIGINT)");
    },

    createTeam: function($team, $callback) {
        db.serialize(function() {
            db.run("INSERT INTO teams VALUES(?, ?)", {
                1: $team.name,
                2: 0
            }, function(err) {
                db.get("SELECT rowid, name, satoshiBalance FROM teams WHERE rowid = ?", {
                    1: this.lastID
                }, function(err, row) {
                    $callback(row);
                });
            });
        })
    },

    getTeams: function($callback) {
        db.all("SELECT rowid, name, satoshiBalance FROM teams", function(err, rows) {
            $callback(rows);
        });
    },

    getTeam: function($teamId, $callback) {
        db.get("SELECT rowid, name, satoshiBalance FROM teams WHERE rowid = ?", {
            1: $teamId
        }, function(err, row) {
            $callback(row);
        });
    },

    updateTeam: function($teamId, $team, $callback) {
        db.run("UPDATE teams SET name = ? WHERE rowid = ?", {
            1: $team.name,
            2: $teamId
        }, function(err) {
            $callback(err);
        });
    },

    deleteTeam: function($teamId, $callback) {
        db.run("DELETE FROM teams WHERE rowid = ?", {
            1: $teamId
        }, function(err) {
            $callback(err);
        });
    },

    changeBalance: function($teamId, $amount, $callback) {
        db.run("UPDATE teams SET satoshiBalance = satoshiBalance + ? WHERE rowid = ?", {
            1: $amount,
            2: $teamId
        }, function(err) {
            $callback(err);
        });
    }
}

module.exports = TeamService;
