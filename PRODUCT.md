# Sorayori

## Product

Sorayori is a lightweight Android weather application for fast everyday weather checks. It combines immediate forecast clarity with immersive, condition-aware atmosphere and useful personalization.

## Audience

The primary audience is everyday users who want to understand current conditions and upcoming changes quickly, without navigating a dense professional weather tool.

## Core goals

- Make current conditions and the next important weather change understandable at a glance.
- Create an immersive but practical weather experience with condition-specific scenes and purposeful motion.
- Support personalization without making initial use complicated.
- Remain responsive and usable on older and lower-powered Android devices.

## Core experience

- Prominent current temperature, condition, location, and high and low values.
- A smart timeline that explains meaningful changes across the next several hours.
- Detailed views for precipitation, wind, UV, humidity, visibility, pressure, sunrise, and sunset when data is available.
- Short deterministic forecast insights generated from forecast data without an AI service.
- Manual city search and device-location weather.
- Offline access to the latest cached forecast when connectivity is unavailable.
- Vietnamese and English language support.
- Celsius and Fahrenheit temperature units.
- Kilometres per hour and miles per hour wind units.
- Settings must remain easy to understand and apply immediately across the application.
- The main weather view, settings, search, loading, error, and offline states should feel like one consistent product experience.

## Platform

- Android application built with Tauri 2, Rust, React, and TypeScript.
- Minimum supported version is Android 8 with minSdkVersion 26.
- ARM64 and ARMv7 targets are supported.
- The interface follows Android and Material 3 interaction expectations while retaining a distinct Sorayori identity.

## Data

- Weather and geocoding data come from Open-Meteo without an API key.
- Existing offline caching behavior must remain intact.
- Forecast insights must be derived locally from available weather data.
- No fabricated weather values or unsupported claims may be shown.

## Product principles

- Daily clarity comes before decoration.
- Atmosphere should help communicate weather, not obscure information.
- Motion must explain state, hierarchy, or change.
- Progressive disclosure keeps the home experience simple while preserving detailed information.
- Controls must remain familiar to Android users and support system Back behavior.
- Accessibility, readable contrast, reduced motion, touch target size, safe areas, and larger font settings are first-class requirements.

## Technical constraints

- Preserve weather fetching, geolocation, search, settings, persistence, offline cache, and bottom-sheet accessibility.
- Keep the runtime lightweight and avoid unnecessary dependencies.
- Protect performance on older Android WebViews.
- Pause expensive animation while the app is hidden or an overlay is open.
- Support layouts from 320 px compact screens upward.
- Do not use proprietary Google assets or copy Pixel Weather implementation code.
- Do not use flashy aurora gradients, excessive glass effects, emoji, or generic dashboard-card styling.

## Success criteria

- A user can understand the current weather and the most important upcoming change within a few seconds.
- The primary weather answer remains obvious before the user explores secondary measurements or settings.
- Important hourly changes are presented as a readable narrative rather than an undifferentiated data strip.
- Detailed measurements remain discoverable without overwhelming the main view.
- Language and unit preferences are easy to find, change, and understand without weather expertise.
- Weather-specific motion remains smooth and stable on supported devices.
- The application stays useful during temporary network loss through cached data.
- Vietnamese and English experiences remain complete and consistent.

## Current redesign direction

The requested redesign replaces the existing visual world while preserving product truth and functionality. Its selected direction is Living Atmosphere: editorial hierarchy, cinematic weather layers, tactile Android controls, restrained expressive motion, and clear everyday utility.
