# The Suhani House

*A personality you can walk through.*

**Live:** https://suhxnitiwari.github.io/suhani-personality/house/

I took ten personality tests: CliftonStrengths, VIA, 16Personalities, the Enneagram, DISC, Holland codes, Big Five, HEXACO, Schwartz values and love languages. Then I built the results as a house. My people are at the front, my ambition is upstairs, the mess of my brain is in the attic, and there's a secret garden behind. You walk up the path, through the front door, and find 22 stops. Each one is an object rather than a poster: the photos on the built-ins, ten reports on a library shelf, the espresso machine, the rom-com shelf, a mirror with words tucked into its frame. Every claim inside cites the score behind it.

You can tour it three ways: take the guided tour stop by stop, open it like a dollhouse to see every room at once, or **just explore** with nothing on screen but the house.

## The human side

The goal was for it to feel like visiting someone, not like a dashboard or a video game. That came down to a series of choices:

- **You arrive like a guest.** You come down to the front walk at eye level, walk up the path past the flowers, and the front door swings open as you reach it. You never drop in from above or pass through a wall.
- **No avatar.** A doll that doesn't look like me would be worse than no doll, so the visitor sees the house through their own eyes.
- **Nothing is rushed.** Walking pace, how fast your view turns, and how the camera eases in and out are all tuned slow. On the way to a stop your eyes lead a little ahead along the path, then turn gently to face it.
- **Every room has a life.** Each room has its own windows (arched, round, tall or small), its own chandelier, flowers and furniture. The palette is my real-life taste: wine, olive, cream and brass.
- **Content you can trust.** Every trait links back to the actual result behind it, along with how much research stands behind that test.

## The engineering side

| Human goal | How it's built |
|---|---|
| It has to be smooth, on any device | The first version was ~3,400 HTML elements placed in 3D with CSS. It ran at **3–5 fps**, because the browser composited ~1,600 separate layers every frame. I rebuilt it in WebGL with Three.js, and it now holds **60 fps** on desktop and in a phone simulation with the CPU slowed 4×. It loads in under a second. |
| Every room built by hand, without a 3D modelling tool | A small modelling kit (`kit.js`) builds everything from soft blocks with colours painted onto their vertices. Each storey is merged into a handful of meshes, so a whole floor costs the GPU about one draw call. About 3,000 lines of JavaScript make the entire house. |
| Change the plan once, and everything follows | The plan is data. Rooms, doors, bay windows and stairs are plain arrays (`layout.js`), and walls, doorways, windows, stair holes, collisions and walking paths are all generated from them. |
| Walk anywhere, up the stairs, never through walls | You're a circle that slides along collision boxes and steps up anything shorter than a stair riser, which is how you climb three spiral staircases. |
| Tap a stop and get there like a person would | Two-level pathfinding. Dijkstra's algorithm on a graph of rooms, doorways and stair steps finds the doors and stairs. A\* on a fine grid then routes round the furniture with a comfortable clearance, and the path is pulled tight so you walk in straight lines. If something blocks the way, it replans. |
| See inside the whole house at once | Outside walls are grouped by which way they face. In dollhouse view, the side turned toward you opens up, and choosing a floor lifts the storeys above it away. |
| Tap exactly what you meant | My own ray casting against the same boxes the walls are made of finds the room, floor or stop under your finger. |
| Proof it all works | An automated test (`tests/walk-stops.cjs`) drives headless Chrome with Puppeteer to walk to all 22 stops in order, recording whether each was reached, how long it took and the frame times along the way. It fails if any stop can't be reached. |
| Comfortable for everyone | Keyboard controls, a touch thumbstick, `prefers-reduced-motion` support, and resolution that adapts on slower devices without going blurry on sharp screens. Sound is synthesized with the Web Audio API, so there are no audio files. |

## What it shows I can do

This project sits where people and technology meet, and that's the kind of work I want to do:

- **Creative technology and front-end engineering:** 3D in the browser, real-time graphics, and performance work measured in frames per second.
- **Product and UX engineering:** turning a feeling ("this should feel like visiting someone") into concrete interaction decisions, then testing them.
- **Data storytelling:** turning dense assessment data into an experience people actually explore, with the evidence attached.
- **Brand and experiential work:** building a place with a clear point of view and a consistent visual identity, down to the flowers in the window boxes.

## Files

| File | What it holds |
|---|---|
| `index.html`, `game.css`, `house.css` | The page, the overlay UI and the stop panels |
| `game.js` | Renderer, lighting, camera, walking, pathfinding, dollhouse view, tours and input |
| `kit.js` | The modelling kit: blocks, merging, collisions, flowers |
| `layout.js` | The plan as data, the room graph and the stop locations |
| `shell.js` | Floors, walls, windows, stairs, turret, roofs, porch |
| `furnish.js` | Furniture, chandeliers and the 22 stop objects, room by room |
| `grounds.js` | Lawn, street, trees, flower beds and the secret garden |
| `panels.js`, `data.js`, `content.js` | What each stop says, with the scores behind it |
| `tests/walk-stops.cjs` | The walk-every-stop test |

## Run it locally

```bash
git clone https://github.com/suhxnitiwari/suhani-personality.git
cd suhani-personality && python3 -m http.server
```

Then open http://localhost:8000/house/.

---

© 2026 Suhani Tiwari. All rights reserved.

Built by [Suhani Tiwari](https://suhanitiwari.com).
