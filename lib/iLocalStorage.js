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
    function iLocalStorage(storage) {
        this.storage = storage;

        if (typeof this.storage === 'undefined') {
            this.storage = window.localStorage;
        }

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

    iLocalStorage.prototype.getItem = function (key) {
        return this.storage.getItem(key);
    };

    iLocalStorage.prototype.setItem = function (key, value) {
        this.storage.setItem(key, value);
    };

    iLocalStorage.prototype.removeItem = function (key) {
        this.storage.removeItem(key);
    };

    iLocalStorage.prototype.clear = function () {
        this.storage.clear();
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
