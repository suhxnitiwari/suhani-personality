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

- **3D with no WebGL and no libraries.** Every wall, floor, chair and book spine is an ordinary `<div>` placed in space with CSS `transform: translate3d() rotateY() rotateX()` inside a `transform-style: preserve-3d` world. The camera is one element: `translateZ(perspective) rotateX(pitch) rotateY(yaw) translate3d(-x, -y, -z)`, so moving the camera moves the whole world the opposite way. About 3,400 planes in total.
- **A tiny modelling kit.** `plane()` places one flat rectangle. `box()` builds furniture from five planes. `wall()` runs along a room's edge and cuts doorways out of itself, including the curved tops of arches (an SVG `clip-path: path()`). `mount()` hangs things on walls. Sofas, chairs, chandeliers, drapes and window seats are small functions built from those.
- **The plan is data.** Rooms, doors, bay windows and stairs are plain arrays (`ROOMS`, `DOORS`, `BAYS`, `HELIXES`). The shells, walls, collisions and walking paths are all generated from them, so moving a door moves everything that depends on it.
- **Walking.** The floor is a list of surfaces, each a rectangle with a height function. `heightAt()` picks the surface nearest your feet, which is how you climb stairs without falling through floors. Walls are line segments with a height band, and you're pushed back from them in a circle. Furniture is a box you slide around.
- **Three spiral staircases.** Each is a helix: one surface per turn, with the height computed from the angle around the centre pole. The floors above get a hole cut out (a small rectangle-subtraction routine), so you climb up through them. The library spiral goes up two storeys (library → study → music room), and you can step off at either floor.
- **Tap to go anywhere.** A graph of points (a node in every room, one on each side of every doorway, one every eighth of a turn up each staircase) is searched with Dijkstra's algorithm. Tap a stop on the other side of the house and you walk there through the doors and up the stairs, with your feet following each step.
- **Picking with my own ray.** Browsers can't reliably tell which 3D `<div>` you tapped from far away, so in dollhouse and plan views I cast a ray from the camera through the pixel and march it into the house to find the room.
- **Drawing only what you can see.** Browsers keep roughly 1,500 3D planes sharp at once, and the house has more than twice that. So only your room, the rooms next door and the stair you're on are drawn, and the moment you start walking, everything along your route loads ahead of you.
- **Every texture is code.** The wallpapers, rugs, herringbone floors, slate roof and bouquets are SVG generated in JavaScript (seeded random, so they're the same every visit) and stored as CSS variables. There are no image files except my own photos.
- **Dollhouse mode.** The fronts of the house are on hinges: one CSS class swings them open with a `rotateY` transition and lifts the roof off.
- **Toys.** Click the closet doors, the coffee machine, the rolling ladder, the attic trunk or the garage doors and they move (CSS transitions on a `data-play` attribute). The basement door opens onto a dark stair.
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
