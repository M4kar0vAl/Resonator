class Header {
    selectors = {
        root: '[data-js-header]',
        overlay: '[data-js-header-overlay]',
        burgerButton: '[data-js-header-burger-button]'
    }

    stateClasses = {
        isActve: 'is-active' 
    }

    initialState = {
        isOveralyActive: false
    }

    constructor() {
        this.initializeElement()
        this.getProxyState()
        this.bindEvents()
    }

    initializeElement() {
        this.root = document.querySelector(this.selectors.root)
        this.overlay = this.root.querySelector(this.selectors.overlay)
        this.burgerButton = this.root.querySelector(this.selectors.burgerButton)
    }

    getProxyState() {
        const handler = {
            set: (target, prop, value) => {
                const isSet = Reflect.set(target, prop, value)

                if (!isSet) {
                    return isSet
                }

                this.updateUI()

                return isSet
            } 
        }

        this.state = new Proxy(this.initialState, handler)
    }

    updateUI() {
        this.overlay.classList.toggle(this.stateClasses.isActve, this.state.isOveralyActive)
    }

    handleBurgerButtonClick() {
        this.state.isOveralyActive = !this.state.isOveralyActive
    }

    bindEvents() {
        this.burgerButton.addEventListener('click', () => this.handleBurgerButtonClick())
    }
}

export default Header