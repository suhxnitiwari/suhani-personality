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

## The house: a dollhouse you can walk through

**Live:** https://suhxnitiwari.github.io/suhani-personality/house/

The same personality, built as a house. My people are at the front, my ambition is upstairs, the mess of my brain is in the attic, and there's a secret garden behind. You can walk through it like a Matterport listing, open it like a dollhouse, or read it as a floor plan. The 22 stops live in objects, not posters: the family photos on the built-ins, the ten reports on a library shelf, the latte machine, the rom-com shelf, the mirror with words tucked into the frame.

### How it's built

- **Three.js for the drawing, everything else by hand.** The first version was about 3,400 `<div>`s placed in 3D with CSS transforms. It looked lovely and ran at 3 to 5 frames a second, because the browser had to composite every plane as its own layer. The house is now drawn with WebGL through Three.js and runs at 60.
- **A tiny modelling kit** (`kit.js`). Every wall, stair tread, book spine and rose bush is a soft block with its colour painted onto its vertices, then merged with the others on its storey into a handful of meshes, so a whole floor costs the GPU one draw call. Every solid block also leaves behind a box to bump into.
- **The plan is data.** Rooms, doors, bay windows and stairs are plain arrays (`ROOMS`, `DOORS`, `BAYS`, `HELIXES` in `layout.js`). The shell, walls with their doorways and windows, the stair holes and the walking paths are all generated from them, so moving a door moves everything that depends on it.
- **A real dollhouse front.** Outside walls are grouped by the way they face. Whichever side is turned toward you opens up, so you can look straight into every room, and picking a floor lifts the storeys above it away.
- **Walking.** You're a circle that slides along the boxes and steps up anything shorter than a stair riser, which is how you climb the three spiral staircases without falling through the floors.
- **Going somewhere on purpose.** A graph of points (one in every room, one on each side of every doorway, one every eighth of a turn up each staircase) is searched with Dijkstra's algorithm to find the doors and stairs. Between two of its points on the same floor, an A* search on a fine grid finds the way round the furniture, then the path is pulled tight so you walk in straight lines.
- **The camera takes its time.** From the dollhouse it glides over the room you picked and sinks straight down into it, never through a wall. Inside, your eyes lead a little ahead along the path and turn slowly at the end to face the stop.
- **Picking with my own rays.** A tap casts a ray against the same boxes the walls are made of, to find the room, the floor or the gold marker under your finger.
- **Sound** is synthesized with the Web Audio API, like the main site's.

## Run it locally

```bash
git clone https://github.com/suhxnitiwari/suhani-personality.git
cd suhani-personality && python3 -m http.server
```

Then open http://localhost:8000 (and http://localhost:8000/house/ for the house).

---

© 2026 Suhani Tiwari. All rights reserved. See [LICENSE](LICENSE).

Built by [Suhani Tiwari](https://suhanitiwari.com).
