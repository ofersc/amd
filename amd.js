window.lpTag = window.lpTag || {};
window.lpTag.amd = (function() {

    // initialization

    var config = window.config || {};

    var queryParams = _getQueryParams();

    var Type = {
        JS: 0,
        TEXT: 1,
        JSON: 2,
        I18N: 3,
        CSS: 4
    };

    var root = '../';

    var moduleRegex = /(.*)!(.*)/;

    config.debug = config.debug || queryParams.debug || false;
    config.timeout = config.timeout || (5 * 60 * 60); // 5 seconds

    config.paths = config.paths || {};

    /** execution **/

    var moduleLookupInterval = 5;
    var head = document.getElementsByTagName('head')[0];
    var loadingModules = {};
    var registeredModules = {};

    _loadMain();

    // private functions

    function _getQueryParams(param) {
        var params = {};
        var queryString = window.location.href.split('?')[1];
        if (typeof queryString !== 'undefined') {
            var pairs = queryString.split('&');
            var pair;
            for (var p=0; p<pairs.length; p++) {
                pair = pairs[p].split('=');
                params[pair[0]] = pair[1];
            }
        }
        return params;
    }

    function _loadMain() {
        var mainScript = document.querySelector('[data-main]');
        if (mainScript) {
            mainScript = mainScript.getAttribute('data-main');
            _loadModule(mainScript, Type.JS, {executeOnLoad: true});
        }
    };

    function _getModuleData(path) {

        var data = {
            path: path.replace(moduleRegex, '$2')
        };

        var type = path.indexOf('!') > 0 ? path.replace(moduleRegex, '$1') : '';

        switch(type) {
            case 'text':
                data.type = Type.TEXT;
                break;
            case 'json':
                data.type = Type.JSON;
                break;
            case 'i18n':
                data.type = Type.I18N;
                break;
            case 'css':
                data.type = Type.CSS;
                break;
            default:
                data.type = Type.JS;
                break;
        }

        return data;

    };

    function _loadModule(path, type, options) {
        options = options || {};
        path = _getEffectivePath(path);
        if ( !_isModuleAvailable(path) && typeof loadingModules[path] === 'undefined') {
            var xhr = new XMLHttpRequest();
            var getPath;
            if (type === Type.I18N) {
                getPath = 'i18n' + '/' + window.navigator.languages[0] + '/' + path + '.js';
            } else {
                getPath = path + (type === Type.JS ? '.js' : '');
            }

            loadingModules[path] = true;

            if (type === Type.JS && config.debug) {
                _addScriptTag(_getRoot() + path);
            } else {
                xhr.open('GET', _getRoot() + getPath);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (type === Type.JS) {
                            registeredModules[path] = new Function(xhr.responseText).call(null);
                        } else {
                            registeredModules[path] = xhr.responseText;
                        }
                        loadingModules[path] = false;
                    }
                };
                xhr.send(null);
            }
        }
    };

    function _loadModules(modulesData) {
        for (var moduleIndex=0; moduleIndex<modulesData.length; moduleIndex++) {
            _loadModule(modulesData[moduleIndex].path, modulesData[moduleIndex].type);
        }
    }

    function _getModulesData(paths) {
        return paths.map(_getModuleData);
    }

    function _isModuleAvailable(moduleId) {
        return typeof registeredModules[moduleId] !== 'undefined';
    }

    function _checkModulesAvailability(modulesIds) {
        return modulesIds.reduce(function(prevValue,currValue) {
            return prevValue && _isModuleAvailable(currValue);
        }, true);
    }

    function _getRoot() {
        return root ? root : '';
    }

    function _evaluateModule(module,type) {
        switch (type) {
            case Type.JSON:
                return JSON.parse(module);
            default:
                return module;
        }
    }

    function _addScriptTag(path) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', path + '.js');
        script.onload = function () {
            loadingModules[path] = false;
        };
        document.head.appendChild(script);
    }

    function _getEffectivePath(path) {
        return config.paths[path] ? config.paths[path] : path;
    }

    function _getEffectivePaths(paths) {
        return paths.map(_getEffectivePath);
    }

    // public functions

    function define(name, deps, func) {

        if (typeof deps === 'function') {
            func = deps;
            deps = [];
        }

        loadingModules[name] = true;
        require(deps, function() {
            if (typeof registeredModules[name] === 'undefined') {
                registeredModules[name] = func.apply(null, arguments);
            }
            delete loadingModules[name];
        });
    }

    function require(deps, func) {
        if (typeof deps === 'string') {
            deps = [deps];
        }
        var modulesData = _getModulesData(_getEffectivePaths(Array.isArray(deps) ? deps : [deps]));
        var moduleIds = modulesData.map(function(moduleData) {
            return moduleData.path;
        });

        _loadModules(modulesData);

        setTimeout(callback, moduleLookupInterval);

        function callback() {
            if (_checkModulesAvailability(moduleIds)) {
                var args = [];
                for (var d=0; d<modulesData.length; d++) {
                    args.push(_evaluateModule(registeredModules[modulesData[d].path], modulesData[d].type));
                }
                func.apply(null, args);
            } else {
                setTimeout(callback, moduleLookupInterval);
            }
        }
    }

    /** reveal area **/

    return {
        define: define,
        require: require
    };

})();