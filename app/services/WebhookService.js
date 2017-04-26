var db;

var WebhookService = {
    init: function($db) {
        db = $db;
        db.run("CREATE TABLE IF NOT EXISTS teams (name VARCHAR(50), satoshiBalance BIGINT)");
    },

    getIssueDetais: function() {
      console.log("I got a message from JIRA!!!");
    }

}

module.exports = WebhookService;
