jQuery(function($) {

    var userKey = getUrlParameter("userKey");

    AJS.toInit(function() {
        AP.require('dialog', function(dialog) {


          AP.require('request', function(request) {
              request({
                  url: '/rest/api/2/user/properties/21coaccount' + '?userKey=' + userKey,
                  type: 'GET',
                  contentType: 'application/json',
                  success: function(data) {
                      response = JSON.parse(data);
                      console.log(response);
                      AJS.$('#input').val(response.value.id);
                      //AJS.$('#reward-text').text("task reward: " + response.value + " satoshi");
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                      //AJS.$('#reward-text').text("task reward: not set");

                      AJS.$('#input').val("id not found");
                      console.log('cant get property' + errorThrown);
                  }
              });
          });

            dialog.getButton('submit').bind(function() {
                /*AP.require('request', function(request) {
                    request({
                        url: '/rest/atlassian-connect/latest/addons/' + 'org.hotovo.bitcoin-reward' + '/properties/teamname',
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
                });*/

                AP.require('request', function(request) {
                    request({
                        url: '/rest/api/2/user/properties/21coaccount' + '?userKey=' + userKey,
                        type: 'PUT',
                        contentType: 'application/json',
                        data: '{"id": "' + AJS.$('#input').val() + '"}',
                        success: function(data) {
                            console.log(data);
                            AJS.$.post( "https://3e6e2145.ngrok.io/api/teams/hotovo/users", { name: userKey, paymentAddress: AJS.$('#input').val() } );
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
