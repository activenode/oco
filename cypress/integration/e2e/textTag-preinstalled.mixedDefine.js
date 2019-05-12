/// <reference types="Cypress" />

context('textTag - preInstalled, mixed Definition locations', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8734/textTag-preinstalled.mixedDefine.html')
    })

    describe('When visiting the site', () => {
        it('should render x-inner within x-init', () => {
            cy.get('x-init')
                .should($elem => {
                    const elem = $elem[0];
                    const text = $elem.text().trim();
                    if (text != 'attachedInner') {
                        throw new Error(`Should have Text 'attachedInner' but is ${text}`)
                    }

                    if (!elem.querySelector('x-inner')) {
                        throw new Error('Does not have the x-inner element inside');
                    }
                });
        });
    });
  })
