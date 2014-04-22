describe('iLocalStorage', function () {
    describe('Constructor', function () {
        var fakeObj;
        beforeEach(function () {
            fakeObj = {
                hasLocalStorage: sinon.stub().returns(true)
            };
        });
        it('should be a function', function () {
            expect(iLocalStorage, 'to be a function');
        });
        it('should take an option to allow mocking browser localstorage', function () {
            var options = {
                storage: { foo: 'some localStorage mock' }
            };
            iLocalStorage.call(fakeObj, options);
            expect(fakeObj.storage, 'to be', options.storage);
        });
        it('should take save a reference to window.localStorage if no mock is given', function () {
            // This test might fail if no localStorage is present in the browser
            // running the tests. Honestly I don't know, and I don't care a whole
            // lot, as I will not support browsers without.
            //
            // The assumption is that it will be undefined in browsers that don't
            // support it, and thus the test will still pass.
            iLocalStorage.call(fakeObj);
            expect(fakeObj.storage, 'to equal', window.localStorage);
        });
        it('should take an option to set namespace', function () {
            var options = {
                namespace: 'foo'
            };
            iLocalStorage.call(fakeObj, options);
            expect(fakeObj.namespace, 'to be', 'foo');
            expect(fakeObj.storage, 'to be', window.localStorage);
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
            fakeObj = {
                maybeSwallowException: sinon.stub().returnsArg(0),
                storage: {}
            };
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
        describe('keys', function () {
            it('should return all the keys in the storage object', function () {
                fakeObj.storage = {
                    foo: 'bar',
                    baz: 'qux'
                };
                expect(iLocalStorage.prototype.keys.call(fakeObj), 'to equal', [
                    'foo',
                    'baz'
                ]);
            });
            it('should return an empty list when nothing is saved', function () {
                fakeObj.storage = {};
                expect(iLocalStorage.prototype.keys.call(fakeObj), 'to equal', []);
            });
        });
    });
    describe('Namespacing', function () {
        var fakeObj;
        beforeEach(function () {
            fakeObj = {
                namespace: 'test',
                maybeSwallowException: sinon.stub().returnsArg(0),
                namespacedKey: function (key) { return this.namespace + '.' + key; },
                storage: {}
            };
        });
        it('should return a namespaced key', function () {
            expect(iLocalStorage.prototype.namespacedKey.call(fakeObj, 'key'), 'to be', 'test.key');
        });
        it('should return the key when no namespace is set', function () {
            expect(iLocalStorage.prototype.namespacedKey.call(null, 'key'), 'to be', 'key');
        });
        describe('setItem', function () {
            it('should attempt to set the value of a namespaced key', function () {
                fakeObj.storage.setItem = sinon.spy();
                iLocalStorage.prototype.setItem.call(fakeObj, 'foo', 'bar');
                expect(fakeObj.storage.setItem, 'was called with', 'test.foo', 'bar');
            });
        });
        describe('getItem', function () {
            it('should attempt to get the value of a namespaced key', function () {
                fakeObj.storage.getItem = sinon.spy();
                iLocalStorage.prototype.getItem.call(fakeObj, 'foo');
                expect(fakeObj.storage.getItem, 'was called with', 'test.foo');
            });
        });
        describe('removeItem', function () {
            it('should attempt to remove a namespaced key', function () {
                fakeObj.storage.removeItem = sinon.spy();
                iLocalStorage.prototype.removeItem.call(fakeObj, 'foo');
                expect(fakeObj.storage.removeItem, 'was called with', 'test.foo');
            });
        });
        describe('extended features', function () {
            it('need not handle namespacing as they call into the default methods', function () {
                fakeObj.setItem = sinon.spy();
                fakeObj.getItem = sinon.spy(function () { return JSON.stringify('test'); });
                fakeObj.removeItem = sinon.spy();
                iLocalStorage.prototype.set.call(fakeObj, 'foo', 'bar');
                expect(fakeObj.setItem, 'was called with', 'foo');
                iLocalStorage.prototype.get.call(fakeObj, 'foo');
                expect(fakeObj.getItem, 'was called with', 'foo');
                iLocalStorage.prototype.remove.call(fakeObj, 'foo');
                expect(fakeObj.removeItem, 'was called with', 'foo');
            });
        });
        describe('clear', function () {
            it('should remove all keys in the defined namespace', function () {
                fakeObj.removeItem = sinon.spy();
                fakeObj.keys = function () { return Object.keys(this.storage); };
                fakeObj.storage = {
                    'test.foo': 'foo',
                    'bar': 'foo'
                };
                iLocalStorage.prototype.clear.call(fakeObj);
                expect(fakeObj.removeItem, 'was called once');
                expect(fakeObj.removeItem, 'was called with', 'test.foo');
            });
            it('should remove all keys when not given a namespace', function () {
                fakeObj.storage = {
                    clear: sinon.spy()
                };
                fakeObj.namespace = '';
                iLocalStorage.prototype.clear.call(fakeObj);
                expect(fakeObj.storage.clear, 'was called');
            });
        });
    });
    describe('Ignoring exceptions', function () {
        it('should swallow exceptions if asked to', function () {
            expect(iLocalStorage.prototype.maybeSwallowException.call({
                ignoreExceptions: true
            }, function () {
                throw new Error('Test error');
            }), 'not to throw');
        });
        it('should not swallow exceptions if asked not to', function () {
            expect(iLocalStorage.prototype.maybeSwallowException.call({
                ignoreExceptions: false
            }, function () {
                throw new Error('Test error');
            }), 'to throw', 'Test error');
        });
        it('should not swallow exceptions if not asked to', function () {
            expect(iLocalStorage.prototype.maybeSwallowException.call({}, function () {
                throw new Error('Test error');
            }), 'to throw', 'Test error');
        });
        it('should allow to pass a fallback return value', function () {
            expect(iLocalStorage.prototype.maybeSwallowException.call({
                ignoreExceptions: true
            }, function () {
                throw new Error('Test error');
            }, 'return value').call(), 'to be', 'return value');
        });
        it('should return undefined if no fallback return value is provided', function () {
            expect(iLocalStorage.prototype.maybeSwallowException.call({
                ignoreExceptions: true
            }, function () {
                throw new Error('Test error');
            }).call(), 'to be undefined');
        });
    });
});
