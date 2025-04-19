import Media from "./Media.js"
import MatchMedia from "./MatchMedia.js"

const rootSelector = '[data-js-video-wrapper]'

class Video extends Media {
    stateClasses = {
        ...this.stateClasses,
        fullscreen: 'fullscreen',
        active: 'active',
        isPaused: 'is-paused',
    }

    initializeSelectors() {
        this.selectors = {
            root: rootSelector,
            media: '[data-js-video]',
            playButton: '[data-js-video-play-button]',
            rewindButton: '[data-js-video-rewind-button]',
            fastForwardButton: '[data-js-video-fast-forward-button]',
            track: '[data-js-video-track]',
            currentTime: '[data-js-video-current-time]',
            totalTime: '[data-js-video-total-time]',
            volumeButton: '[data-js-video-volume-button]',
            volumeInput: '[data-js-video-volume-input]',
            fullscreenButton: '[data-js-video-fullscreen-button]'
        }
    }

    initializeMedia(mediaElement) {
        super.initializeMedia(mediaElement)
        this.fullscreenButtonElement = this.root.querySelector(this.selectors.fullscreenButton)
    }

    initializeState() {
        super.initializeState()
        this.initialState.isFullscreen = false
        this.initialState.activeTimeoutID = null
    }

    getProxyState() {
        super.getProxyState() // this.state will become a proxy

        const handler = {
            set: (target, prop, value) => {
                const isSet = Reflect.set(target, prop, value)

                if (!isSet) {
                    return isSet
                }

                switch (prop) {
                    case 'isFullscreen':
                        this.toggleFullscreen()
                        break;
                
                    case 'activeTimeoutID':
                        this.toggleIsActive()
                        break;

                    default:
                        break;
                }

                return isSet
            }
        }

        // extend super class' proxy by wrapping it with another proxy with its own handler
        // when Reflect is called it will call super class' proxy first and then will proceed with the current handler
        this.state = new Proxy(this.state, handler)
    }

    toggleIsPlaying() {
        super.toggleIsPlaying()

        const { isPlaying } = this.state

        this.root.classList.toggle(this.stateClasses.isPaused, !isPlaying)
    }

    handleEnded() {
        super.handleEnded()
        this.hideControls()
    }

    onStartSeeking() {
        super.onStartSeeking()
        this.clearControlsHideTimeout()
    }

    handleSeeked() {
        super.handleSeeked()
        this.showControls()
    }

    handleActionButtonClick() {
        super.handleActionButtonClick()
        this.resetControlsHideTimer()
    }

    toggleIsActive() {
        const { activeTimeoutID } = this.state
        
        this.root.classList.toggle(this.stateClasses.active, activeTimeoutID !== null)
    }

    setControlsHideTimeout(timeout=3000) {
        return setTimeout(() => {
            this.state.activeTimeoutID = null
        }, timeout)
    }

    clearControlsHideTimeout() {
        if (this.state.activeTimeoutID) {
            clearTimeout(this.state.activeTimeoutID)
        }
    }

    resetControlsHideTimer(timeout=3000) {
        this.clearControlsHideTimeout()
        this.showControls(timeout)
    }

    showControls(timeout=3000) {
        this.state.activeTimeoutID = this.setControlsHideTimeout(timeout)
    }

    hideControls() {
        this.clearControlsHideTimeout()
        this.state.activeTimeoutID = null
    }

    toggleFullscreen() {
        const { isFullscreen } = this.state
        const { fullscreen } = this.stateClasses

        this.root.classList.toggle(fullscreen, isFullscreen)
        document.documentElement.classList.toggle(fullscreen, isFullscreen)
    }

    handleFullscreenButtonClick() {
        if (this.state.isFullscreen) {
            document.exitFullscreen()
        } else {
            this.root.requestFullscreen()
        }

        this.dispatchMediaActionButtonClickedEvent(this.fullscreenButtonElement)
    }

    handleFullscreenChange() {
        this.state.isFullscreen = Boolean(document.fullscreenElement)
    }

    handlePointerClick() {
        // event should be triggered only on non-hover devices
        if (!MatchMedia.nonHoverDevice.matches) {
            return
        }

        if (this.state.activeTimeoutID) {
            this.hideControls()
        } else {
            this.showControls()
        }
    }

    handlePointerMove() {
        if (this.state.isSeeking) {
            return
        }

        this.resetControlsHideTimer()
    }

    bindEvents() {
        super.bindEvents()

        this.root.addEventListener('fullscreenchange', () => this.handleFullscreenChange())
        this.root.addEventListener('pointermove', () => this.handlePointerMove())
        this.mediaElement.addEventListener('pointerup', () => this.handlePointerClick())
        
        if (this.fullscreenButtonElement) {
            this.fullscreenButtonElement.addEventListener('click', () => this.handleFullscreenButtonClick())
        }
    }
}

class VideoCollection {
    constructor() {
        this.init()
    }

    init() {
        document.querySelectorAll(rootSelector).forEach((video) => {
            new Video(video)
        })
    }
}

export default VideoCollection