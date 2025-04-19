import Media from "./Media.js"

const rootSelector = '[data-js-audio-wrapper]'

class Audio extends Media {
    initializeSelectors() {
        this.selectors = {
            root: rootSelector,
            media: '[data-js-audio]',
            playButton: '[data-js-audio-play-button]',
            rewindButton: '[data-js-audio-rewind-button]',
            fastForwardButton: '[data-js-audio-fast-forward-button]',
            track: '[data-js-audio-track]',
            currentTime: '[data-js-audio-current-time]',
            totalTime: '[data-js-audio-total-time]',
            volumeButton: '[data-js-audio-volume-button]',
            volumeInput: '[data-js-audio-volume-input]'
        }
    }
}

class AudioCollection {
    constructor() {
        this.init()
    }

    init() {
        document.querySelectorAll(rootSelector).forEach((audio) => {
            new Audio(audio)
        })
    }
}

export default AudioCollection
