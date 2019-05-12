/// <reference types="Cypress" />

context('textTag - preInstalled', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8734/textTag-preinstalled.html')
    })
  
    // https://on.cypress.io/interacting-with-elements
    describe('When visiting the site', () => {
        it('should render the 1st custom elem', () => {
            cy.get('x-init')
                .should($elem => {
                    const elem = $elem[0];
                    const innerHTML = elem.innerHTML.trim();
                    if (innerHTML != 'attached') {
                        throw new Error(`Should have HTML 'attached' but is ${elem.innerHTML}`)
                    }
                });
        })
    });
  })
