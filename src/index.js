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

window._OCO_INSTALL = (function(){
  var _forEach = function(list, loopFunc) {
    return [].forEach.call(list, loopFunc);
  };

  /**
   * Iterates an object and provides key,value to the looping function
   * @param {Object} obj - the object to iterate
   * @param {Function<Key, Value>} loopFunc
   */
  var _loopObject = function(obj, loopFunc) {
    return Object.keys(obj).forEach(function(key) {
      loopFunc(key, obj[key]);
    });
  };

  var _map = function(list, loopFunc) {
    return [].map.call(list, loopFunc);
  };

  var _extend = function(/** srcObj, extendObj1, extendObj2, ... */) {
    var srcObj = arguments[0];
    var excludeKeys = this.excludeKeys ? this.excludeKeys : false;

    for (var i=1; i < arguments.length; i++) {
      _loopObject(arguments[i], function(key, value) {
        if (!excludeKeys || excludeKeys.indexOf(key) === -1) {
          srcObj[key] = value;
        }
      });
    }

    return srcObj;
  };

  var NODE_TYPE_TEXT = 3;
  var OCO_ATTR = 'oco';
  var OCO_ATTR_NOT_SELECTOR = ':not(['+OCO_ATTR+'])';
  var NODE_UPGRADED_PROTO_KEY = '__oco_upgraded_node__';
  var DEFAULT_EVENT_NAMESPACE = '!!';

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

      if (!_document.body.contains(domElement)) {
        // IE11 throws syntax error on pseudo selectors that are within detached elements
        // this is okay since this function anyway should only be necessary for attached ones
        // detached ones that are going to be attached should be triggered by mutationobserver - hopefully :P
        return false;
      }

      var uninitializedComponentsSelector = _componentsDefined.map(function(_) {
        return _ + OCO_ATTR_NOT_SELECTOR;
      }).join(',');

      var selectUnitializedComponents = domElement.querySelectorAll(uninitializedComponentsSelector);
      return selectUnitializedComponents.length > 0;
    }

    function _PF_setupHtmlObserver(observerCallback) {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          var addedNodes = mutation.addedNodes;
          var removedNodes = mutation.removedNodes;

          //TODO: process removedNodes first??

          _forEach(addedNodes, function(domElement) {
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

      return _map(componentsSelect, function(_) { return _; });
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
        _forEach(domElement.childNodes, function(childDomElement) {
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

    _document.defineElement = (function(){
      var getEventAndNamespace = function(eventName) {
        var splittedEventString = eventName.split('.');
        var namespaceString = splittedEventString.slice(1).join('.').trim();
        return [splittedEventString[0], namespaceString === '' ? DEFAULT_EVENT_NAMESPACE : namespaceString];
      };

      var getElementPrototypeExtensions = function() {
        return {
          __eventListeners: {},

          on: function(eventName, listener) {
            var eventAndNs = getEventAndNamespace(eventName);
            var eventKey = eventAndNs[0];
            var eventNs = eventAndNs[1];
            var eventListenersRef = this.__eventListeners;

            if (!eventListenersRef[eventKey]) {
              this.__eventListeners[eventKey] = new Map;
            }

            if (!eventListenersRef[eventKey].has(eventNs)) {
              eventListenersRef[eventKey].set(eventNs, []);
            }

            eventListenersRef[eventKey].get(eventNs).push(listener);
            this.addEventListener(eventKey, listener);
          },

          off: function(eventName, listenerToRemove) {
            var eventAndNs = getEventAndNamespace(eventName);
            var eventKey = eventAndNs[0];
            var eventNs = eventAndNs[1];
            var eventListenersRef = this.__eventListeners;
            var _this = this;

            if (!eventListenersRef[eventKey]) {
              return;
            }

            var deleteListeners = function(evtNamespace, listenersArray) {
              if (Array.isArray(listenersArray)) {
                var newListenersArray = [];
                listenersArray.forEach(function(listenerFromArray) {
                  if (!listenerToRemove || listenerToRemove === listenerFromArray) {
                    // remove any listener
                    _this.removeEventListener(eventKey, listenerFromArray);
                  } else {
                    // add back
                    newListenersArray.push(listenerFromArray);
                  }
                });

                if (newListenersArray.length > 0) {
                  // return so that its not deleted!
                  eventListenersRef[eventKey].set(eventNs, newListenersArray);
                  return;
                }
              }

              eventListenersRef[eventKey].delete(evtNamespace);
            };

            if (eventNs === DEFAULT_EVENT_NAMESPACE) {
              // delete all!
              eventListenersRef[eventKey].forEach(deleteListeners);
              return;
            }

            if (!eventListenersRef[eventKey].has(eventNs)) {
              return;
            } // else: there is a value for this namespace!

            deleteListeners(eventNs, eventListenersRef[eventKey].get(eventNs));
          }
        };
      };

      var getHtmlElementProto = function() {
        var prototype = Object.create(HTMLElement.prototype);
        prototype[NODE_UPGRADED_PROTO_KEY] = true;

        _forEach(arguments, function(obj) {
          Object.keys(obj).forEach(function(key) {
            prototype[key] = obj[key]
          });
        });

        return prototype;
      };

      return function(elementName, methodsObj) {
        var attachedCallback = (function(_attachedCallback) {
          return function() {
            this.setAttribute(OCO_ATTR, '');

            if (_attachedCallback) {
              _attachedCallback.call(this);
            }
          };
        }(methodsObj.attachedCallback));

        var detachedCallback = (function(_detachedCallback) {
          return function() {
            if (_detachedCallback) {
              _detachedCallback.call(this);
            }
          };
        }(methodsObj.detachedCallback));

        var attachedDetachedMethods = {
          attachedCallback: attachedCallback,
          detachedCallback: detachedCallback
        };

        if ('customElements' in window) {
          var classDefinition = eval('(function(){'
          + 'return class extends HTMLElement {'
            + 'constructor() {'
              + 'super();'
              + 'this[NODE_UPGRADED_PROTO_KEY] = true;'
              + 'methodsObj.createdCallback.call(this);'
            + '}'

            + 'connectedCallback() {'
              + 'attachedCallback.call(this);'
            + '}'

            + 'disconnectedCallback() {'
              + 'detachedCallback.call(this);'
            + '}'
          + '}'
          + '}());');

          var skipMethods = Object.keys(attachedDetachedMethods);
          _extend.call(
            { excludeKeys: skipMethods },
            classDefinition.prototype,
            getElementPrototypeExtensions(),
            methodsObj
          );

          customElements.define(elementName, classDefinition);
        } else {
          var elementPrototype = getHtmlElementProto(
            getElementPrototypeExtensions(),
            methodsObj,
            attachedDetachedMethods
          );

          if ('registerElement' in _document) {
            _document.registerElement(elementName, {
              prototype: elementPrototype
            });
          } else {
            _PF_componentsLibrary[elementName] = elementPrototype;

            if (_document.readyState !== 'loading') {
              var upgradeableNodes = _PF_getUpgradeableNodes(elementName);
              upgradeableNodes.forEach(_PF_upgradeNode);
            } // else: not needed because there is a global event listening!
          }
        }

        _componentsDefined.push(elementName);
      };
    }());
  };

  return _installer;
}());
