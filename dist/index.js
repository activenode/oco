parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r},p.cache={};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"Focm":[function(require,module,exports) {
!function(){if("function"==typeof window.CustomEvent)return!1;function e(e,t){t=t||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),n}e.prototype=window.Event.prototype,window.CustomEvent=e}();var _OCO_INSTALL=function(){var _forEach=function(e,t){return[].forEach.call(e,t)},_loopObject=function(e,t){return Object.keys(e).forEach(function(n){t(n,e[n])})},_map=function(e,t){return[].map.call(e,t)},_extend=function(){for(var e=arguments[0],t=!!this.excludeKeys&&this.excludeKeys,n=1;n<arguments.length;n++)_loopObject(arguments[n],function(n,a){t&&-1!==t.indexOf(n)||(e[n]=a)});return e},NODE_TYPE_TEXT=3,OCO_ATTR="oco",OCO_ATTR_NOT_SELECTOR=":not(["+OCO_ATTR+"])",NODE_UPGRADED_PROTO_KEY="__oco_upgraded_node__",DEFAULT_EVENT_NAMESPACE="!!",_installer=function _installer(_document){var _componentsDefined=[],_PF_componentsLibrary={};function _isPolyfillRequired(){return!("registerElement"in _document||"customElements"in window)}function _isComponentDefined(e){return-1!==_componentsDefined.indexOf(e)}function _containsUnitializedCustomElements(e){return 0!==_componentsDefined.length&&e.querySelectorAll(_componentsDefined.map(function(e){return e+OCO_ATTR_NOT_SELECTOR}).join(",")).length>0}function _PF_setupHtmlObserver(e){new MutationObserver(function(e){e.forEach(function(e){var t=e.addedNodes;e.removedNodes;_forEach(t,function(e){_PF_recursiveTreeUpgrade(e)})})}).observe(_document,{attributes:!1,childList:!0,characterData:!1,subtree:!0})}function _PF_getUpgradeableNodes(e){Array.isArray(e)||(e=[e]);var t=_document.querySelectorAll(e.map(function(e){return e+OCO_ATTR_NOT_SELECTOR}).join(","));return 0===t.length?[]:_map(t,function(e){return e})}function _PF_upgradeNode(e){if(!e[NODE_UPGRADED_PROTO_KEY]){var t=e.tagName.toLowerCase(),n=_PF_componentsLibrary[t];n?(Object.setPrototypeOf(e,n),e.createdCallback(),e.attachedCallback()):console.error("Cannot upgrade",e," the prototype definition is not available")}}function _PF_recursiveTreeUpgrade(e){e.nodeType!==NODE_TYPE_TEXT&&(_isComponentDefined(e.tagName.toLowerCase())&&_PF_upgradeNode(e),_containsUnitializedCustomElements(e)&&_forEach(e.childNodes,function(e){_PF_recursiveTreeUpgrade(e)}))}_isPolyfillRequired()&&("loading"===_document.readyState?_document.addEventListener("DOMContentLoaded",function(){_PF_setupHtmlObserver(),_componentsDefined.length>0&&_PF_getUpgradeableNodes(_componentsDefined).forEach(_PF_upgradeNode)}):_PF_setupHtmlObserver()),_document.defineElement=function(){var getEventAndNamespace=function(e){var t=e.split("."),n=t.slice(1).join(".").trim();return[t[0],""===n?DEFAULT_EVENT_NAMESPACE:n]},getElementPrototypeExtensions=function(){return{__eventListeners:{},on:function(e,t){var n=getEventAndNamespace(e),a=n[0],o=n[1],c=this.__eventListeners;c[a]||(this.__eventListeners[a]=new Map),c[a].has(o)||c[a].set(o,[]),c[a].get(o).push(t),this.addEventListener(a,t)},off:function(e,t){var n=getEventAndNamespace(e),a=n[0],o=n[1],c=this.__eventListeners,r=this;if(c[a]){var i=function(e,n){if(Array.isArray(n)){var i=[];if(n.forEach(function(e){t&&t!==e?i.push(e):r.removeEventListener(a,e)}),i.length>0)return void c[a].set(o,i)}c[a].delete(e)};o!==DEFAULT_EVENT_NAMESPACE?c[a].has(o)&&(console.log("wat this",a,c[a].get(o)),i(o,c[a].get(o))):c[a].forEach(i)}}}},getHtmlElementProto=function(){var e=Object.create(HTMLElement.prototype);return e[NODE_UPGRADED_PROTO_KEY]=!0,_forEach(arguments,function(t){Object.keys(t).forEach(function(n){e[n]=t[n]})}),e};return function(elementName,methodsObj){var attachedCallback=(_attachedCallback=methodsObj.attachedCallback,function(){this.setAttribute(OCO_ATTR,""),_attachedCallback&&_attachedCallback.call(this)}),_attachedCallback,detachedCallback=(_detachedCallback=methodsObj.detachedCallback,function(){console.log("removing from DOM",this),_detachedCallback&&_detachedCallback.call(this)}),_detachedCallback,attachedDetachedMethods={attachedCallback:attachedCallback,detachedCallback:detachedCallback};if("customElements"in window){var classDefinition=eval("(function(){return class extends HTMLElement {constructor() {super();this[NODE_UPGRADED_PROTO_KEY] = true;methodsObj.createdCallback.call(this);}connectedCallback() {attachedCallback.call(this);}disconnectedCallback() {detachedCallback.call(this);}}}());"),skipMethods=Object.keys(attachedDetachedMethods);_extend.call({excludeKeys:skipMethods},classDefinition.prototype,getElementPrototypeExtensions(),methodsObj),customElements.define(elementName,classDefinition)}else{var elementPrototype=getHtmlElementProto(getElementPrototypeExtensions(),methodsObj,attachedDetachedMethods);if("registerElement"in _document)_document.registerElement(elementName,{prototype:elementPrototype});else if(_PF_componentsLibrary[elementName]=elementPrototype,"loading"!==_document.readyState){var upgradeableNodes=_PF_getUpgradeableNodes(elementName);upgradeableNodes.forEach(_PF_upgradeNode)}}_componentsDefined.push(elementName)}}()};return _installer}();
},{}]},{},["Focm"], null)
//# sourceMappingURL=/index.map