(function () {
if ( typeof window.CustomEvent === "function" ) return false; //If not IE

function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
    }

CustomEvent.prototype = window.Event.prototype;

window.CustomEvent = CustomEvent;
})();

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
            this._eventListeners = new Map;
            this.setAttribute('o-component', true);
            this.onLoad();
        }

        _processEvent(sourceElement, eventName, eventData) {
            const eventListeners = this._eventListeners.get(eventName);
            if (Array.isArray(eventListeners)) {
                eventListeners.forEach(eventCallback => {
                    eventCallback(eventData);
                });
            }
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

        triggerEvent(eventName, eventData) {
            Ocomponent.triggerEvent(this, eventName, eventData);
        }

        on(eventName, callback) {
            this.addEventListener(eventName, callback);
        }

        once() {

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

    Ocomponent.triggerEvent = function(rootElement, eventName, eventData) {
        const children = rootElement.querySelectorAll('[o-component]');
        const eventDataObj = {detail: {}};
        eventDataObj.detail = Object.assign({ sourceElement: rootElement }, eventData);
        const customEvent = new CustomEvent(eventName, eventDataObj);

        if (children) {
            [].forEach.call(children, ocoElement => {
                ocoElement.dispatchEvent(customEvent);
            });
        }
    };

    _global.Ocomponent = Ocomponent;
}(window));