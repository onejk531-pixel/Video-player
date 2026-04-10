import "./styles.css";

class AdvancedVideoPlayer {
  constructor() {
    this.video = document.getElementById("video");
    this.wrapper = document.getElementById("videoWrapper");
    this.controls = document.getElementById("controls");
    this.overlay = document.getElementById("overlay");
    this.progressContainer = document.getElementById("progressContainer");
    this.progressBar = document.getElementById("progressBar");
    this.progressEl = document.getElementById("progress");
    this.bufferedEl = document.getElementById("buffered");
    this.progressHandle = document.getElementById("progressHandle");
    this.timeTooltip = document.getElementById("timeTooltip");
    this.thumbnailPreview = document.getElementById("thumbnailPreview");
    this.thumbnailCanvas = document.getElementById("thumbnailCanvas");
    this.thumbnailCtx = this.thumbnailCanvas.getContext("2d");
    this.timeDisplay = document.getElementById("timeDisplay");
    this.playPauseBtn = document.getElementById("playPauseBtn");
    this.centerPlayBtn = document.getElementById("centerPlayBtn");
    this.replayBtn = document.getElementById("replayBtn");
    this.rewindBtn = document.getElementById("rewindBtn");
    this.forwardBtn = document.getElementById("forwardBtn");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.muteBtn = document.getElementById("muteBtn");
    this.volumeSlider = document.getElementById("volumeSlider");
    this.volumeControl = document.querySelector(".volume-control");
    this.speedBtn = document.getElementById("speedBtn");
    this.speedMenu = document.getElementById("speedMenu");
    this.qualityBtn = document.getElementById("qualityBtn");
    this.qualityMenu = document.getElementById("qualityMenu");
    this.loopBtn = document.getElementById("loopBtn");
    this.loopMenu = document.getElementById("loopMenu");
    this.autoplayBtn = document.getElementById("autoplayBtn");
    this.pipBtn = document.getElementById("pipBtn");
    this.fullscreenBtn = document.getElementById("fullscreenBtn");
    this.ccBtn = document.getElementById("ccBtn");
    this.shortcutsPanel = document.getElementById("shortcutsPanel");
    this.playlistPanel = document.getElementById("playlistPanel");
    this.playlist = document.getElementById("playlist");
    this.playlistCount = document.getElementById("playlistCount");
    this.videoUrlInput = document.getElementById("videoUrlInput");
    this.addVideoBtn = document.getElementById("addVideoBtn");
    this.playlistSearch = document.getElementById("playlistSearch");
    this.shuffleBtn = document.getElementById("shuffleBtn");
    this.exportBtn = document.getElementById("exportBtn");
    this.importInput = document.getElementById("importInput");
    this.toastContainer = document.getElementById("toastContainer");
    this.themeToggle = document.getElementById("themeToggle");
    this.colorPicker = document.getElementById("colorPicker");
    this.colorPickerBtn = document.getElementById("colorPickerBtn");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.skipIndicator = document.getElementById("skipIndicator");
    this.captionsDisplay = document.getElementById("captionsDisplay");
    this.videoTitle = document.getElementById("videoTitle");
    this.videoResolution = document.getElementById("videoResolution");
    this.videoDuration = document.getElementById("videoDuration");
    this.resumeModal = document.getElementById("resumeModal");
    this.resumeTime = document.getElementById("resumeTime");
    this.fileInput = document.getElementById("fileInput");
    this.cloudFileInput = document.getElementById("cloudFileInput");
    this.cloudUpload = document.getElementById("cloudUpload");
    this.uploadProgress = document.getElementById("uploadProgress");
    this.progressFill = document.getElementById("progressFill");
    this.progressText = document.getElementById("progressText");
    this.uploadStatus = document.getElementById("uploadStatus");

    this.cloudName = localStorage.getItem("cloudName") || "";
    this.cloudUploadPreset = localStorage.getItem("cloudUploadPreset") || "";

    this.playlistItems = [];
    this.currentIndex = 0;
    this.currentQuality = "1080";
    this.currentSpeed = 1;
    this.loopMode = "none";
    this.autoplay = true;
    this.ccEnabled = false;
    this.isControlsVisible = true;
    this.hideControlsTimeout = null;
    this.isSeeking = false;
    this.lastVolume = 1;
    this.savedPositions = {};
    this.thumbnails = {};
    this.isDragging = false;
    this.lastClickTime = 0;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
    this.loadSamplePlaylist();
    this.loadFromStorage();
    this.updatePlayPauseUI();
    this.updateVolumeUI();
    this.updateLoopUI();
    this.updateAutoplayUI();
    this.setKeyboardShortcuts();
  }

  bindEvents() {
    this.video.addEventListener("click", (e) => this.onVideoClick(e));
    this.centerPlayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.togglePlay();
    });
    this.replayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.replay();
    });
    
    this.playPauseBtn.addEventListener("click", () => this.togglePlay());
    this.rewindBtn.addEventListener("click", () => this.skip(-10));
    this.forwardBtn.addEventListener("click", () => this.skip(10));
    this.prevBtn.addEventListener("click", () => this.playPrevious());
    this.nextBtn.addEventListener("click", () => this.playNext());
    
    this.video.addEventListener("timeupdate", () => this.updateProgress());
    this.video.addEventListener("progress", () => this.updateBuffered());
    this.video.addEventListener("loadedmetadata", () => this.onMetadataLoaded());
    this.video.addEventListener("ended", () => this.onEnded());
    this.video.addEventListener("play", () => this.updatePlayPauseUI());
    this.video.addEventListener("pause", () => this.updatePlayPauseUI());
    this.video.addEventListener("volumechange", () => this.updateVolumeUI());
    this.video.addEventListener("ratechange", () => this.updateSpeedUI());
    this.video.addEventListener("waiting", () => this.showLoading(true));
    this.video.addEventListener("canplay", () => this.showLoading(false));
    this.video.addEventListener("enterpictureinpicture", () => this.pipBtn.classList.add("active"));
    this.video.addEventListener("leavepictureinpicture", () => this.pipBtn.classList.remove("active"));
    this.video.addEventListener("error", () => this.showToast("Video error occurred"));

    this.progressContainer.addEventListener("mousedown", (e) => this.startSeek(e));
    this.progressContainer.addEventListener("mousemove", (e) => this.onProgressHover(e));
    this.progressContainer.addEventListener("mouseleave", () => this.onProgressLeave());
    document.addEventListener("mousemove", (e) => this.onSeek(e));
    document.addEventListener("mouseup", () => this.endSeek());

    this.muteBtn.addEventListener("click", () => this.toggleMute());
    this.volumeSlider.addEventListener("input", (e) => this.setVolume(e.target.value));

    this.loopBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu(this.loopMenu);
    });
    this.loopMenu.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => this.setLoopMode(btn.dataset.loop));
    });

    this.autoplayBtn.addEventListener("click", () => this.toggleAutoplay());

    this.speedBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu(this.speedMenu);
    });
    this.speedMenu.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => this.setSpeed(parseFloat(btn.dataset.speed)));
    });

    this.qualityBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu(this.qualityMenu);
    });
    this.qualityMenu.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => this.setQuality(btn.dataset.quality));
    });

    this.ccBtn.addEventListener("click", () => this.toggleCaptions());
    this.pipBtn.addEventListener("click", () => this.togglePiP());
    this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());

    document.addEventListener("fullscreenchange", () => this.updateFullscreenUI());
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".loop-control") && !e.target.closest(".speed-control") && !e.target.closest(".quality-control")) {
        this.loopMenu.classList.remove("open");
        this.speedMenu.classList.remove("open");
        this.qualityMenu.classList.remove("open");
      }
    });

    this.wrapper.addEventListener("mousemove", () => this.showControls());
    this.wrapper.addEventListener("mouseleave", () => this.scheduleHideControls());
    this.wrapper.addEventListener("dblclick", (e) => this.onDoubleClick(e));

    this.themeToggle.addEventListener("click", () => this.toggleTheme());
    this.colorPicker.addEventListener("input", (e) => this.setAccentColor(e.target.value));

    this.addVideoBtn.addEventListener("click", () => this.addVideo());
    this.videoUrlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addVideo();
    });
    this.playlistSearch.addEventListener("input", () => this.filterPlaylist());
    this.shuffleBtn.addEventListener("click", () => this.shufflePlaylist());
    this.exportBtn.addEventListener("click", () => this.exportPlaylist());
    this.importInput.addEventListener("change", (e) => this.importPlaylist(e));
    this.fileInput.addEventListener("change", (e) => this.openLocalFiles(e));
    this.cloudFileInput.addEventListener("change", (e) => this.uploadToCloud(e));

    this.resumeModal.querySelector("#resumeContinue").addEventListener("click", () => this.resumePlayback());
    this.resumeModal.querySelector("#resumeStart").addEventListener("click", () => this.startOver());

    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      this.handleKeyboard(e);
    });
  }

  onVideoClick(e) {
    const now = Date.now();
    if (now - this.lastClickTime < 300) {
      this.toggleFullscreen();
    } else {
      this.togglePlay();
    }
    this.lastClickTime = now;
  }

  onDoubleClick(e) {
    const rect = this.wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;
    
    if (x < third) {
      this.skip(-10);
    } else if (x > third * 2) {
      this.skip(10);
    } else {
      this.toggleFullscreen();
    }
  }

  togglePlay() {
    if (this.video.paused || this.video.ended) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  replay() {
    this.video.currentTime = 0;
    this.video.play();
  }

  skip(seconds) {
    const newTime = Math.max(0, Math.min(this.video.duration, this.video.currentTime + seconds));
    this.video.currentTime = newTime;
    
    this.showSkipIndicator(seconds);
    this.savePosition();
  }

  showSkipIndicator(seconds) {
    const direction = this.skipIndicator.querySelector(".skip-direction");
    const secsText = this.skipIndicator.querySelector(".skip-seconds");
    
    direction.innerHTML = seconds < 0 
      ? '<svg viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>';
    
    secsText.textContent = `${Math.abs(seconds)}s`;
    this.skipIndicator.classList.add("visible");
    
    setTimeout(() => {
      this.skipIndicator.classList.remove("visible");
    }, 500);
  }

  updateProgress() {
    if (this.video.duration && !this.isSeeking) {
      const percent = (this.video.currentTime / this.video.duration) * 100;
      this.progressEl.style.width = `${percent}%`;
      this.progressHandle.style.left = `${percent}%`;
      this.timeDisplay.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
    }
  }

  updateBuffered() {
    if (this.video.buffered.length > 0) {
      const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
      const percent = (bufferedEnd / this.video.duration) * 100;
      this.bufferedEl.style.width = `${percent}%`;
    }
  }

  onMetadataLoaded() {
    this.timeDisplay.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
    this.videoDuration.textContent = `Duration: ${this.formatTime(this.video.duration)}`;
    
    if (this.video.videoWidth && this.video.videoHeight) {
      const height = this.video.videoHeight;
      let resolution = "Unknown";
      if (height >= 2160) resolution = "4K";
      else if (height >= 1440) resolution = "1440p";
      else if (height >= 1080) resolution = "1080p";
      else if (height >= 720) resolution = "720p";
      else if (height >= 480) resolution = "480p";
      else if (height >= 360) resolution = "360p";
      else resolution = `${height}p`;
      
      this.videoResolution.textContent = `Resolution: ${resolution}`;
    }
    
    this.generateThumbnail();
    this.checkResume();
  }

  generateThumbnail() {
    if (this.thumbnails[this.video.src]) return;
    
    this.video.currentTime = this.video.duration * 0.1;
    
    const handler = () => {
      this.thumbnailCanvas.width = 160;
      this.thumbnailCanvas.height = 90;
      this.thumbnailCtx.drawImage(this.video, 0, 0, 160, 90);
      this.thumbnails[this.video.src] = this.thumbnailCanvas.toDataURL();
      this.video.removeEventListener("seeked", handler);
      this.video.currentTime = 0;
    };
    
    this.video.addEventListener("seeked", handler);
  }

  checkResume() {
    const saved = this.savedPositions[this.video.src];
    if (saved && saved > 10 && saved < this.video.duration * 0.95) {
      this.resumeTime.textContent = this.formatTime(saved);
      this.resumeModal.classList.add("visible");
    }
  }

  resumePlayback() {
    const saved = this.savedPositions[this.video.src] || 0;
    this.video.currentTime = saved;
    this.resumeModal.classList.remove("visible");
    this.video.play();
  }

  startOver() {
    this.video.currentTime = 0;
    this.resumeModal.classList.remove("visible");
    this.video.play();
  }

  onEnded() {
    this.wrapper.classList.add("ended");
    this.savePosition();
    
    if (this.loopMode === "video") {
      this.replay();
    } else if (this.autoplay && this.currentIndex < this.playlistItems.length - 1) {
      this.playNext();
    } else if (this.loopMode === "playlist" && this.currentIndex === this.playlistItems.length - 1) {
      this.loadVideo(0);
      this.video.play();
    }
  }

  startSeek(e) {
    this.isSeeking = true;
    this.isDragging = true;
    this.updateSeekPosition(e);
  }

  onSeek(e) {
    if (!this.isDragging) return;
    this.updateSeekPosition(e);
  }

  updateSeekPosition(e) {
    const rect = this.progressContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const time = (percent / 100) * this.video.duration;
    
    this.progressEl.style.width = `${percent}%`;
    this.progressHandle.style.left = `${percent}%`;
    this.video.currentTime = time;
    this.updateThumbnailPreview(percent);
  }

  endSeek() {
    if (this.isDragging) {
      this.isDragging = false;
      this.isSeeking = false;
      this.savePosition();
      this.thumbnailPreview.classList.remove("visible");
    }
  }

  onProgressHover(e) {
    const rect = this.progressContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const time = (percent / 100) * this.video.duration;
    
    this.timeTooltip.style.left = `${percent}%`;
    this.timeTooltip.textContent = this.formatTime(time);
    this.updateThumbnailPreview(percent);
  }

  updateThumbnailPreview(percent) {
    this.thumbnailPreview.style.left = `${percent}%`;
    this.thumbnailPreview.classList.add("visible");
    
    const thumb = this.thumbnails[this.video.src];
    if (thumb) {
      const img = new Image();
      img.src = thumb;
      img.onload = () => {
        this.thumbnailCtx.clearRect(0, 0, 160, 90);
        this.thumbnailCtx.drawImage(img, 0, 0, 160, 90);
      };
    }
  }

  onProgressLeave() {
    this.timeTooltip.style.opacity = "0";
    this.thumbnailPreview.classList.remove("visible");
  }

  updatePlayPauseUI() {
    const isPaused = this.video.paused;
    this.playPauseBtn.classList.toggle("active", !isPaused);
    this.playPauseBtn.querySelector(".play-icon").style.display = isPaused ? "block" : "none";
    this.playPauseBtn.querySelector(".pause-icon").style.display = isPaused ? "none" : "block";
    this.wrapper.classList.toggle("paused", isPaused);
    this.wrapper.classList.remove("ended");
  }

  updateVolumeUI() {
    const level = this.video.muted || this.video.volume === 0 ? "mute" 
      : this.video.volume < 0.5 ? "low" : "high";
    this.volumeControl.dataset.level = level;
    this.volumeSlider.value = this.video.muted ? 0 : this.video.volume;
  }

  toggleMute() {
    if (this.video.muted) {
      this.video.muted = false;
      this.video.volume = this.lastVolume || 0.5;
    } else {
      this.lastVolume = this.video.volume;
      this.video.muted = true;
    }
    this.showToast(this.video.muted ? "Muted" : "Unmuted");
  }

  setVolume(value) {
    this.video.volume = parseFloat(value);
    this.video.muted = value == 0;
  }

  toggleMenu(menu) {
    const wasOpen = menu.classList.contains("open");
    document.querySelectorAll(".loop-menu, .speed-menu, .quality-menu").forEach(m => m.classList.remove("open"));
    if (!wasOpen) menu.classList.add("open");
  }

  setSpeed(speed) {
    this.video.playbackRate = speed;
    this.currentSpeed = speed;
    this.speedMenu.classList.remove("open");
    this.speedMenu.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", parseFloat(btn.dataset.speed) === speed);
    });
    this.showToast(`Speed: ${speed}x`);
    this.saveSettings();
  }

  updateSpeedUI() {
    this.speedBtn.textContent = `${this.video.playbackRate}x`;
  }

  setQuality(quality) {
    this.currentQuality = quality;
    this.qualityMenu.classList.remove("open");
    this.qualityMenu.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.quality === quality);
    });
    this.qualityBtn.textContent = quality === "auto" ? "Auto" : `${quality}p`;
    this.showToast(`Quality: ${quality === "auto" ? "Auto" : quality + "p"}`);
    this.saveSettings();
  }

  setLoopMode(mode) {
    this.loopMode = mode;
    this.loopMenu.classList.remove("open");
    this.loopMenu.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.loop === mode);
    });
    this.updateLoopUI();
    const labels = { none: "No Loop", playlist: "Loop Playlist", video: "Loop Video" };
    this.showToast(labels[mode]);
    this.saveSettings();
  }

  updateLoopUI() {
    this.loopBtn.classList.toggle("active", this.loopMode !== "none");
  }

  toggleAutoplay() {
    this.autoplay = !this.autoplay;
    this.updateAutoplayUI();
    this.showToast(this.autoplay ? "Auto-play enabled" : "Auto-play disabled");
    this.saveSettings();
  }

  updateAutoplayUI() {
    this.autoplayBtn.classList.toggle("active", this.autoplay);
  }

  toggleCaptions() {
    this.ccEnabled = !this.ccEnabled;
    this.ccBtn.classList.toggle("active", this.ccEnabled);
    this.captionsDisplay.classList.toggle("visible", this.ccEnabled);
    this.showToast(this.ccEnabled ? "Captions enabled" : "Captions disabled");
    
    if (this.ccEnabled) {
      this.generateSampleCaptions();
    }
  }

  generateSampleCaptions() {
    const captions = [
      { time: 5, text: "This is a sample caption" },
      { time: 10, text: "Captions help with accessibility" },
      { time: 15, text: "Press C to toggle captions" }
    ];
    
    this.video.oncuechange = () => {
      const cue = this.video.textTracks[0]?.activeCues[0];
      this.captionsDisplay.textContent = cue ? cue.text : "";
    };
  }

  async togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await this.video.requestPictureInPicture();
      }
    } catch (err) {
      this.showToast("PiP not supported");
    }
  }

  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.wrapper.requestFullscreen();
    }
  }

  updateFullscreenUI() {
    this.wrapper.classList.toggle("fullscreen", !!document.fullscreenElement);
  }

  showLoading(show) {
    this.loadingSpinner.classList.toggle("visible", show);
  }

  showControls() {
    this.controls.classList.add("visible");
    this.scheduleHideControls();
  }

  scheduleHideControls() {
    clearTimeout(this.hideControlsTimeout);
    if (!this.video.paused) {
      this.hideControlsTimeout = setTimeout(() => {
        this.controls.classList.remove("visible");
      }, 3000);
    }
  }

  handleKeyboard(e) {
    const shortcuts = {
      " ": () => { e.preventDefault(); this.togglePlay(); },
      "ArrowLeft": () => this.skip(-5),
      "ArrowRight": () => this.skip(5),
      "ArrowUp": () => this.setVolume(Math.min(1, this.video.volume + 0.1)),
      "ArrowDown": () => this.setVolume(Math.max(0, this.video.volume - 0.1)),
      "m": () => this.toggleMute(),
      "f": () => this.toggleFullscreen(),
      "p": () => this.togglePiP(),
      "c": () => this.toggleCaptions(),
      "l": () => this.cycleLoopMode(),
      "?": () => this.shortcutsPanel.classList.toggle("visible"),
      ".": () => this.skip(1 / 30),
      ",": () => this.skip(-1 / 30),
      "n": () => this.playNext(),
      "b": () => this.playPrevious(),
    };

    if (shortcuts[e.key]) {
      shortcuts[e.key]();
      return;
    }

    if (/^[0-9]$/.test(e.key)) {
      const percent = parseInt(e.key) * 10;
      this.video.currentTime = (percent / 100) * this.video.duration;
      this.showToast(`Seek to ${percent}%`);
    }
  }

  cycleLoopMode() {
    const modes = ["none", "playlist", "video"];
    const currentIdx = modes.indexOf(this.loopMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    this.setLoopMode(modes[nextIdx]);
  }

  setKeyboardShortcuts() {
    this.shortcutsPanel.classList.add("visible");
    setTimeout(() => {
      this.shortcutsPanel.classList.remove("visible");
    }, 5000);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  toggleTheme() {
    const isLight = document.body.dataset.theme === "light";
    document.body.dataset.theme = isLight ? "" : "light";
    this.showToast(isLight ? "Dark mode" : "Light mode");
    this.saveSettings();
  }

  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem("videoPlayerSettings") || "{}");
      
      if (settings.theme === "light") {
        document.body.dataset.theme = "light";
      }
      
      if (settings.accentColor) {
        document.documentElement.style.setProperty("--accent", settings.accentColor);
        this.colorPicker.value = settings.accentColor;
      }
      
      if (settings.loopMode) this.loopMode = settings.loopMode;
      if (typeof settings.autoplay === "boolean") this.autoplay = settings.autoplay;
      if (settings.speed) this.currentSpeed = settings.speed;
      if (settings.quality) this.currentQuality = settings.quality;
      
      this.updateLoopUI();
      this.updateAutoplayUI();
    } catch (e) {}
  }

  saveSettings() {
    try {
      const settings = {
        theme: document.body.dataset.theme,
        accentColor: this.colorPicker.value,
        loopMode: this.loopMode,
        autoplay: this.autoplay,
        speed: this.currentSpeed,
        quality: this.currentQuality
      };
      localStorage.setItem("videoPlayerSettings", JSON.stringify(settings));
    } catch (e) {}
  }

  loadSamplePlaylist() {
    const sampleVideos = [
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        title: "Big Buck Bunny",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        title: "Elephant's Dream",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg"
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        title: "For Bigger Blazes",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        title: "For Bigger Escapes",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg"
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        title: "For Bigger Fun",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg"
      }
    ];

    sampleVideos.forEach(video => this.addToPlaylist(video.url, video.title, video.thumbnail));
  }

  addVideo() {
    const url = this.videoUrlInput.value.trim();
    if (!url) return;
    
    const name = url.split("/").pop() || "Video";
    const title = name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    
    this.addToPlaylist(url, title);
    this.videoUrlInput.value = "";
    this.showToast("Video added to playlist");
  }

  addToPlaylist(url, title, thumbnail = null, isLocal = false) {
    const item = { url, title, thumbnail, isLocal };
    this.playlistItems.push(item);
    
    if (this.playlistItems.length === 1) {
      this.loadVideo(0);
    }
    
    this.renderPlaylist();
    this.saveToStorage();
  }

  loadVideo(index) {
    if (index < 0 || index >= this.playlistItems.length) return;
    
    this.currentIndex = index;
    const item = this.playlistItems[index];
    
    this.savePosition();
    this.video.src = item.url;
    this.video.poster = item.thumbnail || "";
    this.wrapper.classList.remove("ended");
    this.videoTitle.textContent = item.title;
    
    this.renderPlaylist();
    this.saveToStorage();
    
    if (this.playlistItems.length > 1) {
      this.showToast(`Now playing: ${item.title}`);
    }
  }

  savePosition() {
    if (this.video.src && this.video.currentTime > 0) {
      this.savedPositions[this.video.src] = this.video.currentTime;
      try {
        localStorage.setItem("videoPositions", JSON.stringify(this.savedPositions));
      } catch (e) {}
    }
  }

  removeVideo(index, e) {
    e.stopPropagation();
    const item = this.playlistItems[index];
    
    if (item.isLocal) {
      URL.revokeObjectURL(item.url);
    }
    
    this.playlistItems.splice(index, 1);
    
    if (index === this.currentIndex) {
      if (this.playlistItems.length > 0) {
        this.loadVideo(Math.min(index, this.playlistItems.length - 1));
      } else {
        this.video.src = "";
        this.videoTitle.textContent = "No video loaded";
      }
    } else if (index < this.currentIndex) {
      this.currentIndex--;
    }
    
    this.renderPlaylist();
    this.saveToStorage();
  }

  playNext() {
    const nextIndex = (this.currentIndex + 1) % this.playlistItems.length;
    this.loadVideo(nextIndex);
    this.video.play();
  }

  playPrevious() {
    const prevIndex = (this.currentIndex - 1 + this.playlistItems.length) % this.playlistItems.length;
    this.loadVideo(prevIndex);
    this.video.play();
  }

  shufflePlaylist() {
    const current = this.playlistItems[this.currentIndex];
    const rest = this.playlistItems.filter((_, i) => i !== this.currentIndex);
    
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    
    this.playlistItems = [current, ...rest];
    this.currentIndex = 0;
    this.renderPlaylist();
    this.loadVideo(0);
    this.showToast("Playlist shuffled");
  }

  openLocalFiles(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    files.forEach(file => {
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        const title = file.name.replace(/\.[^/.]+$/, "");
        this.addToPlaylist(url, title, null, true);
      }
    });
    
    this.showToast(`Added ${files.length} file(s)`);
    e.target.value = "";
  }

  async uploadToCloud(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!this.cloudName || !this.cloudUploadPreset) {
      this.showSetupPrompt();
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("video/")) {
      this.showToast("Please select a video file");
      return;
    }

    this.cloudUpload.classList.add("uploading");
    this.uploadProgress.classList.add("visible");
    this.uploadStatus.textContent = "Uploading...";
    this.progressFill.style.width = "0%";
    this.progressText.textContent = "0%";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.cloudUploadPreset);
    formData.append("resource_type", "video");

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          this.progressFill.style.width = `${percent}%`;
          this.progressText.textContent = `${percent}%`;
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const videoUrl = response.secure_url;
          const title = file.name.replace(/\.[^/.]+$/, "");
          const thumbnail = response.secure_url.replace(/\.[^/.]+$/, ".jpg");
          
          this.addToPlaylist(videoUrl, title, thumbnail);
          this.cloudUpload.classList.remove("uploading");
          this.cloudUpload.classList.add("done");
          this.uploadStatus.textContent = "Uploaded!";
          this.showToast(`Uploaded: ${title}`);
          
          setTimeout(() => {
            this.uploadProgress.classList.remove("visible");
            this.cloudUpload.classList.remove("done");
            this.uploadStatus.textContent = "";
          }, 3000);
        } else {
          throw new Error("Upload failed");
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Upload failed");
      });

      xhr.open("POST", `https://api.cloudinary.com/v1_1/${this.cloudName}/video/upload`);
      xhr.send(formData);
    } catch (error) {
      this.cloudUpload.classList.remove("uploading");
      this.uploadProgress.classList.remove("visible");
      this.uploadStatus.textContent = "Failed";
      this.showToast("Upload failed: " + error.message);
    }

    e.target.value = "";
  }

  showSetupPrompt() {
    const cloudName = prompt("Enter your Cloudinary Cloud Name:");
    if (!cloudName) return;
    
    const uploadPreset = prompt("Enter your Cloudinary Upload Preset:\n\n(Create one at cloudinary.com/settings/upload)");
    if (!uploadPreset) return;

    this.cloudName = cloudName.trim();
    this.cloudUploadPreset = uploadPreset.trim();
    
    localStorage.setItem("cloudName", this.cloudName);
    localStorage.setItem("cloudUploadPreset", this.cloudUploadPreset);
    
    this.showToast("Cloudinary configured! Try uploading again.");
    this.uploadStatus.textContent = "Configured";
    this.uploadStatus.style.color = "#4CAF50";
  }

  exportPlaylist() {
    const data = JSON.stringify(this.playlistItems, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playlist.json";
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("Playlist exported");
  }

  importPlaylist(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          this.playlistItems = data;
          this.currentIndex = 0;
          if (this.playlistItems.length > 0) {
            this.loadVideo(0);
          }
          this.showToast(`Imported ${data.length} videos`);
        }
      } catch (err) {
        this.showToast("Invalid playlist file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  renderPlaylist() {
    const searchTerm = this.playlistSearch.value.toLowerCase();
    
    this.playlist.innerHTML = this.playlistItems
      .map((item, index) => {
        const isActive = index === this.currentIndex;
        const matches = !searchTerm || item.title.toLowerCase().includes(searchTerm);
        
        return `
          <li class="playlist-item ${isActive ? "active" : ""}" data-index="${index}" style="display: ${matches ? "flex" : "none"}">
            <div class="playlist-item-thumb">
              ${item.thumbnail ? `<img src="${item.thumbnail}" alt="" loading="lazy">` : ""}
            </div>
            <div class="playlist-item-info">
              <div class="playlist-item-title">${item.title}</div>
              <div class="playlist-item-meta">Video ${index + 1}</div>
            </div>
            <button class="playlist-item-remove" aria-label="Remove">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </li>
        `;
      })
      .join("");

    this.playlistCount.textContent = `${this.playlistItems.length} videos`;

    this.playlist.querySelectorAll(".playlist-item").forEach(el => {
      el.addEventListener("click", () => this.loadVideo(parseInt(el.dataset.index)));
      el.querySelector(".playlist-item-remove").addEventListener("click", (e) => this.removeVideo(parseInt(el.dataset.index), e));
    });
  }

  filterPlaylist() {
    this.renderPlaylist();
  }

  saveToStorage() {
    try {
      const storablePlaylist = this.playlistItems
        .filter(item => !item.isLocal)
        .map(item => ({ url: item.url, title: item.title, thumbnail: item.thumbnail, isLocal: false }));
      
      localStorage.setItem("videoPlayer", JSON.stringify({
        playlist: storablePlaylist,
        currentIndex: Math.min(this.currentIndex, storablePlaylist.length - 1)
      }));
    } catch (e) {}
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem("videoPlayer");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.playlist && data.playlist.length > 0) {
          this.playlistItems = data.playlist.filter(item => !item.isLocal);
          this.currentIndex = Math.min(data.currentIndex || 0, this.playlistItems.length - 1);
          if (this.playlistItems.length > 0) {
            this.loadVideo(this.currentIndex);
          }
        }
      }
      
      const positions = localStorage.getItem("videoPositions");
      if (positions) {
        this.savedPositions = JSON.parse(positions);
      }
    } catch (e) {}
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AdvancedVideoPlayer();
});
