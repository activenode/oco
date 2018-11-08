# OCO - One Component


## What is this?

Basically it is

```javascript
document.defineElement('some-tag-name', {
    createdCallback: ...,
    attachedCallback: function() {
        this.innerHTML = '<strong>Hello World!</strong>';
    },
    detachedCallback: ...
})
```

```html
// index.html, source
...
<some-tag-name></some-tag-name>

// index.html, page load
<some-tag-name>Hello World!</some-tag-name>
```

which will enable you to use `<some-tag-name>` as WebComponent in your HTML. No weird magic involved and no requirement to struggle with any build setup.


## Yet another web component library? Why?

We were trying to find the most minimal set of code to support the minimal and portable integration of web components without affecting existing code.
This is *not* a polyfill and we are *not* manipulating existing functions so you have nothing to fear.

*So how you are doing this*?
tl;dr: You give us
```javascript
{
    createdCallback,
    attachedCallback,
    detachedCallback
}
```

and we will run it with the native `customElements` or `document.registerElement` if available. If not (e.g. in IE11) we will use a standard mechanism with `MutationObserver` and `setPrototypeOf` to enable the same behaviour.


## Do you ship this with ShadowDOM?

This has nothing to do with a polyfill. This is a wrapper that works in IE11, Chrome, Firefox, Safari and could eventually  live near a polyfill of your choice. Or in other words: No, this does not come with a ShadowDOM polyfill but also does not prevent you from using ShadowDOM (as written above: we are not changing existing code).

---------

## Usage / Documentation:

TODO
