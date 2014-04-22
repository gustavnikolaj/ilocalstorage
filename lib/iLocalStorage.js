/*global define, module, window*/
(function (root, factory) {
    'use strict';
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.iLocalStorage = factory();
    }
}(this, function () {
    'use strict';

    /**
     * Improved LocalStorage interface.
     *
     * This constructor takes an options object.
     *
     * options.ignoreExceptions:
     *     Passing true to this option will make all methods on this
     *     instance suppress exceptions thrown in calls to
     *     localStorage.  That is useful when you only use
     *     localStorage to persist information, that is not important,
     *     for conveniency for your users. Like layout preference
     *     settings.
     *
     * options.namespace:
     *     This option allow you to prefix all keys operated on from
     *     this instance. That is useful for applications where you
     *     expect multiple users to use the same client, and want to
     *     be able to persist data for them independently.
     *
     * options.storage:
     *     This available to allow replacing localstorage with a
     *     stubbed or mocked out object in tests.
     */
    function iLocalStorage(options) {
        options = options || {};

        this.storage = options.storage || window.localStorage;
        this.namespace = options.namespace || '';
        this.ignoreExceptions = options.ignoreExceptions || false;

        this.functional = this.hasLocalStorage();
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
        testString = testString || 'iLocalStorage';
        try {
            this.storage.setItem(testString, testString);
            var value = this.storage.getItem(testString);
            this.storage.removeItem(testString);
            return value === testString;
        } catch (e) {
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
            };
        }
        return fn;
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

    /**
     * This function extends the native localStorage getItem method
     * with error handling and namespacing.
     */
    iLocalStorage.prototype.getItem = function (key) {
        return this.maybeSwallowException(function () {
            if (this.namespace) { key = this.namespacedKey(key); }
            return this.storage.getItem(key);
        }.bind(this), null).call();
    };

    /**
     * This function extends the native localStorage setItem method
     * with error handling and namespacing.
     */
    iLocalStorage.prototype.setItem = function (key, value) {
        return this.maybeSwallowException(function () {
            if (this.namespace) { key = this.namespacedKey(key); }
            this.storage.setItem(key, value);
        }.bind(this)).call();
    };

    /**
     * This function extends the native localStorage removeItem method
     * with error handling and namespacing.
     */
    iLocalStorage.prototype.removeItem = function (key) {
        return this.maybeSwallowException(function () {
            if (this.namespace) { key = this.namespacedKey(key); }
            this.storage.removeItem(key);
        }.bind(this)).call();
    };

    /**
     * This function extends the native localStorage clear method
     * with error handling and namespacing.
     */
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

    /**
     * This method extends the functionality of the native
     * localStorage setItem method, to allow persisting other values
     * than strings. It does that by JSON stringifying values before
     * saving them.
     */
    iLocalStorage.prototype.set = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };

    /**
     * This method extends the functionality of the native
     * localStorage getItem method to be able to read out values saved
     * by the enhanced set method.
     */
    iLocalStorage.prototype.get = function (key) {
        return JSON.parse(this.getItem(key));
    };

    /**
     * This method is a conveniency mapping to the native localStorage
     * removeItem method. It's provided for consistency to go with the
     * enhanced set and remove methods.
     */
    iLocalStorage.prototype.remove = function (key) {
        this.removeItem(key);
    };

    return iLocalStorage;

}));
