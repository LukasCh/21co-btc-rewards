jQuery(function($) {
    var issueKey = getUrlParameter("issueKey");

    AP.require('request', function(request) {
        request({
            url: '/rest/api/2/issue/' + issueKey + '/properties/bitcoin-reward',
            type: 'GET',
            contentType: 'application/json',
            success: function(data) {
                response = JSON.parse(data);
                console.log(response);
                AJS.$('#reward-text').text("task reward: " + response.value + " satoshi");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                AJS.$('#reward-text').text("task reward: not set");
                console.log('cant get property' + errorThrown);
            }
        });
    });

    AJS.$('#change-reward').on('click', function() {
        createDialog();
    });

    function createDialog() {
        AP.require('dialog', function(dialog) {
            dialog.create({
                key: 'pricedialog',
                customData: issueKey
            });

        });
    };

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

});
