jQuery(function($) {

    var projectKey = getUrlParameter("projectKey");

    AJS.$('#enable-reward').on('click', function() {
        enableReward();
    });

    AJS.$('#disable-reward').on('click', function() {
        disableReward();
    });

    function enableReward() {
      AP.require('request', function(request) {
          request({
              url: '/rest/api/2/project/' + projectKey + '/properties/bitcoin-reward-enabled',
              type: 'PUT',
              contentType: 'application/json',
              data: '{"id": "' + AJS.$('#input').val() + '"}',
              success: function(data) {
                  console.log("property is set", data);

              },
              error: function(jqXHR, textStatus, errorThrown) {
                  console.error('cant set property' + errorThrown);
              }
          });
      });
    };

    function disableReward() {
      AP.require('request', function(request) {
          request({
              url: '/rest/api/2/project/' + projectKey + '/properties/bitcoin-reward-enabled',
              type: 'DELETE',
              success: function(data) {
                  console.log("property is deleted", data);

              },
              error: function(jqXHR, textStatus, errorThrown) {
                  console.error('cant delete property' + errorThrown);
              }
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
