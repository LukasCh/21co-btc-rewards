jQuery(function($) {
    AJS.toInit(function() {
        AP.require('dialog', function(dialog) {

            var issueKey = dialog.customData;

            dialog.getButton('submit').bind(function() {
                AP.require('request', function(request) {
                    request({
                        url: '/rest/api/2/issue/' + issueKey + '/properties/bitcoin-reward',
                        type: 'PUT',
                        contentType: 'application/json',
                        data: AJS.$('#input').val(),
                        success: function(data) {
                            console.log(data);
                            AP.require('jira', function(jira) {
                                jira.refreshIssuePage();
                            });
                            dialog.close();

                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.error('cant set property' + errorThrown);
                        }
                    });
                });
            });


        });
    });
});
