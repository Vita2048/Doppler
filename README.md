# Doppler teaching preview

**Live demo: https://vita2048.github.io/Doppler — open the page and press Play.**

1920×1080, 30 fps, 30 seconds. Preview only; no MP4 created and no render command run.

From this directory, run `npx hyperframes preview --background`, then open the printed Studio project URL. The expected route is `http://localhost:3002/#project/Doppler`. Press Play to hear the narration and tone. Seek the timeline to inspect each beat.

## Media, measured with ffprobe

- `assets/voice.mp3`: **27.384 seconds**, en-US-AndrewNeural, gain 1.
- `assets/tone.wav`: **10.000 seconds**, mono PCM, 48,000 Hz, gain 0.25, starts at composition time 8 seconds.
- `assets/voice.vtt`: valid WebVTT captions from edge-tts sentence boundaries, offset to each narration section.
- Narration sections start at 0, 4.5, 8, 13.8125, 18, and 24 seconds. Short silent gaps align the teaching beats. Source section audio and transcripts remain in `assets/voice-parts/`. The approved introduction is followed by a guide to the two panels. The rest section begins at 4.5 rather than the draft target of 5 seconds so its measured speech fits naturally.

## On-screen teaching

| Time | Sentence |
| --- | --- |
| 0–4.5 | Why does a passing sound change pitch? Left: sound waves. Right: received frequency. |
| 4.5–8 | Source: 440 Hz. Microphone: 440 Hz. |
| 8–10.4413 | The source approaches. Its new wavefronts travel toward the mic. |
| 10.4413–13.8125 | Closer crests → shorter arrival period → higher frequency. |
| 13.8125–18 | Wider-spaced crests → longer arrival period → lower frequency. |
| 18–24 | The spectrum shows the frequency received by the microphone. |
| 24–28 | The source holds one note. The received frequency rises, then falls. |
| 28–30 | Doppler is a moving spectrum. f′ = f · v / (v − uᵣ). |

The history strip draws the already-heard 8–18 s pass without replaying its tone. The paused explanation uses the same scene time (12 s) in both panels. The display is explicitly predicted frequency rather than a measured FFT.

## Physics and design

The source starts at (90,215), accelerates linearly in velocity from scene time 8 to 9 seconds, then travels at 80 diagram units/s. Wave speed is 160 units/s. The fixed mic is at (470,305). The source passes beside it at scene time 13.25; sound emitted at closest approach arrives at 13.8125. The rest note is 440 Hz. The unchanged physical model uses an internal clock four seconds earlier than scene time; the tone starts at scene time 8, corresponding to model time 4. Frequency-history data includes both time bases.

The model solves `t_receive = t_emit + distance(source(t_emit), mic)/v`. The radial velocity at emission determines the received frequency. FFmpeg aevalsrc synthesizes `sin(2π·440·t_emit)` using the same travel-time equation. Each representative ring expands from its source position at birth, at constant wave speed; negative-time pre-roll initializes the stationary field. Rings are schematic, with one visible ring per 0.4 seconds, not individual audible cycles.

For an off-axis pass, pitch can already be decreasing while still above rest frequency. The approach caption therefore says “peak right of rest,” avoiding the implication that it must keep moving right until the pass. The amber ray joins the mic to the emission position of the sound currently arriving.

## Verification

- HyperFrames check passed: zero runtime, layout, or motion errors; 57/57 text contrast checks pass. Samples cover the introduction, rest, fly-by, explanation, history, and end card.
- Remaining 11 lint warnings recommend smaller sub-compositions and fewer clips on a Studio lane. The shared physics scene intentionally remains in one composition. Three informational occlusion findings describe the end card covering the earlier header.
- `verification-physics.json`: maximum sampled audio/model frequency difference below 0.09 Hz; travel-time residual below 2e-15 seconds. Numerical phase derivative agrees with the analytic received-frequency formula.
- `verification-seeking.json`: introduction title and 440 Hz rest state verified; tone starts at 8 seconds and agrees with the shifted visual clock. Backward seeks reproduce identical space/spectrum/caption states; history seeks reproduce identical curve states; both audio files load with the expected durations and gains.
- Key frame PNGs are in `snapshots/`. No video output was generated.

## Files created or changed

- `../Task.txt`: approved clarifications.
- `BRIEF.md`, `README.md`: agreed design and review notes.
- `index.html`, `hyperframes.json`, `index.motion.json`: composition, settings, and motion assertions.
- `script.txt`, `physics.js`, `scene.js`, `build.mjs`: narration, shared physics, seek-driven drawing, reproducible assembly.
- `generate-tone.mjs`, `generate-voice.mjs`: FFmpeg tone and beat-aligned edge-tts generation.
- `assets/voice.mp3`, `assets/voice.vtt`, `assets/tone.wav`, `assets/gsap.min.js`: local playback assets.
- `assets/voice-parts/*`, `assets/tone-expression.txt`, `assets/frequency-history.json`, `assets/media-metadata.json`: generation inputs and measured metadata.
- `verify-physics.mjs`, `verify-seeking.mjs`, `verification-physics.json`, `verification-seeking.json`: verification scripts and results.
- `catalog-search.json`, `snapshots/*`, `.hyperframes/*`: catalog discovery and framework-generated review/history artifacts.

Tool recovery: npm initially reported `UNABLE_TO_VERIFY_LEAF_SIGNATURE`; using Windows trusted certificates (`NODE_USE_SYSTEM_CA=1`) fixed it. Protected application paths required approved execution. The first edge-tts take was too short; sections were regenerated and joined with measured pauses. A section that exceeded its slot by 0.0125 s was regenerated faster. The first direct-file browser test awaited a paused GSAP thenable and timed out; a boolean readiness predicate fixed the test.
