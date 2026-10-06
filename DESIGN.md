---
name: Sorayori Living Atmosphere
description: An atmospheric Android weather interface balancing forecast clarity with cinematic condition-aware motion.
colors:
  surface: "#f4f0e7"
  surface-high: "#fffaf0"
  ink: "#172322"
  ink-muted: "#4d605d"
  accent: "#bce8d2"
  scene-ink: "#f8fbfc"
  scene-default: "#779da9"
  scene-night: "#172b38"
  scene-clear: "#79a7b5"
  scene-cloud: "#748f99"
  scene-fog: "#899a9b"
  scene-precipitation: "#536f7c"
  scene-snow: "#8ba1a8"
  scene-sun: "#e9d49b"
  scene-moon: "#dce2dc"
typography:
  display:
    fontFamily: "Avenir Next, Avenir, Noto Sans, system-ui, sans-serif"
    fontWeight: 300
  body:
    fontFamily: "Avenir Next, Avenir, Noto Sans, system-ui, sans-serif"
    fontWeight: 400
rounded:
  control: 14px
  forecast-item: 16px
  insight: 24px
  section: 30px
spacing:
  compact: 8px
  control: 12px
  content: 20px
  section: 26px
components:
  touch-target:
    minHeight: 44px
  details-toggle:
    minHeight: 48px
---

# Overview

Sorayori uses a Living Atmosphere design language: forecast information remains immediately legible while the surrounding weather scene communicates time, condition, and emotional tone. The system is Android-first, tactile, restrained, and cinematic without becoming decorative or data-heavy.

**The Clarity Before Atmosphere Rule.** Current conditions and the next meaningful change must remain understandable even when scene artwork and motion are removed.

**The One Continuous Forecast Rule.** The home screen reads as one unfolding weather story rather than a stack of unrelated cards.

# Colors

The upper experience uses condition-aware sky colors with high-contrast light foreground content. The lower forecast area changes into a warm neutral surface so detailed measurements can be read calmly and consistently across weather states.

The mint accent is reserved for the locally derived forecast insight. It should not become a general-purpose highlight color across every control.

**The Weather Owns the Sky Rule.** Scene colors may change with conditions, but content surfaces and semantic text roles remain stable.

**The Restrained Accent Rule.** Use the accent for the single most useful upcoming-weather narrative, not for decoration or repeated emphasis.

# Typography

The interface uses a humanist sans-serif stack with lightweight display numerals and compact, confident supporting labels. Temperature is the dominant display element. Section headings, controls, and measurements use progressively stronger weights rather than unrelated type styles.

Large temperature values use tabular numerals and tight tracking. Body and label text must remain readable in both Vietnamese and English, including compact widths and larger system font settings.

**The Temperature Is the Display Rule.** Do not introduce another display treatment that competes with the current temperature.

**The Weight Builds Hierarchy Rule.** Prefer changes in size and weight over uppercase text, decorative lettering, or excessive color.

# Layout

The compact Android layout begins with a safe-area-aware app bar, followed by a centered current-condition hero, an hourly timeline, a single forecast insight, and a continuous light details surface. The details surface contains core measurements, optional expanded measurements, sunrise and sunset, the seven-day forecast, and update status.

Horizontal padding is generally 20px. Controls remain usable from 320px upward, and forecast rows compress before content is allowed to clip. The lower information area uses separators and spacing instead of nested cards.

**The Progressive Disclosure Rule.** Show humidity, wind, rain chance, and UV first. Keep secondary measurements behind the explicit details control.

**The Continuous Surface Rule.** Sunrise, daily forecast, and update status continue the details surface rather than becoming separate floating containers.

# Components

Location and settings controls use dark translucent tonal fills with soft offset shadows. They remain visually distinct from decorative glass and preserve a minimum 44px touch target.

The forecast insight uses an asymmetric mint shape with concise narrative copy. It is the only prominent colored content surface.

Weather metrics use a two-column ribbon with thin neutral separators, consistent Lucide stroke icons, muted labels, and stronger values. Daily forecast entries use rows rather than cards.

Bottom sheets retain familiar Android structure, modal focus behavior, drag affordance, safe-area padding, Escape dismissal where available, and system Back compatibility.

**The Tactile Control Rule.** Interactive elements must look pressable through tonal fill, shape, or position, never through decorative glow.

**The Real Icon Rule.** Use the established Lucide and Meteocons systems. Do not substitute emoji or Unicode glyphs.

# Imagery

Weather scenes combine condition-specific color, Meteocons artwork, cloud imagery where appropriate, and lightweight procedural particles for rain, snow, fog, stars, and storms. Visual layers communicate actual forecast state rather than serving as generic decoration.

The scene palette is a documented semantic extension of the core interface palette. `scene-default`, `scene-night`, `scene-clear`, `scene-cloud`, `scene-fog`, `scene-precipitation`, and `scene-snow` describe condition evidence rather than interchangeable decoration. `scene-sun` and `scene-moon` are reserved for celestial objects, while `scene-ink` maintains foreground contrast over atmospheric surfaces. Transparency values are role-specific: glass fill and separators structure forecast surfaces, text alpha values establish scene hierarchy, and weather-particle alpha values communicate depth.

Do not use proprietary Google or Pixel Weather assets. Avoid aurora gradients, arbitrary abstract blobs, and unrelated stock photography.

**The Condition Evidence Rule.** Every major atmospheric layer must correspond to the active weather condition or time of day.

# Motion

Motion is restrained and functional. Scene changes crossfade between condition layers. Weather particles move independently with varied timing, while current-condition content reveals as one authored moment. Expanding details uses opacity and transform rather than animating layout-heavy properties.

Expensive scene animation pauses whenever the document is hidden or a modal panel is open. Reduced-motion preferences collapse transitions to brief crossfades or immediate state changes.

**The One Authored Moment Rule.** The hero reveal is the primary entrance. Supporting sections should not repeat the same staged animation.

**The Weather Pace Rule.** Clear and cloudy scenes move slowly, precipitation moves directionally, and storms may flash briefly without creating continuous visual noise.

# Accessibility

Text over scenes must maintain readable contrast across every weather state. Light detail surfaces use dark ink and muted green-gray secondary text. Touch targets are at least 44px, with primary disclosure controls reaching 48px.

Interactive state is communicated through semantic HTML and ARIA attributes as well as visual change. The details toggle exposes its expanded state, bottom sheets preserve focus behavior, and loading and error content remain available to assistive technology.

System reduced-motion, safe-area insets, bilingual copy, compact widths, and larger font settings are first-class constraints.

**The Meaning Without Motion Rule.** No weather fact, status, or interaction may depend on animation alone.
