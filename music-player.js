(() => {
  "use strict";

  const config =
    window.CWN_MUSIC_CONFIG;

  if (
    !config ||
    !Array.isArray(config.tracks) ||
    config.tracks.length === 0
  ) {
    return;
  }

  const STORAGE_KEY =
    "cwnAudioNodeStateV1";

  const SESSION_KEY =
    "cwnAudioNodeSessionV1";

  const tracks =
    config.tracks.filter(
      (track) =>
        track.enabled !== false
    );

  if (tracks.length === 0) {
    return;
  }

  const state = {
    trackIndex: 0,
    volume:
      Number.isFinite(config.defaultVolume)
        ? config.defaultVolume
        : 0.35,
    loop:
      config.defaultLoop !== false,
    muted: false,
    desiredPlaying: false,
    panelOpen: false,
    currentTime: 0
  };

  const loadSavedState = () => {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          ) || "{}"
        );

      const session =
        JSON.parse(
          sessionStorage.getItem(
            SESSION_KEY
          ) || "{}"
        );

      if (
        Number.isInteger(saved.trackIndex) &&
        saved.trackIndex >= 0 &&
        saved.trackIndex < tracks.length
      ) {
        state.trackIndex =
          saved.trackIndex;
      }

      if (
        Number.isFinite(saved.volume)
      ) {
        state.volume =
          Math.max(
            0,
            Math.min(1, saved.volume)
          );
      }

      state.loop =
        saved.loop !== false;

      state.muted =
        saved.muted === true;

      state.desiredPlaying =
        session.desiredPlaying === true;

      if (
        Number.isFinite(session.currentTime)
      ) {
        state.currentTime =
          Math.max(
            0,
            session.currentTime
          );
      }
    } catch (error) {
      console.log(
        "CWN Audio Node state reset."
      );
    }
  };

  loadSavedState();

  const root =
    document.createElement("section");

  root.className =
    "cwn-audio-node";

  root.id =
    "cwn-audio-node";

  root.setAttribute(
    "aria-label",
    "CWN music player"
  );

  root.innerHTML = `
    <header class="cwn-audio-header">
      <div class="cwn-audio-header-copy">
        <span class="cwn-audio-system-label">
          ${config.playerName || "CWN AUDIO NODE"}
        </span>

        <span class="cwn-audio-status">
          <span class="cwn-audio-status-dot"></span>

          <span id="cwn-audio-status-text">
            STANDBY
          </span>
        </span>

        <span
          class="cwn-audio-build-label"
          id="cwn-audio-build-label"
        >
          AUDIO NODE v1.0
        </span>
      </div>

      <button
        class="cwn-audio-close"
        id="cwn-audio-close"
        type="button"
        aria-label="Close music player"
      >
        ×
      </button>
    </header>

    <div class="cwn-audio-track">
      <div
        class="cwn-audio-artwork"
        id="cwn-audio-artwork"
        aria-hidden="true"
      >
        <span class="cwn-audio-radar-ring"></span>
        <span class="cwn-audio-radar-sweep"></span>
        <span class="cwn-audio-radar-core"></span>
      </div>

      <div class="cwn-audio-track-info">
        <strong id="cwn-audio-title">
          Loading track…
        </strong>

        <span id="cwn-audio-artist">
          Community Watch Network
        </span>

        <span class="cwn-audio-version">
          Audio Node · Version 1.0.0-preview
        </span>

        <div
          class="cwn-audio-equaliser"
          id="cwn-audio-equaliser"
          aria-hidden="true"
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <div class="cwn-audio-progress-area">
      <input
        class="cwn-audio-range"
        id="cwn-audio-progress"
        type="range"
        min="0"
        max="100"
        step="0.1"
        value="0"
        aria-label="Track progress"
      >

      <div class="cwn-audio-time">
        <span id="cwn-audio-current">
          00:00
        </span>

        <span id="cwn-audio-duration">
          00:00
        </span>
      </div>
    </div>

    <div class="cwn-audio-controls">
      <button
        class="cwn-audio-control"
        id="cwn-audio-previous"
        type="button"
        aria-label="Previous track"
      >
        ⏮
      </button>

      <button
        class="cwn-audio-control cwn-audio-control-primary"
        id="cwn-audio-play"
        type="button"
        aria-label="Play music"
      >
        ▶
      </button>

      <button
        class="cwn-audio-control"
        id="cwn-audio-next"
        type="button"
        aria-label="Next track"
      >
        ⏭
      </button>

      <button
        class="cwn-audio-control"
        id="cwn-audio-loop"
        type="button"
        aria-label="Toggle looping"
      >
        🔁
      </button>
    </div>

    <div class="cwn-audio-volume-row">
      <button
        class="cwn-audio-control"
        id="cwn-audio-mute"
        type="button"
        aria-label="Mute music"
      >
        🔊
      </button>

      <input
        class="cwn-audio-range"
        id="cwn-audio-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value="${state.volume}"
        aria-label="Music volume"
      >

      <span
        class="cwn-audio-volume-value"
        id="cwn-audio-volume-value"
      >
        ${Math.round(state.volume * 100)}%
      </span>
    </div>

    <div
      class="cwn-audio-preview"
      id="cwn-audio-preview"
      hidden
    >
      <div class="cwn-audio-preview-heading">
        <span class="cwn-audio-preview-badge">
          EARLY ACCESS BUILD
        </span>

        <span class="cwn-audio-preview-version">
          AUDIO NODE v1.0
        </span>
      </div>

      <div class="cwn-audio-preview-copy">
        <strong>
          Official CWN Soundtrack Preview
        </strong>

        <p>
          Watch the Signal is currently available through Suno while
          integrated playback is prepared for a future portal update.
        </p>
      </div>

      <div class="cwn-audio-deployment">
        <span class="cwn-audio-section-title">
          Deployment status
        </span>

        <div class="cwn-audio-deployment-row">
          <span class="cwn-audio-stage cwn-audio-stage-complete">✓</span>
          <span>Streaming through Suno</span>
          <strong>AVAILABLE</strong>
        </div>

        <div class="cwn-audio-deployment-row">
          <span class="cwn-audio-stage">○</span>
          <span>Integrated local playback</span>
          <strong>PENDING</strong>
        </div>

        <div class="cwn-audio-deployment-row">
          <span class="cwn-audio-stage">○</span>
          <span>Offline soundtrack package</span>
          <strong>PLANNED</strong>
        </div>
      </div>

      <div class="cwn-audio-roadmap">
        <span class="cwn-audio-section-title">
          Audio Node roadmap
        </span>

        <ul>
          <li class="cwn-audio-roadmap-complete">
            <span>✓</span>
            Suno soundtrack release
          </li>
          <li><span>○</span>Integrated website playback</li>
          <li><span>○</span>Multiple CWN tracks</li>
          <li><span>○</span>Dynamic portal soundtrack</li>
          <li><span>○</span>Investigation themes</li>
          <li><span>○</span>Ambient and event modes</li>
        </ul>
      </div>
    </div>

    <div
      class="cwn-audio-notice"
      id="cwn-audio-error"
      role="status"
    ></div>

    <footer class="cwn-audio-footer">
      <span>
        Official CWN Soundtrack
      </span>

      <a
        class="cwn-audio-external"
        id="cwn-audio-external"
        href="#"
        target="_blank"
        rel="noopener noreferrer"
      >
        Listen on Suno ↗
      </a>
    </footer>
  `;

  const launcher =
    document.createElement("button");

  launcher.className =
    "cwn-audio-launcher";

  launcher.type =
    "button";

  launcher.setAttribute(
    "aria-label",
    "Open CWN music player"
  );

  launcher.innerHTML = `
    <span
      class="cwn-audio-launcher-icon"
      aria-hidden="true"
    >
      🎵
    </span>
  `;

  document.body.append(
    root,
    launcher
  );

  const audio =
    new Audio();

  audio.preload =
    "metadata";

  audio.crossOrigin =
    "anonymous";

  const elements = {
    close:
      root.querySelector(
        "#cwn-audio-close"
      ),

    title:
      root.querySelector(
        "#cwn-audio-title"
      ),

    artist:
      root.querySelector(
        "#cwn-audio-artist"
      ),

    artwork:
      root.querySelector(
        "#cwn-audio-artwork"
      ),

    equaliser:
      root.querySelector(
        "#cwn-audio-equaliser"
      ),

    status:
      root.querySelector(
        "#cwn-audio-status-text"
      ),

    progress:
      root.querySelector(
        "#cwn-audio-progress"
      ),

    current:
      root.querySelector(
        "#cwn-audio-current"
      ),

    duration:
      root.querySelector(
        "#cwn-audio-duration"
      ),

    previous:
      root.querySelector(
        "#cwn-audio-previous"
      ),

    play:
      root.querySelector(
        "#cwn-audio-play"
      ),

    next:
      root.querySelector(
        "#cwn-audio-next"
      ),

    loop:
      root.querySelector(
        "#cwn-audio-loop"
      ),

    mute:
      root.querySelector(
        "#cwn-audio-mute"
      ),

    volume:
      root.querySelector(
        "#cwn-audio-volume"
      ),

    volumeValue:
      root.querySelector(
        "#cwn-audio-volume-value"
      ),

    external:
      root.querySelector(
        "#cwn-audio-external"
      ),

    error:
      root.querySelector(
        "#cwn-audio-error"
      ),

    preview:
      root.querySelector(
        "#cwn-audio-preview"
      )
  };

  let fadeTimer = null;
  let saveTimer = null;
  let interactionResumeAttempted =
    false;

  let localAudioAvailable =
    true;

  const playbackControls = [
    elements.previous,
    elements.play,
    elements.next,
    elements.loop,
    elements.progress,
    elements.mute,
    elements.volume
  ];

  const setPlaybackAvailability = (
    available
  ) => {
    localAudioAvailable =
      available;

    playbackControls.forEach(
      (control) => {
        if (!control) {
          return;
        }

        control.disabled =
          !available;

        control.setAttribute(
          "aria-disabled",
          String(!available)
        );
      }
    );

    root.classList.toggle(
      "cwn-audio-node-preview-mode",
      !available
    );

    if (elements.preview) {
      elements.preview.hidden =
        available;
    }

    if (!available) {
      state.desiredPlaying =
        false;

      audio.pause();
      updatePlayingUi();
    }
  };

  const activeTrack = () =>
    tracks[state.trackIndex];

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const minutes =
      Math.floor(seconds / 60);

    const remaining =
      Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  const saveState = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        trackIndex:
          state.trackIndex,

        volume:
          state.volume,

        loop:
          state.loop,

        muted:
          state.muted
      })
    );

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        desiredPlaying:
          state.desiredPlaying,

        currentTime:
          Number.isFinite(audio.currentTime)
            ? audio.currentTime
            : state.currentTime
      })
    );
  };

  const scheduleSave = () => {
    clearTimeout(saveTimer);

    saveTimer =
      setTimeout(
        saveState,
        250
      );
  };

  const showError = (text) => {
    elements.error.textContent =
      text;

    elements.error.classList.add(
      "cwn-audio-notice-visible"
    );
  };

  const clearError = () => {
    elements.error.textContent =
      "";

    elements.error.classList.remove(
      "cwn-audio-error-visible"
    );
  };

  const updatePlayingUi = () => {
    const playing =
      !audio.paused &&
      !audio.ended;

    elements.play.textContent =
      playing
        ? "⏸"
        : "▶";

    elements.play.setAttribute(
      "aria-label",
      playing
        ? "Pause music"
        : "Play music"
    );

    elements.status.textContent =
      playing
        ? "TRANSMITTING"
        : "STANDBY";

    elements.equaliser.classList.toggle(
      "cwn-audio-equaliser-playing",
      playing
    );

    elements.artwork.classList.toggle(
      "cwn-audio-artwork-playing",
      playing
    );

    launcher.classList.toggle(
      "cwn-audio-launcher-playing",
      playing
    );
  };

  const updateLoopUi = () => {
    elements.loop.classList.toggle(
      "cwn-audio-control-active",
      state.loop
    );

    audio.loop =
      state.loop;
  };

  const updateMuteUi = () => {
    audio.muted =
      state.muted;

    elements.mute.textContent =
      state.muted ||
      state.volume === 0
        ? "🔇"
        : state.volume < 0.5
          ? "🔉"
          : "🔊";

    elements.mute.classList.toggle(
      "cwn-audio-control-active",
      state.muted
    );
  };

  const updateVolumeUi = () => {
    elements.volume.value =
      String(state.volume);

    elements.volumeValue.textContent =
      `${Math.round(state.volume * 100)}%`;

    if (!state.muted) {
      audio.volume =
        state.volume;
    }

    updateMuteUi();
  };

  const loadTrack = (
    index,
    {
      preservePosition = false
    } = {}
  ) => {
    state.trackIndex =
      (
        index +
        tracks.length
      ) %
      tracks.length;

    const track =
      activeTrack();

    const previousTime =
      preservePosition
        ? state.currentTime
        : 0;

    clearError();

    audio.src =
      track.source;

    audio.loop =
      state.loop;

    audio.volume =
      state.muted
        ? 0
        : state.volume;

    elements.title.textContent =
      track.title;

    elements.artist.textContent =
      [
        track.artist,
        track.subtitle
      ]
        .filter(Boolean)
        .join(" · ");

    elements.external.href =
      track.externalUrl || "#";

    elements.external.hidden =
      !track.externalUrl;

    audio.addEventListener(
      "loadedmetadata",
      () => {
        const targetTime =
          Math.min(
            previousTime,
            Math.max(
              0,
              audio.duration - 0.5
            )
          );

        if (
          targetTime > 0 &&
          Number.isFinite(targetTime)
        ) {
          audio.currentTime =
            targetTime;
        }
      },
      {
        once: true
      }
    );

    scheduleSave();
  };

  const stopFade = () => {
    if (fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }
  };

  const fadeTo = (
    target,
    duration = 600,
    after
  ) => {
    stopFade();

    if (state.muted) {
      audio.volume = 0;

      if (after) {
        after();
      }

      return;
    }

    const starting =
      audio.volume;

    const difference =
      target - starting;

    const started =
      performance.now();

    fadeTimer =
      setInterval(
        () => {
          const elapsed =
            performance.now() -
            started;

          const progress =
            Math.min(
              1,
              elapsed / duration
            );

          audio.volume =
            Math.max(
              0,
              Math.min(
                1,
                starting +
                  difference *
                    progress
              )
            );

          if (progress >= 1) {
            stopFade();

            if (after) {
              after();
            }
          }
        },
        30
      );
  };

  const playAudio = async () => {
    clearError();

    if (!localAudioAvailable) {
      showError(
        "🎵 Official CWN Theme\n\nWatch the Signal is currently streaming through Suno while the integrated CWN Audio Node is finalised. Local playback will become available automatically in a future portal update. Select \"Listen on Suno\" below to hear the official release."
      );

      return;
    }

    try {
      audio.volume = 0;

      await audio.play();

      state.desiredPlaying =
        true;

      fadeTo(
        state.volume,
        700
      );

      updatePlayingUi();
      scheduleSave();
    } catch (error) {
      state.desiredPlaying =
        false;

      showError(
        "Playback was blocked or the audio file could not be loaded. Tap Play again or use the Suno link."
      );

      updatePlayingUi();
      scheduleSave();
    }
  };

  const pauseAudio = () => {
    state.desiredPlaying =
      false;

    fadeTo(
      0,
      350,
      () => {
        audio.pause();
        audio.volume =
          state.volume;
        updatePlayingUi();
      }
    );

    scheduleSave();
  };

  const togglePlayback = () => {
    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  };

  const changeTrack = (
    direction
  ) => {
    const wasPlaying =
      !audio.paused;

    loadTrack(
      state.trackIndex +
        direction
    );

    if (wasPlaying) {
      playAudio();
    }
  };

  launcher.addEventListener(
    "click",
    () => {
      state.panelOpen =
        !state.panelOpen;

      root.classList.toggle(
        "cwn-audio-node-open",
        state.panelOpen
      );
    }
  );

  elements.close.addEventListener(
    "click",
    () => {
      state.panelOpen = false;

      root.classList.remove(
        "cwn-audio-node-open"
      );
    }
  );

  elements.play.addEventListener(
    "click",
    togglePlayback
  );

  elements.previous.addEventListener(
    "click",
    () => changeTrack(-1)
  );

  elements.next.addEventListener(
    "click",
    () => changeTrack(1)
  );

  elements.loop.addEventListener(
    "click",
    () => {
      state.loop =
        !state.loop;

      updateLoopUi();
      scheduleSave();
    }
  );

  elements.mute.addEventListener(
    "click",
    () => {
      state.muted =
        !state.muted;

      if (state.muted) {
        audio.volume = 0;
      } else {
        audio.volume =
          state.volume;
      }

      updateMuteUi();
      scheduleSave();
    }
  );

  elements.volume.addEventListener(
    "input",
    () => {
      state.volume =
        Number(
          elements.volume.value
        );

      state.muted = false;

      audio.volume =
        state.volume;

      updateVolumeUi();
      scheduleSave();
    }
  );

  elements.progress.addEventListener(
    "input",
    () => {
      if (
        !Number.isFinite(
          audio.duration
        )
      ) {
        return;
      }

      audio.currentTime =
        (
          Number(
            elements.progress.value
          ) /
          100
        ) *
        audio.duration;
    }
  );

  audio.addEventListener(
    "timeupdate",
    () => {
      elements.current.textContent =
        formatTime(
          audio.currentTime
        );

      elements.duration.textContent =
        formatTime(
          audio.duration
        );

      if (
        Number.isFinite(
          audio.duration
        ) &&
        audio.duration > 0
      ) {
        elements.progress.value =
          String(
            (
              audio.currentTime /
              audio.duration
            ) *
            100
          );
      }

      state.currentTime =
        audio.currentTime;

      scheduleSave();
    }
  );

  audio.addEventListener(
    "play",
    updatePlayingUi
  );

  audio.addEventListener(
    "pause",
    updatePlayingUi
  );

  audio.addEventListener(
    "ended",
    () => {
      if (
        !state.loop &&
        tracks.length > 1
      ) {
        changeTrack(1);
      } else {
        state.desiredPlaying =
          false;
        updatePlayingUi();
        scheduleSave();
      }
    }
  );

  audio.addEventListener(
    "error",
    () => {
      setPlaybackAvailability(false);

      showError(
        "🎵 Official CWN Theme\n\nWatch the Signal is available now through Suno. Integrated website playback will activate automatically once the local soundtrack is deployed."
      );

      state.desiredPlaying =
        false;

      updatePlayingUi();
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      const target =
        event.target;

      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (typing) {
        return;
      }

      if (
        event.key.toLowerCase() ===
        "m"
      ) {
        state.muted =
          !state.muted;

        audio.volume =
          state.muted
            ? 0
            : state.volume;

        updateMuteUi();
        scheduleSave();
      }
    }
  );

  const resumeAfterInteraction =
    () => {
      if (
        interactionResumeAttempted
      ) {
        return;
      }

      interactionResumeAttempted =
        true;

      if (
        config.autoplayAfterInteraction &&
        state.desiredPlaying
      ) {
        playAudio();
      }

      document.removeEventListener(
        "pointerdown",
        resumeAfterInteraction
      );

      document.removeEventListener(
        "keydown",
        resumeAfterInteraction
      );
    };

  document.addEventListener(
    "pointerdown",
    resumeAfterInteraction,
    {
      passive: true
    }
  );

  document.addEventListener(
    "keydown",
    resumeAfterInteraction
  );

  window.addEventListener(
    "pagehide",
    saveState
  );

  window.addEventListener(
    "beforeunload",
    saveState
  );

  loadTrack(
    state.trackIndex,
    {
      preservePosition: true
    }
  );

  fetch(
    activeTrack().source,
    {
      method: "HEAD",
      cache: "no-store"
    }
  )
    .then((response) => {
      setPlaybackAvailability(
        response.ok
      );

      if (!response.ok) {
        showError(
          "🎵 Official CWN Theme\n\nWatch the Signal is available now through Suno. Integrated website playback will activate automatically once the local soundtrack is deployed."
        );
      }
    })
    .catch(() => {
      setPlaybackAvailability(false);

      showError(
        "🎵 Official CWN Theme\n\nWatch the Signal is available now through Suno. Integrated website playback will activate automatically once the local soundtrack is deployed."
      );
    });

  updateLoopUi();
  updateVolumeUi();
  updateMuteUi();
  updatePlayingUi();
})();
