export default function defineElement(elemName, options) {
    const convertToPlian = (html) => html.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const attrToText = (obj) =>
        new Proxy(obj, {
            get(target, prop) {
                return convertToPlian(target[prop]);
            },
        });
    let shadowRoot; // save shadowRoot
    customElements.define(
        elemName,
        class extends HTMLElement {
            constructor() {
                super();
                // save shadowRoot
                shadowRoot = this.attachShadow({ mode: options?.isShadowRootOpen ? "open" : "closed" });
                // set default value to element attribute
                Object.entries(options.attrs || {}).forEach(
                    ([k, v]) => !this.hasAttribute(k) && this.setAttribute(k, v)
                );
                // proxy for element attribute
                const that = this;
                this.$attrs = new Proxy(options.attrs, {
                    set(obj, prop, value) {
                        that.setAttribute(prop, value);
                        return true;
                    },
                    get(obj, prop) {
                        return that.getAttribute(prop);
                    },
                    deleteProperty(obj, prop) {
                        that.removeAttribure(prop);
                    },
                });
                const $attrs = attrToText(this.$attrs);
                shadowRoot.innerHTML = options?.render?.call(this, $attrs); // init render
                options?.shadow?.call(this, shadowRoot, $attrs); // handle shadowRoot
                Object.keys(options.methods || {}).forEach(
                    (methodName) => (this[methodName] = options?.methods[methodName]?.bind(this)) // bind methods
                );
            }
            static get observedAttributes() {
                // listen watch and attrs
                // only these listened attrs are reactive
                return Array.from(
                    new Set(Object.keys(options.attrs || {}).concat(...Object.keys(options.watch || {})))
                );
            }
            attributeChangedCallback(attr, oldVal, newVal) {
                if (oldVal === newVal) return; // do not handle if value of attribute is unchange

                options?.attributeChangedCallback?.call(this, attr, oldVal, newVal); // forward change
                if (options.watch && typeof options.watch[attr] === "function") options.watch[attr](oldVal, newVal);

                const $attrs = attrToText(this.$attrs);
                shadowRoot.innerHTML = options.render.call(this, $attrs); // the rendered data are only from $attrs
                options?.shadow?.call(this, shadowRoot, $attrs); // handle shadowRoot !important
            }
            connectedCallback(...args) {
                options?.connectedCallback?.apply(this, args);
            }
            disconnectedCallback(...args) {
                options?.disconnectedCallback?.apply(this, args);
            }
            adoptedCallback(...args) {
                options?.adoptedCallback?.apply(this, args);
            }
        }
    );

    return customElements.whenDefined(elemName);
}
