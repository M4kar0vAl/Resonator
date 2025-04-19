class Media {    
    stateClasses = {
        isPlaying: 'is-playing',
        muted: 'muted',
    }

    customEventsNames = {
        mediaActionButtonClicked: 'mediaActionButtonClicked'
    }

    constructor(mediaElement) {
        this.initializeSelectors()
        this.initializeMedia(mediaElement)
        this.initializeState()
        this.getProxyState()
        this.bindEvents()
        this.setVolume(this.state.volume)
    }

    initializeSelectors() {
        // do not use class attribute 'selectors', because js doesn't handle overriden class attributes correctly,
        // if they are used in parent class' constructor
        this.selectors = {
            root: '',
            media: '',
            playButton: '',
            rewindButton: '',
            fastForwardButton: '',
            track: '',
            currentTime: '',
            totalTime: '',
            volumeButton: '',
            volumeInput: '',
        }
    }

    initializeMedia(mediaElement) {
        this.root = mediaElement
        this.mediaElement = this.root.querySelector(this.selectors.media)
        this.playButtonElement = this.root.querySelector(this.selectors.playButton)
        this.rewindButtonElement = this.root.querySelector(this.selectors.rewindButton)
        this.fastForwardButtonElement = this.root.querySelector(this.selectors.fastForwardButton)
        this.trackElement = this.root.querySelector(this.selectors.track)
        this.currentTimeElement = this.root.querySelector(this.selectors.currentTime)
        this.totalTimeElement = this.root.querySelector(this.selectors.totalTime)
        this.volumeButtonElement = this.root.querySelector(this.selectors.volumeButton)
        this.volumeInputElement = this.root.querySelector(this.selectors.volumeInput)
    }

    initializeState() {
        this.initialState = {
            isPlaying: false,
            muted: false,
            isSeeking: false,
            currentTime: 0,
            volume: 1,
            isVolumeSeeking: false,
        }
    }

    getProxyState() {
        const handler = {
            set: (target, prop, value) => {
                const isSet = Reflect.set(target, prop, value)

                if (!isSet) {
                    return isSet
                }

                switch (prop) {
                    case 'isPlaying':
                        this.toggleIsPlaying()
                        break;

                    case 'currentTime':
                        this.updateCurrentTimeDOM()

                        if (!target.isSeeking) {
                            this.updateMediaTrackDOM()
                        }

                        break;
                
                    case 'volume':
                        if (!target.isVolumeSeeking) {
                            this.updateVolumeDOM()
                        }
                        break;
                        
                    case 'muted':
                        this.updateVolumeDOM()
                        break;

                    default:
                        break;
                }

                return isSet
            }
        }
        
        this.state = new Proxy(this.initialState, handler)
    }

    play() {
        this.mediaElement.play()
        this.state.isPlaying = true
    }

    pause() {
        this.mediaElement.pause()
        this.state.isPlaying = false
    }

    toggleIsPlaying() {
        const { isPlaying } = this.state

        this.root.classList.toggle(this.stateClasses.isPlaying, isPlaying)
    }

    rewind() {
        let newTime = this.state.currentTime - 10
        newTime = newTime > 0 ? newTime : 0
        
        this.setCurrentTime(newTime)
    }

    fastForward() {
        let newTime = this.state.currentTime + 10
        newTime = newTime < this.duration ? newTime : this.duration
        
        this.setCurrentTime(newTime)
    }

    mute() {
        this.state.muted = true
        this.mediaElement.muted = true
        this.root.classList.add(this.stateClasses.muted)
    }

    unmute() {
        this.state.muted = false
        this.mediaElement.muted = false
        this.root.classList.remove(this.stateClasses.muted)
    }

    setCurrentTime(value) {
        this.state.currentTime = value
        this.mediaElement.currentTime = value
    }

    setVolume(value) {
        this.state.volume = value
        this.mediaElement.volume = value
    }

    getHumanReadableTime(seconds) {
        const outputArray = []

        const hours = Math.floor(seconds / 3600)
        seconds = seconds % 3600

        if (hours > 0) {
            const hoursString = hours > 9 ? `${hours}` : `0${hours}`
            outputArray.push(hoursString)
        }

        const minutes = Math.floor(seconds / 60)
        const minutesString = minutes > 9 ? `${minutes}` : `0${minutes}`
        outputArray.push(minutesString)

        seconds = Math.floor(seconds % 60)
        const secondsString = seconds > 9 ? `${seconds}` : `0${seconds}`
        outputArray.push(secondsString)

        return outputArray.join(':')
    }

    updateCurrentTimeDOM() {
        if (!this.currentTimeElement) {
            return
        }

        this.currentTimeElement.innerText = this.getHumanReadableTime(this.state.currentTime)
    }
    
    updateMediaTrackDOM() {
        if (!this.trackElement) {
            return
        }

        this.trackElement.value = this.state.currentTime / this.duration * 100
    }

    updateVolumeDOM() {
        if (!this.volumeInputElement) {
            return
        }

        let newValue = this.state.muted ? 0 : this.state.volume

        this.volumeInputElement.value = newValue
    }

    dispatchMediaActionButtonClickedEvent(actionButtonElement) {
        const mediaActionButtonClickedEvent = new Event(this.customEventsNames.mediaActionButtonClicked, { bubbles: true })
        actionButtonElement.dispatchEvent(mediaActionButtonClickedEvent)
    }

    handlePlayButtonClick() {
        if (this.state.isPlaying) {
            this.pause()
        } else {
            this.play()
        }

        this.dispatchMediaActionButtonClickedEvent(this.playButtonElement)
    }

    handleRewindButtonClick() {
        this.rewind()
        this.dispatchMediaActionButtonClickedEvent(this.rewindButtonElement)
    }
    
    handleFastForwardButtonClick() {
        this.fastForward()
        this.dispatchMediaActionButtonClickedEvent(this.fastForwardButtonElement)
    }

    handleVolumeButtonClick() {
        if (this.state.muted) {
            this.unmute()
        } else {
            this.mute()
        }

        this.dispatchMediaActionButtonClickedEvent(this.volumeButtonElement)
    }

    handleLoadedMetadata() {
        // if total time is not displayed for the current media element
        if (!this.totalTimeElement) {
            return
        }

        this.duration = this.mediaElement.duration
        this.totalTimeElement.innerText = this.getHumanReadableTime(this.duration)
    }

    handleTimeUpdate() {
        this.state.currentTime = this.mediaElement.currentTime
    }

    handleEnded() {
        this.state.isPlaying = false
        this.setCurrentTime(0)
    }

    onStartSeeking() {
        this.mediaElement.pause()
    }

    handleSeeking(event) {
        const { target } = event

        // Pause and update state only if it hasn't been updated yet.
        // Do not use this.pause(), because it is necessary to preserve isPlaying state and
        // there is no need to toggle css "is-playing" class
        if (!this.state.isSeeking) {
            this.state.isSeeking = true
            this.onStartSeeking()
        }
        
        // target.value is % of duration
        const newTime = target.value * this.duration / 100
        this.setCurrentTime(newTime)
    }

    handleSeeked() {
        this.state.isSeeking = false
        
        // if the audio was playing before the user started to seek
        if (this.state.isPlaying) {
            this.mediaElement.play()
        }
    }

    handleVolumeSeeking(event) {
        const { target } = event
        
        if (!this.state.isVolumeSeeking) {
            this.state.isVolumeSeeking = true
        }

        this.setVolume(target.value)
    }

    handleVolumeSeeked() {
        this.state.isVolumeSeeking = false
    }

    handleActionButtonClick() {}

    bindEvents() {
        this.root.addEventListener(this.customEventsNames.mediaActionButtonClicked, () => this.handleActionButtonClick())

        this.mediaElement.addEventListener('loadedmetadata', () => this.handleLoadedMetadata())
        this.mediaElement.addEventListener('timeupdate', () => this.handleTimeUpdate())
        this.mediaElement.addEventListener('ended', () => this.handleEnded())

        const playButtonElements = [...this.root.querySelectorAll(this.selectors.playButton)]
        playButtonElements.forEach((playButtonElement) => {
            playButtonElement.addEventListener('click', () => this.handlePlayButtonClick())
        })

        if (this.rewindButtonElement) {
            this.rewindButtonElement.addEventListener('click', () => this.handleRewindButtonClick())
        }

        if (this.fastForwardButtonElement) {
            this.fastForwardButtonElement.addEventListener('click', () => this.handleFastForwardButtonClick())
        }

        if (this.volumeButtonElement) {
            this.volumeButtonElement.addEventListener('click', () => this.handleVolumeButtonClick())
        }

        if (this.trackElement) {
            this.trackElement.addEventListener('input', (event) => this.handleSeeking(event))
            this.trackElement.addEventListener('change', () => this.handleSeeked())
        }

        if (this.volumeInputElement) {
            this.volumeInputElement.addEventListener('input', (event) => this.handleVolumeSeeking(event))
            this.volumeInputElement.addEventListener('change', () => this.handleVolumeSeeked())
        }
    }
}

export default Media
