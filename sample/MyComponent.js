Ocomponent.defineElement('x-component', (function(){
    // to support old OWF code we could have something like:
    // Util.requireDependencies()

    return class extends Ocomponent {
        onLoad() {
            console.log('onLoad: x-component');
            // you could start fetching data in here
        }

        domReady() {
            this.require([
                'x-other'
            ]).then(() => this.start());
        }

        start() {
            this.querySelector('div').innerHTML += ' <strong>World!</strong>';
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