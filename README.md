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

The same personality, built as a house. My people are at the front, my ambition is upstairs, the mess of my brain is in the attic, and there's a secret garden behind. You can see it from the street, open it like a dollhouse, or walk through it at eye level. The 22 stops live in objects, not posters: the family photos on the built-ins, the ten reports on a library shelf, the latte machine, the rom-com shelf, the mirror with words tucked into the frame.

**At a glance:** 25 rooms on 2 floors plus an attic, 3 spiral staircases, about 487,000 triangles drawn in about 50 draw calls, 2,009 collision boxes, and 3,000 lines of hand-written JavaScript. Every wall, window, stair tread, book and rose is generated in code; the house loads no 3D models and no textures.

### Architecture

Plain ES modules with no build step. Three.js 0.170 is the only dependency, loaded through an import map.

| Module | Job |
|---|---|
| `layout.js` | The plan as data: rooms, doors, bays, staircases, stop placements, the route graph and Dijkstra |
| `kit.js` | The modelling kit: vertex-painted primitives, geometry batching, materials, ray-box tests, a spatial hash |
| `shell.js` | Generates the building from the plan: floors with stair holes, walls with doors and windows, roofs, turret, porch, dormers |
| `furnish.js` | Furniture for every room and the 22 stops, each built from the kit |
| `grounds.js` | Lawn, street, trees, hedges, fountain and the secret garden |
| `game.js` | Renderer, lighting, camera, collision and walking, pathfinding, picking, input, the frame loop |
| `panels.js` | What opens at each stop, including the quiz and the "would you click?" game |

### Rendering

- **One draw call per storey.** The first version was about 3,400 `<div>`s placed in 3D with CSS transforms. It looked lovely and ran at 3 to 5 frames a second, because the browser composited every plane as its own layer. Now every piece is banked by layer and material, merged with `mergeGeometries` into 72 meshes, and drawn with WebGL at 60.
- **Colour without textures.** Each block has its colour written into its vertices, one per face if needed, with a seeded random jitter of about 3% so painted surfaces look hand-made instead of flat. The random generator is a seeded Lehmer generator, so the house is identical on every load.
- **Golden-hour light.** A sky dome coloured with a six-stop vertex gradient, an image-based environment from `RoomEnvironment` through a PMREM generator, a sun with soft PCF shadows (4096² on desktop, 2048² on touch devices), distance fog and neutral tone mapping.
- **Four materials for the whole house:** matte, metal for brass, transparent glass drawn last without depth writes, and an unlit glow for lamps and candles.
- **Real arches.** Arched and round windows cut their curve out of the wall with an extruded `THREE.Shape`, placed with a hand-built basis matrix in the wall's own frame. The outer half takes the facade colour and the inner half the room's, so one wall reads correctly from both sides.

### The house is generated from data

- **The plan drives everything.** Rooms, doors, bay windows and stairs are plain arrays (`ROOMS`, `DOORS`, `BAYS`, `HELIXES`). Walls, doorways, windows, stair holes, baseboards and the walking graph are all generated from them, so moving a door in one line moves its wall opening, its trim, its collision and the paths through it.
- **Walls split themselves around openings.** For each side of each room, the builder collects the doors on that line, lays out windows only where the wall faces outdoors and doesn't clash with a door, and then builds the solid pieces between, above and below each opening.
- **Floors with holes.** A rectangle-subtraction routine cuts each storey's floor into smaller slabs wherever a staircase passes through or arrives.
- **Helical staircases.** Wedge treads are placed along a parametric helix, with a collider under each one, balusters except where a floor meets the stair, and a brass handrail that follows the outer edge.
- **Each room picks its own windows** (arched, round, tall, small or plain) through a per-room style function, so the facade reads as rooms with lives instead of a grid.

### A dollhouse front that opens toward you

The outside walls are sorted into layers by the direction they face (`L0:N`, `L1:E`, and so on). Every frame, the camera's direction from the house is compared with each layer's outward normal, and any wall facing you is hidden. Turn the house and a different side swings open. Picking a floor hides the roof and the storeys above it, so you look straight down into that level.

### Walking, collision and physics

- **You are a circle.** Movement runs at a fixed 120 Hz substep. Each step pushes the circle out of nearby boxes using the closest point on each box, with a minimum-penetration fallback when you start inside one.
- **Steps and stairs.** Anything shorter than a stair riser (38 units) counts as floor, which is how you climb all three spiral staircases without special cases.
- **Spatial hash.** The 2,009 boxes are bucketed into a 240-unit grid, so each step only tests the boxes near you.

### Pathfinding in two layers

- **Across the house: Dijkstra.** A route graph has a node in every room, one on each side of every doorway, and one every eighth of a turn up each staircase, with a step-off node wherever a storey meets a stair. Dijkstra finds which doors and stairs to take.
- **Inside a room: A\*.** Between two waypoints on the same floor, if the straight line hits furniture, an eight-direction A\* search on a 14-unit grid finds a way around. Grid cells are checked lazily and cached, and the search keeps a clearance margin so you never brush past a lamp.
- **String pulling.** The A\* path is then pulled tight, keeping only the corners you can't see past, so you walk in straight lines instead of grid zigzags.
- **Recovery.** If you stop making progress, the route is planned again up to twice; only in a real tangle does the camera fade and place you at the goal. It never moves you through a wall.
- **Stops find their own standing spots.** Each stop searches outward in rings for a clear place to stand in the same room, so furniture never blocks your view of it.

### Camera

- **Flights.** Moves are chained cosine-eased flights over position, pitch and field of view, with yaw taking the shortest way around. Going inside, the camera comes down to the front walk at eye level and you walk in through the front door, the way a guest arrives; leaving with Outside walks you back out the door before the view steps back.
- **Eyes that lead.** On the way somewhere, your view looks a little ahead along the path and turns slowly at the end to face the stop.
- **Room for the panel.** When a stop's panel opens on the right, `setViewOffset` slides the view sideways so the stop stays in frame.

### Picking

Taps are hit-tested with my own slab-method ray-box intersection against the same boxes used for collision, instead of Three.js raycasting against half a million triangles. The ray finds where it first meets the house, then that storey's plan says which room you pointed at.

### Performance and polish

- **Adaptive resolution.** The loop measures frames per second; if it stays under 38 for four seconds, it lowers the pixel ratio step by step instead of stuttering.
- **Shaders compiled before the first frame,** so the first time you turn the house it doesn't hitch.
- **Floor plan.** An SVG plan tracks your position and the way you're facing in real time, and you can tap any room to go there.
- **Progress is remembered.** Opened stops and the sound setting are saved in `localStorage`, with every read and write guarded so private browsing still works.
- **Sound** is synthesized with the Web Audio API, like the main site's.
- **Every input works:** mouse drag and wheel, WASD, a touch thumbstick and pinch zoom, and keyboard access to the floor plan.
- **Accessibility:** `aria-live` captions and panels, labelled controls with `aria-pressed` and `aria-expanded`, and `prefers-reduced-motion` turns every flight into a cut and stops the markers bobbing.
- **Debuggable.** `window.__house` exposes the player, camera, renderer and scene, which made every number in this README checkable in the browser console.

## Run it locally

```bash
git clone https://github.com/suhxnitiwari/suhani-personality.git
cd suhani-personality && python3 -m http.server
```

Then open http://localhost:8000 (and http://localhost:8000/house/ for the house).

---

© 2026 Suhani Tiwari. All rights reserved. See [LICENSE](LICENSE).

Built by [Suhani Tiwari](https://suhanitiwari.com).
