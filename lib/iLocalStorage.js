(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.iLocalStorage = factory();
    }
}(this, function () {

    /**
     * Improved LocalStorage interface.
     *
     * This constructor takes an argument, to allow replacing
     * localstorage with a stubbed or mocked out object in tests.
     */
    function iLocalStorage(options) {
        options = options || {};

        this.storage = options.storage || window.localStorage;
        this.namespace = options.namespace || '';
        this.ignoreExceptions = options.ignoreExceptions || false;

        if (!this.hasLocalStorage()) {
            // What should we do in case of an error?
        }
    }

    /**
     * This method tests if we have a functional localStorage
     * implementation.
     *
     * This is a modified variant of the Modernizr localstorage test.
     * Besides testing that you can set and remove items without an
     * error being thrown, it will verify that it can retrieve data
     * which has been set aswell.
     */
    iLocalStorage.prototype.hasLocalStorage = function (testString) {
        testString = (testString) ? testString : 'iLocalStorage';
        try {
            this.storage.setItem(testString, testString);
            var value = this.storage.getItem(testString);
            this.storage.removeItem(testString);
            return value === testString;
        } catch(e) {
            return false;
        }
    };

    /**
     * This functions swallows exceptions if it was asked to do so in
     * the constructor.
     */
    iLocalStorage.prototype.maybeSwallowException = function (fn, fallbackReturnValue) {
        if (this.ignoreExceptions) {
            return function () {
                try {
                    return fn();
                } catch (e) {
                    return fallbackReturnValue;
                }
            } ;
        } else {
            return fn;
        }
    };


    /**
     * Returns a key prepended with the defined namespace.
     */
    iLocalStorage.prototype.namespacedKey = function (key) {
        return (this.namespace) ? this.namespace + '.' + key : key;
    };

    /**
     * Returns all the keys persisted in localStorage
     */
    iLocalStorage.prototype.keys = function () {
        var keys = Object.keys(this.storage);
        return keys;
    };

    iLocalStorage.prototype.getItem = function (key) {
        return this.maybeSwallowException(function () {
            if (this.namespace) { key = this.namespacedKey(key); }
            return this.storage.getItem(key);
        }.bind(this), null).call();
    };

    iLocalStorage.prototype.setItem = function (key, value) {
        return this.maybeSwallowException(function () {
            if (this.namespace) { key = this.namespacedKey(key); }
            this.storage.setItem(key, value);
        }.bind(this)).call();
    };

    iLocalStorage.prototype.removeItem = function (key) {
        return this.maybeSwallowException(function () {
            if (this.namespace) { key = this.namespacedKey(key); }
            this.storage.removeItem(key);
        }.bind(this)).call();
    };

    iLocalStorage.prototype.clear = function () {
        var that = this;
        if (this.namespace) {
            this.keys().filter(function (key) {
                return key.substr(0, that.namespace.length) === that.namespace;
            }).forEach(this.removeItem);
        } else {
            return this.maybeSwallowException(function () {
                this.storage.clear();
            }.bind(this)).call();
        }
    };

    iLocalStorage.prototype.set = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };

    iLocalStorage.prototype.get = function (key) {
        return JSON.parse(this.getItem(key));
    };

    iLocalStorage.prototype.remove = function (key) {
        this.removeItem(key);
    };

    return iLocalStorage;

}));
