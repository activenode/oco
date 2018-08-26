
(function(_global){
    const _definedElements = [];
    let _queuedDependencies = [];

    function _resolveQueue() {
        const _queuedDependenciesRemaining = [];

        _queuedDependencies.forEach(([dependencies, resolve]) => {
            if (_dependenciesAvailable(dependencies)) {
                resolve();
            } else {
                _queuedDependenciesRemaining.push([dependencies, resolve]);
            }
        });

        _queuedDependencies = _queuedDependenciesRemaining;
    }

    function _dependenciesAvailable(dependencies) {
        if (!Array.isArray(dependencies)) {
            dependencies = [dependencies];
        }

        return !dependencies.some(dependency => {
            return _definedElements.indexOf(dependency) === -1;
        });
    }

    class Ocomponent extends HTMLElement {
        constructor() {
            super();
            this._onLoad();
        }

        createdCallback() {
            this._onLoad();
        }

        attachedCallback() {
            this._isConnected();
        }

        connectedCallback() {
            this._isConnected();
        }


        _isConnected() {
            var _this = this;
            var stateChanged = function() {
                if (document.readyState !== 'loading') {
                    document.removeEventListener('readystatechange', stateChanged);
                    _this._isConnected();
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('readystatechange', stateChanged);
            } else {
                this.domReady();
            }
        }

        _onLoad() {
            this.setAttribute('o-component', true);
            this.onLoad();
        }

        require(dependencies) {
            return new Promise(resolve => {
                if (_dependenciesAvailable(dependencies)) {
                    return resolve();
                } else {
                    _queuedDependencies.push([dependencies, resolve]);
                }
            });
        }

        on(event, eventCallback) {
            this.addEventListener(event, eventCallback);
        }

        // ---- shall be overwritten!
        onLoad() {}
        isReady() {}
        redraw() {}
        onRemove() {}

        // build something that considers [hidden] so that perf is saved
    }

    Ocomponent.defineElement = function(elementName, dependencies, elementClass) {
        if (arguments.length === 2) {
            elementClass = dependencies; // because dependencies is optional
        }

        document.registerElement(elementName, {
            prototype: Object.create(elementClass.prototype)
        });

        _definedElements.push(elementName);
        _resolveQueue();
    };

    Ocomponent.triggerEvent = function(eventName, eventData, eventOptions) {
        // TODO: test
    };

    _global.Ocomponent = Ocomponent;
}(window));