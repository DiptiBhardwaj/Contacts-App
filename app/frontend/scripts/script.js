var myApp = angular.module('myApp', ['ngRoute'])

//ng-route config
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'default.html',
            })
            .when('/home', {
                templateUrl: 'default.html',
            })
            .when('/contact-info/:contact_index', {
                templateUrl: 'frontend/templates/contact_info.html',
                controller: 'contactInfoCtrl'
            })
            .when('/messages', {
                templateUrl: 'frontend/templates/messages_data.html'
            })
            .when('/compose/:contact_index', {
                templateUrl: 'frontend/templates/message_screen.html',
                controller: 'composeCtrl'
            })
            .otherwise({redirectTo: '/home'});
    })

    // controllers
    .controller('tabViewCtrl', function ($scope, $routeParams, $location) {
        $scope.$on('$routeChangeStart', function ($event, next, current) {
            if (next && next.$$route && next.$$route.originalPath == "/messages") {
                $scope.showMessageTab = true;
            }
            else {
                $scope.showMessageTab = false;
            }
        });

        if ($location.url() == "/messages") {
            $scope.showMessageTab = true;
        }
        else {
            $scope.showMessageTab = false;
        }
    })

    .controller('navCtrl', function ($scope,$location) {
        $scope.nav = {
            navItems: ['home', 'messages'],
            selectedIndex: 0,
            navClick: function ($index) {
                $scope.nav.selectedIndex = $index;
            }
        };
        if ($location.url() == "/messages") {
            $scope.nav.selectedIndex = $scope.nav.navItems.indexOf("messages");
        }
        else {
            $scope.nav.selectedIndex = 0;        }
    })

    .controller('homeCtrl', function ($scope, ContactService) {
        ContactService.getContacts().then(function (contacts) {
                // console.log('contacts returned to controller.');
                $scope.contacts = contacts;
            },
            function () {
                console.log('contacts retrieval failed.')
            });
    })

    .controller('contactInfoCtrl', function ($scope, $routeParams) {
        var index = $routeParams.contact_index;
        $scope.currentContact = $scope.contacts[index];
    })

    .controller('composeCtrl', function ($scope, $routeParams) {
        $scope.otp_message = "Hi. Your OTP is: " + Math.floor(100000 + Math.random() * 900000) + "";
        var index = $routeParams.contact_index;
        $scope.currentContact = $scope.contacts[index];

        $scope.send_sms = function (otp_message) {
            var data = {
                otp_message: otp_message,
                currentContact: $scope.currentContact
            }
            var saveData = $.ajax({
                type: 'POST',
                url: "/form/submit",
                data: data,
                dataType: "text",
                success: function (response) {
                    // console.log('otp send successfully.', response);
                    $scope.$apply(function () {
                        $scope.sms_send = {success: 'OPT has been sent successfully.'};
                    })
                },
                error: function (err) {
                    // console.log('Err in otp send.', err);
                    $scope.$apply(function () {
                        $scope.sms_send = {error: 'Error occurred while sending OTP::' + err.responseText};
                    })

                }
            });
        }
    })

    .controller('messagesDataCtrl', function ($scope, ContactService, MessagesHistory) {
        ContactService.getContacts().then(function (contacts) {
                // console.log('contacts returned to controller.');
                $scope.allcontacts = contacts;
                MessagesHistory.getMessagesHistory().then(function (messagesList) {
                        // console.log('messagesList returned to controller.', messagesList);
                        $scope.messagesList = messagesList;
                        var contactslen = contacts.length;
                        var len = messagesList.length;
                        for (var i = 0; i < len; i++) {
                            for (var j = 0; j < contactslen; j++) {
                                if ($scope.messagesList[i].to == $scope.allcontacts[j].phone) {
                                    $scope.messagesList[i]['user_name'] = $scope.allcontacts[j].name
                                }
                            }
                        }
                    },
                    function () {
                        console.log('messages history retrieval failed.')
                    });
            },
            function () {
                console.log('contacts retrieval failed.')
            });
    })

    // directives
    .directive('contact', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'frontend/templates/contact.html'
        }
    })

    // services
    .factory('ContactService', ['$http', '$q', function ($http, $q) {
        var factory = {};
        factory.getContacts = function () {
            var def = $q.defer();
            $http.get('resource/contact_list.json', {cache: true}).then(function (response) {
                this.contactList = response.data
                def.resolve(response.data);
            }, function (error) {
                // console.log("Error Occ::", error)
                def.reject("Failed to get contacts list");
            });
            // return contactList;
            return def.promise;
        }
        return factory;
    }])

    .factory('MessagesHistory', ['$http', '$q', function ($http, $q) {
        var service = {};
        service.getMessagesHistory = function () {
            var def = $q.defer();
            $http.get('getMessages', {cache: true}).then(function (response) {
                this.messagesList = response.data
                def.resolve(response.data);
            }, function (error) {
                // console.log("Error Occ::", error)
                def.reject("Failed to get messages history");
            });
            return def.promise;
        }
        return service;
    }]);






