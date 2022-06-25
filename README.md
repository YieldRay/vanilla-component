# vanilla-component

A super light weight reactive wrapper for web component  
DO NOT USE IN PRODUCTION

# usage

```js
import defineElement from "./vanilla-component.js";

defineElement("my-element", {
    // `this` is always bind to the custom element itself
    render(attrs) {
        // values in attrs has been filtered, any < become &lt; and > become &gt;
        // if need to render HTML, use <slot> instead
        return `
                <style>
                    h1 {color: blue;}
                    div {border: 1px solid black; border-radius:8px; margin: 8px; padding :8px;}
                </style>
                <div>
                    <h1>${attrs.title}</h1>
                    <p>${attrs.attrname}</p>
                    <p><slot></slot><p>
                </div>`;
    },
    attrs: {
        // the attr can only be string!!!
        // only attributes declared in attrs and watch are reactive!!!
        title: "<my-element />",
        attrname: "default",
    },
    watch: {
        // attribute change listener, attrname must be lowercase
        // the watched attribute can distinct from attributes declared in attrs, and will add to be reactive
        // which means change of watched value will also cause re-render
        attrname: (oldVal, newVal) => {
            console.log("props.attrname()", oldVal, newVal);
        },
    },
    methods: {
        // set method to the element instance
        beNULL() {
            // shadowRoot is available only if isShadowRootOpen set to true
            this.shadowRoot.innerHTML = "null";
        },
    },
    isShadowRootOpen: true,
    shadow(shadowRoot, attrs) {
        // after first render, do something with the shadowRoot
        // this is always available no matter what `isShadowRootOpen` is.
        // values in attrs has been filtered, any < become &lt; and > become &gt;
    },
    // lifecycle hooks
    connectedCallback() {
        console.log("connectedCallback()");
    },
    disconnectedCallback() {
        console.log("disconnectedCallback()");
    },
    adoptedCallback() {
        console.log("adoptedCallback()");
    },
    attributeChangedCallback() {
        console.log("attributeChangedCallback()");
    },
}).then(() => console.log(`the element has been defined`));
```

and then, you can use

```html
<my-element id="x" title="Title" attrname="not default"></my-element>
```

you can change the attrs like:

```js
x.$attrs.title = "new title";
```

then the shadow DOM in it will re-render

call the defined method in options like:

```js
x.beNULL();
```
