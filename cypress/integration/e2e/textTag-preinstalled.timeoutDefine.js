/// <reference types="Cypress" />

context('textTag - preInstalled, mixed Definition locations', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8734/textTag-preinstalled.timeoutDefine.html')
    })

    describe('When visiting the site', () => {
        it('should render x-inner within x-init', () => {
            cy.get('x-init')
                .should($elem => {
                    const elem = $elem[0];
                    const html = elem.innerHTML.trim();
                    const expectedHtml = '<x-late></x-late>';
                    if (html != expectedHtml) {
                        throw new Error(`Should have Text '${expectedHtml}' but is ${html}`);
                    }

                    if (!elem.querySelector('x-late')) {
                        throw new Error('Does not have the x-late element inside');
                    }
                });
        });

        it('should render x-late after waiting for 1500ms', () => {
            cy.wait(1500)
            .then(() => {
                cy.get('x-init')
                    .should($elem => {
                        const elem = $elem[0];
                        const text = elem.textContent.trim();
                        const expectedText = 'late-rendered';
                        if (text != expectedText) {
                            throw new Error(`Should have Text '${expectedText}' but is ${text}`);
                        }

                        if (!elem.querySelector('x-late')) {
                            throw new Error('Does not have the x-late element inside');
                        }
                    });
            })
        });
    });
})
