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

//---------------------------------------
/**
 * @name oco - one component library
 * @author David Lorenz <info@activenode.de>
 */

var _OCO_INSTALL = (function(){
  var NODE_TYPE_TEXT = 3;
  var OCO_ATTR = 'oco';
  var OCO_ATTR_NOT_SELECTOR = ':not(['+OCO_ATTR+'])';
  var NODE_UPGRADED_PROTO_KEY = '__oco_upgraded_node__';

  var _installer = function(_document){
    var _componentsDefined = [];
    var _PF_componentsLibrary = {};

    function _isPolyfillRequired() {
      return !('registerElement' in _document) && !('customElements' in window);
    }

    function _isComponentDefined(elementName) {
      return _componentsDefined.indexOf(elementName) !== -1;
    }

    function _containsUnitializedCustomElements(domElement) {
      if (_componentsDefined.length === 0) {
        return false;
      }
      return domElement.querySelectorAll(
        _componentsDefined.map(function(_) {
          return _ + OCO_ATTR_NOT_SELECTOR;
        }).join(',')
      ).length > 0;
    }

    function _PF_setupHtmlObserver(observerCallback) {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          var addedNodes = mutation.addedNodes;
          var removedNodes = mutation.removedNodes;

          //TODO: process removedNodes first??

          [].forEach.call(addedNodes, function(domElement) {
            _PF_recursiveTreeUpgrade(domElement);
          });
        });
      });

      var config = {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true
      };

      observer.observe(_document, config);
    }

    function _PF_getUpgradeableNodes(elementName) {
      if (!Array.isArray(elementName)) {
        elementName = [elementName];
      }
      var componentsSelect = _document.querySelectorAll(
        elementName.map(function(n) {
          return n + OCO_ATTR_NOT_SELECTOR;
        }).join(',')
      );
      if (componentsSelect.length === 0) {
        return [];
      }

      return [].map.call(componentsSelect, function(_) { return _; });
    }

    function _PF_upgradeNode(domElement) {
      if (!domElement[NODE_UPGRADED_PROTO_KEY]) {
        var tagName = domElement.tagName.toLowerCase();
        var upgradePrototype = _PF_componentsLibrary[tagName];

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

    function _PF_recursiveTreeUpgrade(domElement) {
      if (domElement.nodeType === NODE_TYPE_TEXT) {
        return;
      }

      var tagName = domElement.tagName.toLowerCase();
      if (_isComponentDefined(tagName)) {
        // seems to be a custom component
        _PF_upgradeNode(domElement);
      }

      if (_containsUnitializedCustomElements(domElement)) {
        // dig deeper!
        [].forEach.call(domElement.childNodes, function(childDomElement) {
          _PF_recursiveTreeUpgrade(childDomElement);
        });
      } // else: done
    }

    if (_isPolyfillRequired()) {
      if (_document.readyState === 'loading') {
        _document.addEventListener('DOMContentLoaded', function() {
          _PF_setupHtmlObserver();

          if (_componentsDefined.length > 0) {
            _PF_getUpgradeableNodes(_componentsDefined).forEach(_PF_upgradeNode);
          }
        });
      } else {
        _PF_setupHtmlObserver();
      }
    }

    _document.defineElement = function(elementName, methodsObj) {
      var attachedCallbackOrig = methodsObj.attachedCallback;
      var attachedCallback = function() {
        this.setAttribute(OCO_ATTR, '');

        if (attachedCallbackOrig) {
          attachedCallbackOrig.call(this);
        }
      };

      var getHtmlElementProto = function() {
        var prototype = Object.create(HTMLElement.prototype);
        prototype[NODE_UPGRADED_PROTO_KEY] = true;
        Object.keys(methodsObj).forEach(function(key) {
          prototype[key] = methodsObj[key]
        });

        prototype.attachedCallback = attachedCallback;

        return prototype;
      }

      if ('customElements' in window) {
        var evalClass = eval('(function(){'
        + 'return class extends HTMLElement {'
        + 'constructor() {'
        + ' super();'
        + ' this[NODE_UPGRADED_PROTO_KEY] = true;'
        + ' methodsObj.createdCallback.call(this);'
        + '}'

        + 'connectedCallback() {'
        + 'attachedCallback.call(this);'
        + '}'

        + 'disconnectedCallback() {'
        + 'if (\'detachedCallback\' in methodsObj) {'
        + 'methodsObj.detachedCallback.call(this);'
        + '}'
        + '}'
        + '}'
        + '}());');

        customElements.define(elementName, evalClass);
      } else if ('registerElement' in _document) {
        _document.registerElement(elementName, {
          prototype: getHtmlElementProto()
        });
      } else {
        _PF_componentsLibrary[elementName] = getHtmlElementProto();

        if (_document.readyState !== 'loading') {
          var upgradeableNodes = _PF_getUpgradeableNodes(elementName);
          upgradeableNodes.forEach(_PF_upgradeNode);
        } // else: not needed because there is a global event listening!
      }

      _componentsDefined.push(elementName);
    };
  };

  return _installer;
}());