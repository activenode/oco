var installCE = function(_document){
    var NODE_UPGRADED_KEY = '__oco_upgraded_node__';
    var _componentsDefined = [];
    var _PF_componentsLibrary = {};

    function isComponentDefined(elementName) {
        return _componentsDefined.indexOf(elementName) !== -1;
    }

    function getUpgradeableNodes(elementName) {
        const componentsSelect = document.querySelectorAll(
            Array.isArray(elementName) ? elementName.join(',') : elementName
        );

        if (componentsSelect.length === 0) {
            return [];
        }

        return [].filter.call(componentsSelect, function(domElement) {
            return !domElement[NODE_UPGRADED_KEY];
        });
    }

    function _upgradeNode(domElement) {
        if (!domElement[NODE_UPGRADED_KEY]) {
            const tagName = domElement.tagName.toLowerCase();
            const upgradePrototype = _PF_componentsLibrary[tagName];

            if (upgradePrototype) {
                Object.setPrototypeOf(domElement, upgradePrototype);
                domElement.createdCallback();
                // TODO: check if createdCallback was fired already! if yes: dont fire!
                domElement.attachedCallback();
            } else {
                console.error('Cannot upgrade', domElement, ' the prototype definition is not available');
            }
        }
    }

    if (_document.readyState === 'loading') {
        _document.addEventListener('DOMContentLoaded', function() {
            // TODO: setup mutationobserver to be able to catch createdCallback innerHTML calls etc.

            if (_componentsDefined.length > 0) {
                getUpgradeableNodes(_componentsDefined).forEach(_upgradeNode);
            }
        });
    }

    /**
     * // TODO: hook into document.createElement to be able to check *createdCallback*
            // TODO: watch new changes via MutationObserver
            // TODO: reading dom nodes when DOMContentLoaded is done
            if (document.readyState === 'loading') {
                alert('wait for domcontentloaded');
            } else {
                alert('parse html');
            }
     */

    _document.defineElement = function(elementName, methodsObj) {
        var getHtmlElementProto = function() {
            var prototype = Object.create(HTMLElement.prototype);
            prototype[NODE_UPGRADED_KEY] = true;
            Object.keys(methodsObj).forEach(key => prototype[key] = methodsObj[key]);
            return prototype;
        }

        if (false && 'customElements' in window) {
            customElements.define(elementName, class extends HTMLElement {
                constructor() {
                    super();
                    this[NODE_UPGRADED_KEY] = true;
                    methodsObj.createdCallback.call(this);
                }

                connectedCallback() {
                    if ('attachedCallback' in methodsObj) {
                        methodsObj.attachedCallback.call(this);
                    }
                }

                disconnectedCallback() {
                    if ('detachedCallback' in methodsObj) {
                        methodsObj.detachedCallback.call(this);
                    }
                }
            });
        } else if (false && 'registerElement' in _document) {
            _document.registerElement(elementName, {
                prototype: getHtmlElementProto()
            });
        } else {
            _PF_componentsLibrary[elementName] = getHtmlElementProto();

            if (_document.readyState !== 'loading') {
                const upgradeableNodes = getUpgradeableNodes(elementName);
                // TODO: upgrade these nodes!
            } // else: not needed because there is a global event listening!
        }

        _componentsDefined.push(elementName);
        console.log('>xo', _componentsDefined);
    };

    _document.defineElement('x-test', {
        createdCallback: function() {
            // DO NOT DO DOM MANIPULATIONS HERE!!!
            // maybe load data or whatever!
            console.log('created', this);
        },

        attachedCallback: function() {
            console.log('was attached', this);
        },

        detachedCallback: function() {
            console.log('was detached', this);
        }
    });
};

installCE(document);