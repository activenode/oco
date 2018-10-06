(function(_document){
    _document.defineElement = function(elementName, methodsObj) {
        var getHtmlElementObject = function() {
            var elem = Object.create(HTMLElement.prototype);
            Object.keys(methodsObj).forEach(key => elem[key] = methodsObj[key]);
            return elem;
        }

        if (false && 'customElements' in window) {
            customElements.define(elementName, class extends HTMLElement {
                constructor() {
                    super();
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
            document.registerElement(elementName, {
                prototype: getHtmlElementObject()
            });
        } else {
            var elem = getHtmlElementObject();

            // TODO: hook into document.createElement to be able to check *createdCallback*
            // TODO: watch new changes via MutationObserver
            // TODO: reading dom nodes when DOMContentLoaded is done
            if (document.readyState === 'loading') {
                alert('wait for domcontentloaded');
            } else {
                alert('parse html');
            }
        }
    };

    _document.defineElement('x-test', {
        createdCallback: function() {
            // DO NOT DO DOM MANIPULATIONS HERE!!!
            // maybe load data or whatever!
            console.log('created');
        },

        attachedCallback: function() {
            console.log('was attached', this);
        },

        detachedCallback: function() {
            console.log('was detached', this);
        }
    });
}(document));