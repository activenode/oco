/**

*/

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



Ocomponent.defineElement('x-component', (function(){
    // to support old OWF code we could have something like:
    // Util.requireDependencies()

    return class extends Ocomponent {
        onLoad() {
            console.log('onLoad2');
            // you could start fetching data in here
        }

        domReady() {
            // well now you can do dom manipulation
            // you could also do stuff like React.render in here. why not?
            console.log('this is ready>>>', this.innerHTML);

            this.require([
                'x-other'
            ]).then(() => this.start());
        }

        start() {
            var other = document.createElement('x-other');
            this.appendChild(other);
        }
    };
}()));


Ocomponent.defineElement('x-other', (function(){
    // to support old code we could have something like:
    // OldUtil.requireDependencies()

    return class extends Ocomponent {
        onLoad() {
            console.log('onLoad2');
            // you could start fetching data in here
        }

        domReady() {
            // well now you can do dom manipulation
            // you could also do stuff like React.render in here. why not?
            console.log('this2 is ready>>>', this.innerHTML);

            this.require(['x-component']).then(() => this.start());
        }

        start() {
            this.innerHTML = 'Hello I am an automatically mounted x-other component';
        }
    };
}()));

// customElements.define('x-component', MyTest);