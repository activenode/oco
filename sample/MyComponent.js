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

            this.on('foo', function(e) {
                console.log('event222 got cha', e);
            });
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
            this.start();
        }

        start() {
            this.innerHTML = 'Hello I am an automatically mounted <strong>x-other</strong> component';
        }
    };
}()));