const rootSelector = '[data-js-slider]'

class Slider {
    selectors = {
        root: rootSelector,
        slidesList: '[data-js-slider-list]',
        slide: '[data-js-slider-slide]',
        paginationButton: '[data-js-slider-pagination-button]',
    }

    stateClasses = {
        isActive: 'is-active'
    }

    constructor(sliderElement) {
        this.initializeSlider(sliderElement)
        this.initializeState()
        this.initializeInserectionObserver()
        this.bindEvents()
    }

    initializeSlider(sliderElement) {
        this.slider = sliderElement
        this.slidesListElement = this.slider.querySelector(this.selectors.slidesList)
        this.slideElements = Array.from(this.slider.querySelectorAll(this.selectors.slide))
        this.paginationButtonElements = Array.from(this.slider.querySelectorAll(this.selectors.paginationButton))
    }

    initializeState() {
        const currentSlideIndex = this.paginationButtonElements.findIndex((paginationButtonElement) => {
            return paginationButtonElement.classList.contains(this.stateClasses.isActive)
        })

        this.state = {
            activeSlideIndex: currentSlideIndex
        }
    }

    initializeInserectionObserver() {
        const options = {
            root: this.slidesListElement,
            threshold: 1
        }

        const observer = new IntersectionObserver((entries, observer) => this.slideIntersectionObserverCallback(entries, observer), options)
        this.slideElements.forEach((slide) => observer.observe(slide))
    }

    slideIntersectionObserverCallback(entries, observer) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const { target } = entry

                this.state.activeSlideIndex = this.slideElements.findIndex((slide) => slide === target)
                this.updateUI()
            }
        })
    }

    updateUI() {
        const { activeSlideIndex } = this.state
        
        this.paginationButtonElements.forEach((paginationButtonElement, index) => {
            const isActive = index === activeSlideIndex

            paginationButtonElement.classList.toggle(this.stateClasses.isActive, isActive)
        })
    }

    onPaginationButtonClick(index) {
        if (index === this.state.activeSlideIndex) {
            return
        }
        
        this.slideElements[index].scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'})
    }

    bindEvents() {
        this.paginationButtonElements.forEach((paginationButtonElement, index) => {
            paginationButtonElement.addEventListener('click', () => this.onPaginationButtonClick(index))
        })
    }
}

class SliderCollection {
    constructor() {
        this.init()
    }

    init() {
        document.querySelectorAll(rootSelector).forEach((slider) => {
            new Slider(slider)
        })
    }
}

export default SliderCollection
