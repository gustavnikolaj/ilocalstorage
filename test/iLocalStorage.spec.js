describe('iLocalStorage', function () {
    describe('Constructor', function () {
        it('should be a function', function () {
            expect(iLocalStorage, 'to be a function');
        });
        it('should take a argument to allow mocking browser localstorage', function () {
            var fakeObj = {};
            var localStorage = new iLocalStorage(fakeObj);
            expect(localStorage.storage, 'to be', fakeObj);
        });
        it('should take save a reference to window.localStorage if no mock is given', function () {
            // This test might fail if no localStorage is present in the browser
            // running the tests. Honestly I don't know, and I don't care a whole
            // lot, as I will not support browsers without.
            //
            // The assumption is that it will be undefined in browsers that don't
            // support it, and thus the test will still pass.
            var localStorage = new iLocalStorage();
            expect(localStorage.storage, 'to equal', window.localStorage);
        });
    });
    describe('Test for localStorage availability.', function () {
        it('should be able to check if localstorage is functional', function () {
            var fakeObj = { storage: null };
            expect(iLocalStorage.prototype.hasLocalStorage.call(fakeObj), 'not to be ok');
        });
        it('should accept a stubbed localStorage', function () {
            var fakeObj = {
                storage: {
                    setItem: sinon.stub(),
                    getItem: sinon.stub().returns('testString'),
                    removeItem: sinon.stub()
                }
            };
            expect(iLocalStorage.prototype.hasLocalStorage.call(fakeObj, 'testString'), 'to be ok');
        });
    });
    describe('Basic localStorage functionality', function () {
        var fakeObj;
        beforeEach(function () {
            fakeObj = { storage: {} };
        });
        // Implement the basic localStorage functions as per the spec
        // by mapping functions to the browsers implementation:
        // http://www.w3.org/TR/webstorage/#storage-0
        // http://www.w3.org/TR/webstorage/#the-localstorage-attribute
        //
        // The key method and the length property is not
        // implemented. If there is a need for them to be exposed as
        // part of the API we can undo that decision.
        describe('setItem', function () {
            it('should set a new value', function () {
                fakeObj.storage.setItem = sinon.spy();
                iLocalStorage.prototype.setItem.call(fakeObj, 'foo', 'bar');
                expect(fakeObj.storage.setItem, 'was called with', 'foo', 'bar');
            });
        });
        describe('getItem', function () {
            it('should return the current value associated with the given key', function () {
                fakeObj.storage.getItem = sinon.stub().returns('bar');
                expect(iLocalStorage.prototype.getItem.call(fakeObj, 'foo'), 'to be', 'bar');
            });
            it('should return null if key has no value', function () {
                fakeObj.storage.getItem = sinon.stub().returns(null);
                expect(iLocalStorage.prototype.getItem.call(fakeObj, 'foo'), 'to be null');
            });
        });
        describe('removeItem', function () {
            it('should remove the key from the storage object', function () {
                fakeObj.storage.removeItem = sinon.spy();
                iLocalStorage.prototype.removeItem.call(fakeObj, 'foo');
                expect(fakeObj.storage.removeItem, 'was called with', 'foo');
            });
        });
        describe('clear', function () {
            it('should clear all entries from the storage object', function () {
                fakeObj.storage.clear = sinon.spy();
                iLocalStorage.prototype.clear.call(fakeObj);
                expect(fakeObj.storage.clear, 'was called');
            });
        });
    });
    describe('Extended functionality', function () {
        var fakeObj;
        beforeEach(function () {
            fakeObj = {};
        });
        describe('set', function () {
            it('should serialize an object and save it as JSON', function () {
                fakeObj.setItem = sinon.spy();
                iLocalStorage.prototype.set.call(fakeObj, 'foo', { foo: 'bar' });
                expect(fakeObj.setItem, 'was called with', 'foo', '{"foo":"bar"}');
            });
            it('should serialize a string', function () {
                fakeObj.setItem = sinon.spy();
                iLocalStorage.prototype.set.call(fakeObj, 'foo', 'bar');
                expect(fakeObj.setItem, 'was called with', 'foo', '"bar"');
            });
        });
        describe('get', function () {
            it('should unserialize a saved object', function () {
                fakeObj.getItem = sinon.stub().returns('{"foo":"bar"}');
                expect(iLocalStorage.prototype.get.call(fakeObj, 'foo'), 'to equal', {
                    foo: 'bar'
                });
            });
            it('should unserialize a saved int', function () {
                fakeObj.getItem = sinon.stub().returns(JSON.stringify(10));
                expect(iLocalStorage.prototype.get.call(fakeObj, 'foo'), 'to be', 10);
            });
            it('should return null if key has no value', function () {
                fakeObj.getItem = sinon.stub().returns(null);
                expect(iLocalStorage.prototype.get.call(fakeObj, 'foo'), 'to be null');
            });
        });
        describe('remove', function () {
            it('should remove the key from the storage object', function () {
                fakeObj.removeItem = sinon.spy();
                iLocalStorage.prototype.remove.call(fakeObj, 'foo');
                expect(fakeObj.removeItem, 'was called with', 'foo');
            });
        });
    });
});
