(function () {

    var config = {
        "session": {
            "serverUrl": "/",
            "authorizedState": "app.users",
            "unautorizedState": "landing"
        }
    };

    angular
        .module('iqsConfig', ['pipCommonRest', 'pipErrors', 'pipErrors.Unauthorized'])
        .constant('SHELL_RUNTIME_CONFIG', config);
})();
