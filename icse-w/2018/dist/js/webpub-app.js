'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub:data', []).provider('DataService', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get() {
                return {
                    webpub: webpub //externalized webpub variable
                };
            }
        }]);

        return _class;
    }());
    angular.module('webpub:config', []).provider('ConfigService', function () {
        function _class2() {
            _classCallCheck(this, _class2);
        } // externalized config variable


        _createClass(_class2, [{
            key: '$get',
            value: function $get() {
                return config;
            }
        }]);

        return _class2;
    }());
    angular.module('webpub:additional-pages', []).provider('AdditionalPagesService', function () {
        function _class3() {
            _classCallCheck(this, _class3);
        } // externalized config variable


        _createClass(_class3, [{
            key: '$get',
            value: function $get() {
                return additionalPages;
            }
        }]);

        return _class3;
    }());

    angular.module('webpub', [
    // Start: Misc. Dependencies
    'ngRoute', 'ngAnimate', 'ui.router', 'ui.tree', 'ui.bootstrap', 'ui.select', 'angular.filter', 'dibari.angular-ellipsis', 'growlNotifications', 'webpub:data', 'webpub:config', 'webpub:additional-pages']).config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'DataServiceProvider', function ($stateProvider, $locationProvider, $urlRouterProvider, DataServiceProvider, AdditionalPagesServiceProvider) {
        $locationProvider.html5Mode(false);

        $urlRouterProvider.otherwise('/');

        var webpubData = DataServiceProvider.$get().webpub.data;

        $stateProvider.state('empty', {
            url: '',
            controller: function controller($state) {
                return $state.go('home');
            }
        }).state('index', {
            url: '/',
            controller: function controller($state) {
                return $state.go('home');
            }
        }).state('home', {
            url: '/home',
            templateProvider: function templateProvider(TemplateService) {
                return TemplateService.getIframeTemplate();
            },
            controller: 'extraPageController',
            controllerAs: '$ctrl',
            resolve: {
                pageName: function pageName($stateParams) {
                    return 'home';
                },
                location: function location($stateParams) {
                    return 'content/start.html';
                },
                pages: function pages() {
                    return [];
                }
            }
        }).state('toc', {
            url: '/toc/:index',
            templateProvider: function templateProvider(TemplateService) {
                return TemplateService.getToc();
            },
            controller: 'tocController',
            controllerAs: '$ctrl',
            resolve: {
                conference: function conference($stateParams) {
                    return webpubData.conferences[$stateParams.index];
                }
            }
        }).state('author-index', {
            url: '/author-index',
            templateProvider: function templateProvider(TemplateService) {
                return TemplateService.getAuthorIndex();
            },
            controller: 'authorIndexController',
            controllerAs: '$ctrl',
            resolve: {
                authors: function authors() {
                    return webpubData.authors;
                }
            }
        }).state('affiliation-index', {
            url: '/affiliation-index',
            templateProvider: function templateProvider(TemplateService) {
                return TemplateService.getAffiliationIndex();
            },
            controller: 'affiliationIndexController',
            controllerAs: '$ctrl',
            resolve: {
                affiliations: function affiliations() {
                    return webpubData.affiliations;
                }
            }
        }).state('search', {
            url: '/search',
            templateProvider: function templateProvider(TemplateService) {
                return TemplateService.getSearch();
            },
            controller: 'searchController',
            controllerAs: '$ctrl',
            resolve: {
                conferences: function conferences() {
                    return webpubData.conferences;
                }
            }
        }).state('extra-page', {
            params: {
                pageName: null,
                location: null
            },
            url: '/pages/:pageName',
            templateProvider: function templateProvider(TemplateService) {
                return TemplateService.getIframeTemplate();
            },
            controller: 'extraPageController',
            controllerAs: '$ctrl',
            resolve: {
                pageName: function pageName($stateParams) {
                    return $stateParams.pageName;
                },
                location: function location($stateParams) {
                    return $stateParams.location;
                },
                pages: function pages() {
                    return AdditionalPagesServiceProvider;
                }
            }
        });
    }]).run(function ($rootScope) {
        $rootScope.$on("$stateChangeError", console.log.bind(console));
    });
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  'use strict';

  angular.module('webpub').controller('affiliationIndexController', function () {
    function affiliationIndexController(affiliations, FileService, $anchorScroll, $location) {
      _classCallCheck(this, affiliationIndexController);

      this.affiliations = affiliations;
      this.FileService = FileService;
      this.$anchorScroll = $anchorScroll;
      this.$location = $location;
    }

    _createClass(affiliationIndexController, [{
      key: '$onInit',
      value: function $onInit() {
        var _this = this;

        this.alphabet = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var startIdx = 0;
        this.affiliationMap = this.alphabet.reduce(function (affiliationMap, letter) {
          if (startIdx < 0) {
            return affiliationMap;
          }
          var cutOff = _this.affiliations.findIndex(function (a, idx) {
            return idx >= startIdx && !affiliationIndexController.affiliationStartsWithLetter(a.affiliation, letter);
          });
          if (cutOff < 0) {
            affiliationMap[letter] = _this.affiliations.slice(startIdx);
            startIdx = cutOff;
          } else {
            //console.log(letter, startIdx, cutOff, this.affiliations.slice(startIdx, cutOff));
            affiliationMap[letter] = _this.affiliations.slice(startIdx, cutOff);
            startIdx = cutOff;
          }
          return affiliationMap;
        }, {});
        //console.log('affiliationMap: ', this.affiliationMap);
      }
    }, {
      key: 'openPdf',
      value: function openPdf(location) {
        this.FileService.openPdf(location);
      }
    }, {
      key: 'scrollToAnchor',
      value: function scrollToAnchor(letter) {
        this.$location.hash(letter);
        this.$anchorScroll();
      }
    }], [{
      key: 'affiliationStartsWithLetter',
      value: function affiliationStartsWithLetter(affiliation, letter) {
        if (letter === '#') {
          return affiliation.slice(0, 1).localeCompare('A', 'en', {
            usage: 'search',
            sensitivity: 'base',
            ignorePunctuation: true
          }) !== 0;
        } else {
          return affiliation.slice(0, 1).localeCompare(letter, 'en', {
            usage: 'search',
            sensitivity: 'base',
            ignorePunctuation: true
          }) === 0;
        }
      }
    }]);

    return affiliationIndexController;
  }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').controller('authorIndexController', function () {
        function authorIndexController(authors, FileService, $anchorScroll, $location) {
            _classCallCheck(this, authorIndexController);

            this.authors = authors;
            this.FileService = FileService;
            this.$anchorScroll = $anchorScroll;
            this.$location = $location;
        }

        _createClass(authorIndexController, [{
            key: '$onInit',
            value: function $onInit() {
                var _this = this;

                this.alphabet = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
                var startIdx = 0;
                this.authorMap = this.alphabet.reduce(function (authorMap, letter) {
                    if (startIdx < 0) {
                        return authorMap;
                    }
                    var cutOff = _this.authors.findIndex(function (a, idx) {
                        return idx >= startIdx && !authorIndexController.authorNameStartsWithLetter(a.authorName, letter);
                    });
                    if (cutOff < 0) {
                        authorMap[letter] = _this.authors.slice(startIdx);
                        startIdx = cutOff;
                    } else {
                        //console.log(letter, startIdx, cutOff, this.authors.slice(startIdx, cutOff));
                        authorMap[letter] = _this.authors.slice(startIdx, cutOff);
                        startIdx = cutOff;
                    }
                    return authorMap;
                }, {});
                this.authorMap['A'] = this.authorMap['#'].concat(this.authorMap['A']);
                delete this.authorMap['#'];
                this.alphabet = this.alphabet.slice(1);
                //console.log('authorMap: ', this.authorMap);
            }
        }, {
            key: 'openPdf',
            value: function openPdf(location) {
                this.FileService.openPdf(location);
            }
        }, {
            key: 'scrollToAnchor',
            value: function scrollToAnchor(letter) {
                this.$location.hash(letter);
                this.$anchorScroll();
            }
        }], [{
            key: 'authorNameStartsWithLetter',
            value: function authorNameStartsWithLetter(name, letter) {
                if (letter === '#') {
                    return name.slice(0, 1).localeCompare('A', 'en', {
                        usage: 'search',
                        sensitivity: 'base',
                        ignorePunctuation: true
                    }) !== 0;
                } else {
                    return name.slice(0, 1).localeCompare(letter, 'en', {
                        usage: 'search',
                        sensitivity: 'base',
                        ignorePunctuation: true
                    }) === 0;
                }
            }
        }]);

        return authorIndexController;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').controller('extraPageController', function () {
        function extraPageController(pages, pageName, location) {
            _classCallCheck(this, extraPageController);

            this.pages = pages;
            this.pageName = pageName;
            this.location = location;
        }

        _createClass(extraPageController, [{
            key: '$onInit',
            value: function $onInit() {
                console.log('pageName: ', this.pageName);
                console.log('location: ', this.location);
                console.log('pages: ', this.pages);
            }
        }]);

        return extraPageController;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').controller('navController', function () {
        function navController(DataService, ConfigService, AdditionalPagesService) {
            _classCallCheck(this, navController);

            this.DataService = DataService;
            this.config = ConfigService;
            this.additionalPages = AdditionalPagesService;
        }

        _createClass(navController, [{
            key: '$onInit',
            value: function $onInit() {
                this.conferences = this.DataService.webpub.data.conferences;
            }
        }]);

        return navController;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').controller('searchController', function () {
        function searchController(conferences, FileService) {
            _classCallCheck(this, searchController);

            this.conferences = conferences;
            this.FileService = FileService;
        }

        _createClass(searchController, [{
            key: '$onInit',
            value: function $onInit() {
                this.searchMap = this.conferences.reduce(function (searchMap, conference) {
                    conference.sections.forEach(function (section) {
                        section.lineItems.forEach(function (entry) {
                            entry.searchText.toLowerCase().split(' ').forEach(function (token) {
                                var entryList = searchMap[token] || [];
                                entryList.push(entry);
                                searchMap[token] = entryList;
                            });
                        });
                    });
                    return searchMap;
                }, {});

                this.idMap = this.conferences.reduce(function (idMap, conference) {
                    conference.sections.forEach(function (section) {
                        section.lineItems.forEach(function (entry) {
                            idMap[entry.id] = entry;
                        });
                    });
                    return idMap;
                }, {});
            }
        }, {
            key: 'openPdf',
            value: function openPdf(item) {
                this.FileService.openPdf(item.articleLocation);
            }
        }, {
            key: 'getAbstract',
            value: function getAbstract(entry) {
                return entry.abstract || 'No abstract provided';
            }
        }, {
            key: 'searchInput',
            value: function searchInput() {
                var _this = this;

                if (this.searchTerm.length < 3) return;

                var hitMap = this.searchTerm.split(' ').filter(function (token) {
                    return token;
                }).reduce(function (hitMap, token) {
                    if (!_this.searchMap[token.toLowerCase()]) return hitMap;

                    _this.searchMap[token.toLowerCase()].forEach(function (entry) {
                        var hits = hitMap[entry.id] || 0;
                        hits += 1;
                        hitMap[entry.id] = hits;
                    });

                    return hitMap;
                }, {});

                this.searchResults = Object.keys(hitMap).map(function (id) {
                    return {
                        entry: _this.idMap[id],
                        hits: hitMap[id]
                    };
                }).sort(function (a, b) {
                    return b.hits - a.hits;
                }).map(function (result) {
                    return result.entry;
                });

                console.log('results: ', this.searchResults);
            }
        }]);

        return searchController;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').controller('tocController', function () {
        function tocController(conference, FileService, $scope, $location, $anchorScroll) {
            _classCallCheck(this, tocController);

            this.conference = conference;
            this.FileService = FileService;
            this.$scope = $scope;
            this.$location = $location;
            this.$anchorScroll = $anchorScroll;
        }

        _createClass(tocController, [{
            key: '$onInit',
            value: function $onInit() {
                var _this = this;

                this.conference.backMatter = this.conference.backMatter.filter(function (entry) {
                    return entry.type !== 'BM_ROSTER';
                });
                this.anchors = [{ name: "Jump to Section...", value: 'jump' }, { name: '\u2022 Front Matter', value: "FrontMatter" }].concat(this.conference.sections.map(function (s) {
                    var indent = s.type === 'SD_TRACK' ? '' : s.type === 'SD_SESSION' ? '\xA0\xA0\xA0' : '\xA0\xA0\xA0\xA0\xA0\xA0';
                    console.log(s);
                    return { name: indent + '\u2022\xA0' + s.title, value: _this.getTitleId(s.title) };
                })).concat([{ name: '\u2022 Back Matter', value: "BackMatter" }]);
                this.selectedAnchor = 'jump';

                this.$scope.$watch(function () {
                    return _this.selectedAnchor;
                }, function () {
                    if (_this.selectedAnchor !== 'jump') {
                        _this.$location.hash(_this.selectedAnchor);
                        _this.$anchorScroll();
                    }
                });
            }
        }, {
            key: 'openPdf',
            value: function openPdf(item) {
                this.FileService.openPdf(item.articleLocation);
            }
        }, {
            key: 'openExtra',
            value: function openExtra(extra) {
                this.FileService.openExtra(extra.location);
            }
        }, {
            key: 'getTitleId',
            value: function getTitleId(title) {
                return title.replace(/ /g, '');
            }
        }, {
            key: 'getSectionClass',
            value: function getSectionClass(section) {
                if (section.class === 'SD') if (section.type === 'SD_SESSION') {
                    return 'h4';
                } else if (section.type === 'SD_SUBSESSION') {
                    return 'h5';
                } else if (section.type === 'SD_TRACK') {
                    return 'h3';
                }
            }
        }, {
            key: 'chairName',
            value: function chairName(section) {
                return section.chair && section.chair.title && section.chair.name ? section.chair.title + ': ' + section.chair.name : '';
            }
        }]);

        return tocController;
    }());
})();
'use strict';

(function () {
    'use strict';

    angular.module('webpub').filter('entryPageNumberFilter', function () {
        return function (entry) {
            if (!entry) return entry;
            if (!entry.pageNumber) return entry.pageNumber;
            if (entry.isPageNumberRoman) {
                return toRoman(entry.pageNumber);
            } else {
                return entry.pageNumber;
            }
        };
    });

    function toRoman(num) {
        var result = '';
        var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        var roman = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"];
        for (var i = 0; i <= decimal.length; i++) {
            while (num % decimal[i] < num) {
                result += roman[i];
                num -= decimal[i];
            }
        }
        return result;
    }
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('FileService', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get($window, NotificationService) {
                var openFile = function openFile(type, location) {
                    if (!location) {
                        NotificationService.send('danger', type + ' file not found for article');
                        return;
                    }
                    $window.open(location);
                };

                var openPdf = function openPdf(location) {
                    return openFile('PDF', location);
                };
                var openExtra = function openExtra(location) {
                    return openFile('Extra', location);
                };

                return {
                    openPdf: openPdf,
                    openExtra: openExtra
                };
            }
        }]);

        return _class;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('NotificationService', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get() {
                var notifications = [];
                var send = function send(type, message) {
                    notifications.push({
                        type: type,
                        message: message
                    });
                };
                return {
                    notifications: notifications,
                    send: send
                };
            }
        }]);

        return _class;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('TemplateService', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get(helloTemplate, tocTemplate, authorIndexTemplate, iframeTemplate, searchTemplate, affiliationIndexTemplate) {
                return {
                    getHello: function getHello() {
                        return helloTemplate.content();
                    },
                    getToc: function getToc() {
                        return tocTemplate.content();
                    },
                    getAuthorIndex: function getAuthorIndex() {
                        return authorIndexTemplate.content();
                    },
                    getAffiliationIndex: function getAffiliationIndex() {
                        return affiliationIndexTemplate.content();
                    },
                    getIframeTemplate: function getIframeTemplate() {
                        return iframeTemplate.content();
                    },
                    getSearch: function getSearch() {
                        return searchTemplate.content();
                    }
                };
            }
        }]);

        return _class;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').component('webpubNotifications', {
        bindings: {},
        controller: function () {
            function controller(NotificationService) {
                _classCallCheck(this, controller);

                this.NotificationService = NotificationService;
            }

            _createClass(controller, [{
                key: '$onInit',
                value: function $onInit() {
                    this.notifications = this.NotificationService.notifications;
                }
            }]);

            return controller;
        }(),
        template: '<!-- Hide the notifications module until the application loads. -->\n                <div data-ng-cloak>\n                    <div class="notifications"\n                         data-growl-notifications\n                         data-ng-if="$ctrl.notifications">\n                \n                        <!-- (notifications) Notifications list -->\n                        <div data-ng-repeat="notification in $ctrl.notifications">\n                            <div class="notification fading"\n                                 data-growl-notification\n                                 data-ng-class="notification.type">{{ notification.message }}</div>\n                        </div>                \n                    </div>\n                </div>\n                '
    });
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('affiliationIndexTemplate', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get() {
                var content = function content() {
                    return '<div class="row">\n    <div class="col-md-12">\n        <div class="btn-toolbar pt" role="toolbar">\n            <div class="btn-group">\n                <button class="btn btn-default" data-ng-repeat="letter in $ctrl.alphabet" data-ng-click="$ctrl.scrollToAnchor(letter)">{{letter}}</button>\n            </div>\n        </div>\n    </div>    \n</div>\n<div class="row">\n    <div class="col-md-12">\n        <h1>Affiliation Index</h1>\n        <div data-ng-repeat="letter in $ctrl.alphabet">\n            <h3 id="{{letter}}">{{letter}}</h3>\n            <div data-ng-repeat="aff in $ctrl.affiliationMap[letter]">\n                <p style="margin-bottom: 0">{{aff.affiliation}}</p>\n                <div data-ng-repeat="article in aff.articleRefs"\n                     style="margin-bottom: 5px">\n                    <a data-ng-click="$ctrl.openPdf(article.articleLocation)">{{article.articleName}}</a>\n                </div>\n            </div>\n        </div>        \n    </div>\n</div>\n\n';
                };

                return {
                    content: content
                };
            }
        }]);

        return _class;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('authorIndexTemplate', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get() {
                var content = function content() {
                    return '<div class="row">\n    <div class="col-md-12">\n        <div class="btn-toolbar pt" role="toolbar">\n            <div class="btn-group">\n                <button class="btn btn-default" data-ng-repeat="letter in $ctrl.alphabet" data-ng-click="$ctrl.scrollToAnchor(letter)">{{letter}}</button>\n            </div>\n        </div>\n    </div>    \n</div>\n<div class="row">\n    <div class="col-md-12">\n        <h1>Author Index</h1>\n        <div data-ng-repeat="letter in $ctrl.alphabet">\n            <h3 id="{{letter}}">{{letter}}</h3>\n            <div data-ng-repeat="author in $ctrl.authorMap[letter]">\n                <p style="margin-bottom: 0">{{author.authorName}}</p>\n                <div data-ng-repeat="article in author.articleRefs"\n                     style="margin-bottom: 5px">\n                    <a data-ng-click="$ctrl.openPdf(article.articleLocation)">{{article.articleName}}</a>\n                </div>\n            </div>\n        </div>        \n    </div>\n</div>\n\n';
                };

                return {
                    content: content
                };
            }
        }]);

        return _class;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('helloTemplate', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get() {
                var content = function content() {
                    return '\n                        <div>{{$ctrl.hello()}}</div>\n                    ';
                };

                return {
                    content: content
                };
            }
        }]);

        return _class;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('iframeTemplate', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get() {
                var content = function content() {
                    return '<div class="row">\n    <div class="col-md-12">\n        <div class="embed-responsive embed-responsive-16by9">\n            <iframe class="embed-responsive-item" data-ng-src="{{$ctrl.location}}"></iframe>\n        </div>        \n    </div>\n</div>';
                };

                return {
                    content: content
                };
            }
        }]);

        return _class;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('searchTemplate', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get() {
                var content = function content() {
                    return '<div class="row mt-lg">\n    <div class="col-md-12">\n        <div class="input-group custom-search-form">\n            <input type="text" class="form-control" data-ng-change="$ctrl.searchInput()" data-ng-model="$ctrl.searchTerm" placeholder="Search...">\n            <span class="input-group-btn">\n                <button class="btn btn-default" type="button">\n                    <i class="fa fa-search"></i>\n                </button>\n            </span>\n        </div>\n        <hr>\n        <h3 data-ng-if="$ctrl.searchResults && $ctrl.searchResults.length">Results:</h3>\n        <div data-ng-repeat="result in $ctrl.searchResults">\n            <a class="text-bold" ng-click="$ctrl.openPdf(result)">{{result.text}}</a>\n            <p class="pl-lg"><em>{{result.authorNames}}</em></p>\n            <p class="pl-lg search-result" data-ng-bind="$ctrl.getAbstract(result)" data-ellipsis></p>\n        </div>\n    </div>\n</div>';
                };

                return {
                    content: content
                };
            }
        }]);

        return _class;
    }());
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('webpub').provider('tocTemplate', function () {
        function _class() {
            _classCallCheck(this, _class);
        }

        _createClass(_class, [{
            key: '$get',
            value: function $get() {
                var content = function content() {
                    return '<div class="row">\n    <div class="col-md-12">\n        <div class="row">\n            <div class="col-xs-8">\n                <h1 class="text-bold">{{$ctrl.conference.acronym}} {{$ctrl.conference.year}}</h1>\n            </div>\n            <div class="col-xs-4">\n                <select class="form-control mt-xl"\n                    data-ng-model="$ctrl.selectedAnchor"\n                    data-ng-options="anchor.value as anchor.name for anchor in $ctrl.anchors">                    \n                </select>\n            </div>\n        </div>        \n        <h2>{{$ctrl.conference.title}}</h2>\n        <h3>Table of Contents</h3>\n        <h3 class="text-bold" id="FrontMatter">Front Matter<span class="pull-right text-normal">Page Number</span></h3>\n        <div data-ng-repeat="fm in $ctrl.conference.frontMatter">\n            <a class="text-bold" ng-click="$ctrl.openPdf(fm)">{{fm.text}}<span class="pull-right">{{fm | entryPageNumberFilter}}</span></a>\n            <div data-ng-repeat="extra in fm.extraLocations" class="pb">\n                <a class="pl-lg" data-ng-click="$ctrl.openExtra(extra)">{{extra.name}}</a>\n            </div>\n        </div>\n        <div data-ng-repeat="section in $ctrl.conference.sections">\n            <hr>\n            <h3 class="text-bold" data-ng-class="$ctrl.getSectionClass(section)" id="{{$ctrl.getTitleId(section.title)}}">{{section.title}}</h3>\n            <p class="text-bold">{{$ctrl.chairName(section)}}</p>\n            <div data-ng-repeat="item in section.lineItems">\n                <a class="text-bold" ng-click="$ctrl.openPdf(item)">{{item.text}}<span class="pull-right">{{item | entryPageNumberFilter}}</span></a>\n                <p class="pl-lg"><em>{{item.authorNames}}</em></p>\n                <div data-ng-repeat="extra in item.extraLocations" class="pb">\n                    <a class="pl-lg" data-ng-click="$ctrl.openExtra(extra)">{{extra.name}}</a>                    \n                </div>\n                \n            </div>\n        </div>\n        <hr>\n        <h3 class="text-bold" id="BackMatter"></h3>\n        <div data-ng-repeat="bm in $ctrl.conference.backMatter">\n            <a class="text-bold" ng-click="$ctrl.openPdf(bm)">{{bm.text}}<span class="pull-right">{{bm | entryPageNumberFilter}}</span></a>\n            <div data-ng-repeat="extra in bm.extraLocations" class="pb">\n                <a class="pl-lg" data-ng-click="$ctrl.openExtra(extra)">{{extra.name}}</a>\n            </div>\n        </div>\n    </div>\n</div>\n';
                };

                return {
                    content: content
                };
            }
        }]);

        return _class;
    }());
})();