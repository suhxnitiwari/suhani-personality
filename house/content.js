/* The words the stops use, lifted from the classic house so both versions say the same thing */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');

const WORDS = [['Core', 'Intense'], ['As a friend', 'Loyal'], ['As a leader', 'Protective'], ['In love', 'Devoted'], ['At work', 'Driven'], ['Morally', 'Principled'],
  ['Socially', 'Magnetic'], ['Creatively', 'Expressive'], ['Superpower', 'Empathy'], ['Spirit', 'Faithful'], ['Dream', 'Impact'], ['Archetype', 'Guardian']];
const SWATCHES = [
  ['Wine', '#2A0F1E', 'Strong spirit: DISC Dominance and Enneagram 8, the protector'], ['Rose', '#E0567F', 'Soft heart: Love is her #1 VIA strength'],
  ['Hot pink', '#FF4F9A', 'The Creator: Creative & Expressive at 91.7%'], ['Petal', '#FF9DBB', 'Kindness #4: warmth in every highlight'],
  ['Blush', '#FBE9EE', 'Kindness #4 and Relator #1: the softness her people see'], ['Clifton blue', '#2B7DE0', 'Relationship Building: 4 of her top 5 CliftonStrengths'],
  ['Communication orange', '#F08A24', 'Influencing: her #5 strength, the one orange stripe'], ['Gifts red', '#F2434A', 'Receiving Gifts, her #1 love language'],
  ['Consul teal', '#4F93B3', '16Personalities: ESFJ is a Sentinel']
];
const SPIRIT = [
  ['Protective', 'Takes charge when a group drifts or someone gets treated badly.', 'Enneagram 8 · DISC Dominance'],
  ['Driven', 'Sets high standards and delivers on them, every time.', 'Achievement 100% · Diligence top 10%'],
  ['Principled', 'Honest, fair, and true to her word.', 'VIA Honesty #2 · Morality 20/20'],
  ['Brave', 'Says the thing other people are only thinking.', 'VIA Bravery #6 · Assertiveness 18/20'],
  ['Organized', "Loves structure, a plan, and knowing what's expected. Orderly to the core.", 'Orderliness 19/20 · Dutifulness 19/20'],
  ['A leader', 'Leads by knowing people, not by running systems.', 'VIA Leadership #7']
];
const HEART = [
  ['Loyal', "Once you're in, she's in for good. She'll defend you in rooms you're not in.", 'CliftonStrengths #1 Relator'],
  ['Empathic', 'Reads a room, and the people in it, instantly.', 'CliftonStrengths #2 Empathy'],
  ['Devoted', "Love is her top strength. For her it's something she does, not just something she feels.", 'VIA #1 Love · #4 Kindness'],
  ['Supportive', 'The advice-giver and biggest cheerleader in every room.', 'CliftonStrengths Developer'],
  ['Faithful', 'Grounded in meaning, faith, and tradition.', 'VIA Spirituality #3 · Tradition 67%'],
  ['Artistic', 'Creative in how she makes and expresses things. Art is how she talks.', 'Creative 91.7% · Artistic 17/20']
];
const VALUES = [['Achievement', '100%'], ['Security & stability', '100%'], ['Her people', '83%'], ['Truth & fairness', 'Honesty #2'], ['Independence', '83%'], ['Faith & meaning', 'Spirituality #3'], ['Making an impact', '75%']];
