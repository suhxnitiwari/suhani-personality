# Suhani ✦ Soft heart. Strong spirit.

*Ten personality tests, one person: an interactive portrait where every claim cites its score.*

**Live:** https://suhxnitiwari.github.io/suhani-personality/

## What it is

This site takes my results from CliftonStrengths, VIA, 16Personalities, the Enneagram, DISC, Holland codes, Big Five facets, HEXACO, Schwartz values, love languages and more, and turns them into a story you play with instead of a report you skim. Twenty sections across four acts:

| Act | Question | Sections |
|---|---|---|
| I · Suhani | Who is she? | Inside her head (a brain you pull apart), strong spirit, soft heart, both/and contradictions, signature strengths, in a word |
| II · Love | How does she love? | Inside her heart (a beating 4-chamber heart), inner circle, love language, mood meter, icks, would we click? |
| III · Mind | What drives her? | Values, photos, where she'd thrive, absolutely not, ask the data, quiz |
| IV · Built | What did she build? | Colors & fonts (every color traced back to a test result), final test |

## How it's built

- **No frameworks, one file.** Vanilla JavaScript, CSS, SVG and canvas, set in Playfair Display and DM Sans.
- **Holi paint hero.** A 2D canvas redrawn with `requestAnimationFrame`: every pointer move spawns radial-gradient "blobs" of powder that fade out, and a click throws a burst of color outward. The palette is drawn only from my results, so nothing is random.
- **The page explains itself.** The final section, "the final personality test", reads the page's own `<script>`, splits it into chunks at `// name` markers and shows them in a code viewer with a small one-regex syntax highlighter. Next to it, a live monitor counts canvas frames per second and draws a sparkline (only while visible), and an X-ray mode outlines every element and labels what's under your cursor.
- **Shareable sections.** Each section has its own folder (for example `/icks/` or `/love-language/`) with its own Open Graph tags, which redirects to `?view=<section>`. A tiny inline script runs before first paint and hides everything except that section.
- **Acts as rooms.** Each act is one screen and its sections slide sideways, so the page is a few screens tall instead of thirty.
- **A shareable personality card** drawn on a canvas, exported as a PNG, and passed to the Web Share API when the device supports sharing files.
- **Sound with no audio files.** Bells, a heartbeat thump and a whoosh are synthesized with the Web Audio API, and the mute setting is remembered.
- **15 achievements** saved in `localStorage`, unlocked by playing: swiping the ick deck, scoring 10/10 on the quiz, typing the secret drink, flipping through all the polaroids.
- **Accessibility:** `aria-live` regions for every reveal, tab and button roles on custom controls, keyboard support for the swipe deck (← / →), and `prefers-reduced-motion` fallbacks throughout.

## Design choices

- **Receipts for every claim.** Each trait links back to the actual score behind it, plus how much research stands behind each test. "Ask the data" only answers with cited results.
- **Organs as interfaces.** You pick my brain by pulling regions out of a drawing, and you tap chambers of a heart to feel it beat.
- **Guess first.** The love-language gifts are shuffled with no numbers until you guess, so nothing gives the answer away.
- **Every color has a source.** The Colors & Fonts section traces each swatch to a test, like Gallup's blue for the domain that holds four of my top five strengths.
- **Interactive tensions.** A slider morphs the words themselves to show how two opposite results are both true.

## Run it locally

```bash
git clone https://github.com/suhxnitiwari/suhani-personality.git
cd suhani-personality && python3 -m http.server
```

Then open http://localhost:8000.

---

© 2026 Suhani Tiwari. All rights reserved. See [LICENSE](LICENSE).

Built by [Suhani Tiwari](https://suhanitiwari.com).
