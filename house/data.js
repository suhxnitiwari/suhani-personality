/* Her words, copied verbatim from the main site so the house never disagrees with it */
const HERO_LINES = ['The host with a spreadsheet.', 'Remembers your coffee order.', 'Plans the trip. Makes the playlist.', "Defends you in rooms you're not in.", 'Brings a gift. Every time.', 'Tells you the truth, kindly.', 'Starts the group chat. Runs it too.', 'Redesigns boring things for fun.'];
const CIRCLE = [
  [ // 0: center
    ['Her inner circle', 'Small circle. <em>Deep roots.</em>', 'The few who get the full version.', 'day ones', 'Day ones', 'Fierce, forever loyalty. Advice at 2am, and the first person in your corner, every single time.'],
    ['Her ride or dies', 'Ride or die. <em>No questions.</em>', "Once you're in, you're in for life.", 'ride or dies', 'Ride or dies', "She'll defend you in rooms you're not even in, and remember your coffee order, your big days, and your biggest dreams."],
    ['Her chosen family', 'Chosen family. <em>Forever.</em>', "Blood isn't the only thing that makes family.", 'her people', 'Her people', 'Hand-picked, loved out loud, and hyped through every glow-up like it was her own.'],
    ['Her soul sisters', 'Soul-deep. <em>Heart-first.</em>', 'Some bonds just click, and she guards them with everything.', 'soul sisters', 'Soul sisters', 'Late-night talks, inside jokes, and zero judgment. This circle is her whole heart.']
  ],
  [ // 1: middle
    ['Her squad', 'The squad. <em>The group chat.</em>', 'She usually made the plans.', 'the squad', 'The squad', "Magnetic in a group. She's the one making the plans and making sure nobody gets left out."],
    ['Her good vibes crew', 'Fun friends. <em>Real plans.</em>', 'Brunch, road trips, and a shared calendar.', 'good vibes crew', 'Good vibes crew', 'Warm, social, and so much fun to be around, but she still picks real talk over small talk.'],
    ['Her almost-family', 'Almost family. <em>Always welcome.</em>', 'Every day one started out right here.', 'almost family', 'Almost family', 'Show up with real energy and you might just get pulled into the inner circle.']
  ],
  [ // 2: outer
    ['Her open door', 'Open heart. <em>Open door.</em>', 'Everyone gets her kindness.', 'the whole world', 'The whole world', 'Kind and fair to everyone, and always ready to make a new friend.'],
    ['Her future friends', 'Strangers are <em>future friends.</em>', 'She never forgets a face or a name.', 'future friends', 'New faces', 'She reads a room in seconds and makes the new person feel seen.'],
    ['Her whole world', 'Fair to all. <em>Fierce for many.</em>', "She'll stand up for someone she met ten minutes ago.", 'everyone', 'Everyone', "Stand for what's right and she'll have your back, whether she's known you ten years or ten minutes."]
  ]
];
const LANGS = [
  ['Receiving Gifts', "Her #1. Thoughtful little things say \"I was thinking of you.\" It's never about the price. It's the meaning. Pro tip: a surprise vanilla latte or her favorite food never misses."],
  ['Words of Affirmation', "Tell her she did amazing. Tell her you're proud of her. Say it out loud, and mean it."],
  ['Quality Time', 'Phone down, full attention. Long dinners, late-night talks, real conversations.'],
  ['Acts of Service', 'Show up and help out before she has to ask.'],
  ['Physical Touch', "A hug is sweet, but words, time, and thoughtful gifts land so much deeper."]
];
const PHOTOS = [
  { src: 'photos/01-fridge.jpg', cap: 'the fridge of a loved eldest sister' },
  { src: 'photos/07-latte.jpg', cap: 'her and her vanilla lattes against the world' },
  { src: 'photos/04-lehenga.jpg', cap: 'celebrating everything' },
  { src: 'photos/06-blazer.jpg', cap: 'main character moment' },
  { src: 'photos/10-card.jpg', cap: 'a gift that meant everything' },
  { src: 'photos/05-yacht.jpg', cap: 'her happy place' },
  { src: 'photos/02-art.jpg', cap: 'art that stops her in her tracks' },
  { src: 'photos/09-dandiya.jpg', cap: 'just a little Indian girl' },
  { src: 'photos/03-dessert.jpg', cap: 'dessert first, always' },
  { src: 'photos/08-claypit.jpg', cap: 'her favorite cuisine' }
];
const CONTRAS = [
  ["Boss energy", "Warm host", "DISC Dominance and Enneagram 8: she takes charge.", "ESFJ, Relator, Empathy: she takes care of everyone.", "<b>Both.</b> She pushes hard, on behalf of her people.", "DISC D · 8w7 ↔ ESFJ · CliftonStrengths"],
  ["Creative", "Traditional", "The Creator: Creative &amp; Expressive at 91.7%.", "Tradition 67% and Spirituality #3: deep roots.", "<b>Both.</b> Fresh ideas, deep roots.", "MyCareerTest ↔ Schwartz Values · VIA"],
  ["Life of the party", "Small circle", "Extraversion 85. Magnetic in any room.", "Relator #1. Only a few get the key.", "<b>Both.</b> Fun with everyone, forever with some.", "Big Five ↔ CliftonStrengths"],
  ["Loves a plan", "Hates a rut", "Orderliness 19/20. Structure is comfort.", "Her career test: routine kills motivation.", "<b>Both.</b> A clear plan, filled with something new.", "Big Five ↔ MyCareerTest"],
  ["Brutally honest", "Endlessly kind", "VIA Honesty #2. She tells it like it is.", "VIA Kindness #4. She takes care of people.", "<b>Both.</b> The truth, with a whole lot of love.", "VIA Character Strengths"],
  ["Independent", "All-in on her people", "Self-Direction 83%. She does it her way.", "Benevolence 83% and Love #1. Her people first.", "<b>Both.</b> Tied at 83%: her life, her people.", "Schwartz Values · VIA"],
  ["Feels everything", "Decides fast", "Emotional awareness 19/20. She feels it all.", "DISC Dominance. She makes the call.", "<b>Both.</b> She feels it fully, then acts.", "Big Five ↔ DISC"],
  ["Big dreams", "Deep roots", "Achievement 100%, Power 75%. She aims high.", "Security 100%, Tradition 67%. Home matters.", "<b>Both.</b> Go far, and bring home along.", "Schwartz Values"]
];
const ANNOY = [
  ['Make her wait in line', 'Checks the time twice, then finds a faster line. Or starts her own.', 'DISC Dominance: slow progress is a top demotivator. She moves fast.'],
  ['Micromanage her', 'Politely takes the project back and does it her way anyway.', "Micromanagement is DISC's #1 demotivator for her, and Self-Direction is 83%."],
  ['Be fake', 'Sees right through it. From then on you only get the polite version of her.', 'Honesty is her #2 strength out of 24.'],
  ['Drag her into a pointless meeting', 'Proposes a five-minute agenda, then wraps it up herself.', 'DISC: "Red tape, unnecessary meetings, and slow decision-making" demotivate her.'],
  ['Give her the same boring task every day', 'Redesigns the whole task by Wednesday just to make it interesting.', 'Career test: "Routine kills your motivation." She\'s The Creator.'],
  ['Cancel plans last minute', 'Says "no worries," then reschedules with a firm date and time.', 'ESFJ Consul and Orderliness 19/20. The plan will happen.'],
  ['Take credit for her work', 'Calmly corrects the record at the next meeting, with receipts.', 'Achievement 100%, Honesty #2, and recognition is a DISC motivator.'],
  ['Be mean to her people', 'The protector comes out. You will hear about it, directly.', 'Relator #1 plus Enneagram 8, the protector.'],
  ['Show up with no plan', 'Pulls out her phone and makes the plan herself in thirty seconds.', "ESFJ Consul and DISC Dominance: she won't let a day go to waste."],
  ['Shoot down her idea without hearing it', 'Pitches it again, better, until you get it.', 'The Creator (91.7%) plus Bravery #6. She believes in her ideas.']
];
const DELIGHT = [
  ['Surprise her with a vanilla latte', 'Instant mood boost. The whole day just got better.', 'Straight from Suhani: works every time. Plus Receiving Gifts is her #1 love language (27%).'],
  ['Surprise her with food', 'Lights up, and remembers you as the thoughtful one.', 'Straight from Suhani: a guaranteed win. Thoughtful surprises speak her #1 love language.'],
  ['Give her a thoughtful little gift', 'Keeps it forever, and remembers exactly who gave it and when.', 'Receiving Gifts is her #1 love language (27%).'],
  ["Tell her you're proud of her", 'Smiles, goes a little quiet, and replays it all week.', 'Words of Affirmation, her #2 love language (23%).'],
  ['Plan a phones-down hang', 'Opens up and talks for three hours straight.', 'Quality Time (23%) and Relator #1.'],
  ['Give her creative freedom', 'Comes back with something ten times better than you imagined.', 'The Creator: Creative & Expressive at 91.7%.'],
  ['Hype her wins publicly', 'Glows. Then immediately sets the next, bigger goal.', 'Achievement 100%, and recognition fuels her (DISC).'],
  ['Show up on time with a plan', 'Instantly trusts you more.', 'ESFJ structure lover. A clear plan is a love letter.'],
  ['Remember the little things', "Feels completely seen. You're in the inner circle now.", 'Individualization is in her top 3 CliftonStrengths.'],
  ['Let her host', 'Plans every detail, and everyone leaves happy and fed.', 'ESFJ Consul: she is usually the one who planned the gathering.']
];
const TOMBS = [
  ['Data entry clerk', 'Cause of death: the same spreadsheet, 400 times.', 'Organized & Detail: her lowest career score', 'Give her a blank canvas.', 'Creative 91.7%'],
  ['AI data labeler', 'Tagged 50,000 photos of stop signs for a robot.', 'Routine, solo, zero creativity', 'Let her design what the AI makes.', 'Product Designer match'],
  ['Accountant', 'Closed the books. Then closed them again next month.', 'Her test warns against detail-heavy roles', 'Let her run the creative instead.', 'Creative Director match'],
  ['Investment banking analyst', '90-hour weeks formatting slides with someone else\'s name on them.', 'DISC: micromanagement + no recognition', 'Let her lead the pitch.', 'Marketing Director · Achievement 100%'],
  ['Scripted call-center rep', 'Read the same script 10,000 times. Never once got to be herself.', 'DISC: needs control + autonomy', 'Let her write the script.', 'Writer / Author match'],
  ['Micromanaged assistant', 'Died of someone reading over her shoulder.', "DISC's #1 demotivator", 'Hand her the keys and walk away.', 'Self-Direction 83%'],
  ['Tax preparer', 'Filed away between Form 1040 and Schedule C.', 'Organized & Detail: her lowest score', 'Let her design the app people file with.', 'UX/UI Designer match'],
  ['Payroll clerk', 'Same numbers, every two weeks, until the end of time.', 'Routine kills her motivation', 'Let her pitch the big idea.', 'Brand Strategist match'],
  ['Spreadsheet-only data analyst', 'Lived in pivot tables. Never met a single user.', 'Extraversion 85 · detail work is her lowest score', 'Put people behind the numbers.', 'UX Researcher match'],
  ['Content moderator', 'Scrolled the worst of the internet, alone, all shift.', 'Empathy #2: she feels everything, and she needs people', 'Let her build a community instead.', 'Nonprofit Leader · Relator #1'],
  ['IT help desk tech', 'Ticket #4,812: "Have you tried restarting it?"', 'Scripted, routine, no room to create', 'Let her build something new.', 'Game Designer match'],
  ['Compliance officer', 'Enforced policies nobody read.', 'DISC: red tape is a top demotivator', 'Let her fight for fairness that matters.', 'Public-Interest Lawyer · Fairness'],
  ['Actuary', 'Calculated risk all day. Never took one.', 'Detail-heavy and solo; 8w7 wants to go for it', 'Let her build her own thing.', 'Founder · DISC Dominance'],
  ['Bookkeeper', 'Reconciled one ledger too many.', 'Her test warns against detail-heavy roles', 'Let her design the brand instead.', 'Brand Strategist match'],
  ['Assembly line (of anything)', '"Routine kills your motivation." It did.', 'Her career test, word for word', 'Something new every single day.', 'The Creator'],
  ['Committee of committees', 'Buried under red tape.', 'DISC: bureaucracy + slow decisions', 'Fast calls and a team that moves.', 'DISC Dominance'],
  ['Insurance claims processor', 'Denied by paperwork. Appeal pending forever.', 'DISC: red tape is a top demotivator', 'Let her fight for people instead.', 'Bravery #6 · Fairness'],
  ['Medical coder', 'Translated life into codes, one billing line at a time.', 'Her test warns against detail-heavy roles', 'Let her tell the story instead.', 'Writer / Author match'],
  ['Solo night shift', 'Died of silence. Not one person to hype up.', 'Extraversion 85 · Relator #1', 'Put her in a room full of people.', 'People & Helping 67.5%'],
  ['Uncredited ghostwriter', 'Nobody ever learned her name.', 'Achievement 100% · DISC recognition', 'Put her name in lights.', 'Art Director · Creative Director']
];
const RIASEC = [
  ['R', 'Realistic', 65.6, 'Hands-On & Practical', 'The Balanced Doer: comfortable switching between hands-on work and big-picture thinking.'],
  ['I', 'Investigative', 55.6, 'Analytical & Investigative', 'The Pragmatic Thinker: analysis when it serves a purpose, then action.'],
  ['A', 'Artistic', 91.7, 'Creative & Expressive', 'The Creator: her peak by far. Self-expression and originality drive her.'],
  ['S', 'Social', 67.5, 'People & Helping', 'The Supportive Professional: she cares about people and loves to help.'],
  ['E', 'Enterprising', 66.7, 'Leadership & Influence', 'The Situational Leader: steps up to lead and enjoys influence.'],
  ['C', 'Conventional', 50.0, 'Organized & Detail', 'The Structured Flexible: likes some structure, adapts when plans change.']
];
const TOP3 = ['A', 'S', 'E'];
const ENVS = [
  ['Creative Direction', 'Brand, art direction, storytelling', 'Creator 91.7% · visual + verbal expression', 'Creative freedom and a real say in the final look.', 'Art Director · Creative Director · Brand Strategist · Writer · Film Director · Photographer'],
  ['Building for People', 'Product, UX, consumer research', 'Empathy #2 · People & Helping 67.5%', 'Real users to talk to, and room to design for them.', 'UX/UI Designer · Product Designer · UX Researcher · Game Designer'],
  ['Leading Something', 'Founder, team lead, creative director', 'DISC Dominance · Leadership #7 · 8w7', 'Ownership, fast decisions, and nobody micromanaging.', 'Founder · Creative Director · Marketing Director · Event Planner'],
  ['Teaching & Developing', 'Professor, mentor, talent development', 'Developer · Love of Learning #5', 'People to grow, and a subject she loves.', 'Professor / Teacher · Counselor · Talent Development Lead'],
  ['Mission-Driven Work', 'Education, nonprofit, public interest', 'Benevolence 83% · Spirituality #3 · Fairness', 'A mission bigger than herself, and people to fight for.', 'Nonprofit Leader · Public-Interest Lawyer · Educator']
];
const ICKS = [
  ['The "5 minutes away" friend', 'Texts "almost there!" while still in bed.', 'Honesty #2 plus an ESFJ planner. Just tell her the real time.', 'Text the real ETA. "Running 20 late" beats "almost there!" every time.'],
  ['The "idk, wherever" friend', 'Every question gets "idk, you pick," all night.', 'DISC Dominance: she loves decisiveness. Have an opinion.', 'Come with two options. She\'ll happily pick one.'],
  ['The scroller', "Watches TikToks while she's telling a story.", 'Quality Time is a top love language (23%). Be present or be gone.', 'Phone face-down. Ask a follow-up question.'],
  ['The idea thief', 'Says "great idea!" in the meeting, then pitches it as their own.', "Honesty #2 and Achievement 100%. Credit where it's due.", 'Say "that was her idea" out loud, in the meeting.'],
  ['The dinner-table talker', 'Talks over everyone, then asks "wait, what were you saying?"', 'Empathy is her #2 CliftonStrength. She listens, so listen back.', 'Let her finish, then build on what she said.'],
  ['The secret spiller', "Tells her everyone else's business.", "Relator #1: loyalty is everything. If they talk about others, they'll talk about her.", 'Keep confidences. Talk about ideas, not people.'],
  ['The forgetter', 'Forgets her birthday. Posts about theirs all week.', 'Individualization + Receiving Gifts (27%). She remembers yours.', 'Put it in your calendar. Bonus points for a small, thoughtful gift.'],
  ['The group-project ghost', '"I\'ll do my part tonight." It\'s been three days.', 'Dutifulness 19/20. Her word is her bond.', 'Do your part when you said you would, or say early if you can\'t.'],
  ['The two-faced sweetheart', 'Sweet to her and rude to everyone else.', 'Fairness and Honesty. How you treat everyone is who you are.', 'Be kind to everyone, especially people who can\'t do anything for you.'],
  ['The one-word texter', 'Replies "k." to her long, thoughtful message.', 'Words of Affirmation (23%) and Communication in her top 5. Words matter to her.', 'Match her energy. A real reply, even a short one, with some heart.'],
  ['The fake apologizer', '"Sorry you feel that way."', "Honesty #2. That's not an apology, and she knows it.", 'Say "I\'m sorry I did that," and mean it.'],
  ['The empty-handed guest', 'Shows up to her dinner with nothing. Not even a thank-you.', 'ESFJ host plus Receiving Gifts (27%).', 'Bring flowers or dessert, and say thank you.']
];
const ICK_VALUES = ['Honesty', 'Decisiveness', 'Presence', 'Fairness', 'Empathy', 'Loyalty', 'Thoughtfulness', 'Responsibility', 'Kindness', 'Connection', 'Honesty', 'Gratitude'];
const QUIZ = [
  ["The group chat can't decide where to eat. It has been 40 minutes.", ['Sends a poll with three options and a 10-minute deadline', 'Sends one restaurant, a time, and "see you there"', 'Suggests the place she knows everyone will like, even if it is not her favorite', 'Waits for someone else to step up, then backs their pick'], 1, 'The poll is close, but DISC Dominance skips the vote. She just picks somewhere everyone will like anyway. That is the ESFJ part.'],
  ['Someone takes credit for her idea in a meeting.', ['Lets it slide, then talks to them privately afterward', 'Corrects it on the spot, calmly: "So glad you liked the idea I sent Tuesday"', 'Lets it go, but makes sure her name is on the next one', 'Mentions it to her manager afterward'], 1, 'The private chat is the decoy. Bravery #6 and Honesty #2 handle it in the moment, politely. Waiting is too slow for her.'],
  ['A close friend just went through a breakup.', ['Sends a long, thoughtful text and checks in every day', 'Shows up that night with food and a plan, and zero "I told you so"', 'Gives them space and waits for them to reach out', 'Helps them list every reason it was for the best'], 1, 'The text comes too, just later. Relator #1 shows up in person first, and a thoughtful gift (food counts) is her love language.'],
  ['The Medici line is 12 people deep, and she needs her 16 oz hot vanilla latte.', ['Waits, but checks the time twice and sighs', 'Stays in line and knocks out her emails and next week\'s plan while she waits', 'Walks to the next café over', 'Decides today is a tea day'], 1, 'The sighing is real, but DISC Dominance hates wasted time, so she turns the wait into progress. Leaving is not an option: it has to be Medici.'],
  ['Her friends cancel their plans an hour before.', ['Says "no worries!" and makes other plans for the night', 'Says "no worries!" and sends three new dates before the day is over', 'Tells them honestly that it is frustrating', 'Goes anyway with whoever is still free'], 1, 'Making other plans is the decoy. ESFJ plus Orderliness 19/20: the original plan will happen, so she reschedules.'],
  ['Her group-project partner has gone silent three days before the deadline.', ['Messages them privately to check they are okay, then waits to hear back', 'Checks they are okay, then sends everyone a plan with names and deadlines', 'Quietly picks up their part herself', 'Emails the professor to flag it early'], 1, "Empathy says check on them. Dominance says don't wait for the answer. She does both, in that order."],
  ['She is handed a project with total creative freedom.', ['Asks lots of questions to pin down exactly what they want', 'Has a mood board going before anyone else has finished reading the brief', 'Researches what everyone else has done first', 'Sketches three safe options to choose from'], 1, 'Questions are the decoy; the ESFJ in her likes clear expectations. But The Creator (91.7%) moves first and asks later.'],
  ['Someone is rude to her friend at a party.', ['Pulls her friend aside and checks they are okay', 'Steps in right away and shuts it down, politely but firmly', 'Cracks a joke to defuse it', 'Lets her friend handle it, but stays close'], 1, 'Checking on her friend comes second. Enneagram 8, the protector, plus Bravery #6: she handles it first.'],
  ['She joins a new club where she knows nobody.', ['Works the room and leaves with 20 new contacts', 'Talks to everyone once, then picks two people to actually get to know', 'Sticks close to the organizer all night', 'Waits for people to come to her'], 1, 'Working the room is the decoy. Extraversion 85 gets her talking to everyone, but Relator #1 decides who she actually keeps.'],
  ["A friend asks for honest feedback on an outfit, and it's not working.", ['Says it looks great, because it is not worth the stress', 'Says "it is giving… something" and changes the subject', "Says it's not the one, then helps pick something better", 'Sends a Pinterest board later that night'], 2, 'The Pinterest board is sweet, but too late. Honesty #2 plus Developer: the truth, on the spot, with a fix.']
];
const QUIZ_EVIDENCE = ['DISC Dominance · ESFJ (Judging)', 'Honesty #2 · Bravery #6 · Assertiveness 18/20', 'Relator #1 · Receiving Gifts 27%', 'DISC Dominance · Achievement 100%', 'Orderliness 19/20 · Dutifulness 19/20', 'Empathy #2 · DISC Dominance · Leadership #7', 'Creative & Expressive 91.7% · Activity 17/20', 'Enneagram 8 · Bravery #6 · Love #1', 'Extraversion 85 · Relator #1', 'Honesty #2 · Developer'];
const DILEMMAS = [
  ['Security', '100%', 'Self-Direction', '83%', 'A stable job offer, or starting her own thing?', '<b>Security wins, narrowly.</b> She builds the side project anyway, with a safety net under it.'],
  ['Achievement', '100%', 'Benevolence', '83%', 'A big deadline, or a friend who needs her tonight?', '<b>On paper, Achievement.</b> In practice, Relator #1 shows up for the friend and finishes the work at 2 AM. Both win; sleep loses.'],
  ['Self-Direction', '83%', 'Tradition', '67%', 'Her own path, or what everyone expects?', '<b>Self-Direction wins, with respect.</b> She does it her way, and brings the family along for the ride.'],
  ['Security', '100%', 'Stimulation', '58%', 'A spontaneous trip, or the plan?', '<b>Security wins.</b> She will absolutely go on the spontaneous trip, as long as she planned it.']
];
const ASK = [
  ['Why does she take charge?', "Because four unrelated tests found it on their own: DISC puts her in Dominance, the Enneagram scores her 98% on Type 8, the Big Five puts Assertiveness at 18/20, and VIA ranks Leadership #7. But look at what she's protecting. Her #1 character strength is Love. She takes charge on behalf of people.", ['DISC Dominance', 'Enneagram 8: 98%', 'Assertiveness 18/20', 'VIA Leadership #7', 'VIA Love #1']],
  ["Why is her circle small if she's extroverted?", 'Extraversion measures social energy, not closeness. Hers is 85, so she can talk to everyone at the party. Relator, her #1 CliftonStrength, measures who gets let in. The answer is: not many, and for good.', ['Extraversion 85', 'Gregariousness 15/20', 'Relator #1']],
  ['Why does she care so much about gifts?', "Receiving Gifts is her top love language, but the reason is Individualization, in her top 3: she notices what makes each person specific. A good gift proves someone was paying attention. That's the part she values.", ['Receiving Gifts 27%', 'Individualization #3', 'Love #1']],
  ['Why does she like structure and independence?', 'Orderliness is 19/20 and Security is 100%, so she wants a plan. Self-Direction is 83% and micromanagement is her top DISC demotivator, so she wants it to be her plan. Structure she chooses, not structure she is handed.', ['Orderliness 19/20', 'Security 100%', 'Self-Direction 83%', 'DISC: micromanagement']],
  ['What kind of leader is she?', 'A relationship-first one. Four of her top five CliftonStrengths are Relationship Building and the fifth is Communication. None are about executing tasks or strategy on their own. She leads by knowing people, then moving fast for them.', ['Relator · Empathy · Individualization · Developer', 'Communication #5', 'DISC Dominance']],
  ['Why does creativity matter so much?', "It's her single strongest career signal: Creative & Expressive at 91.7%, far ahead of everything else. The Big Five (Artistic 17/20), HEXACO (Creativity 6.65), and VIA (Creativity #8) all agree. And her career test says it plainly: routine kills her motivation.", ['Creative & Expressive 91.7%', 'Artistic 17/20', 'HEXACO Creativity 6.65', 'VIA Creativity #8']],
  ['What would drain her at work?', 'Work that is repetitive, solitary, detail-heavy, and closely watched. Organized & Detail is her lowest career score, Extraversion is 85, and micromanagement and red tape are her DISC demotivators.', ['Organized & Detail 50%', 'Extraversion 85', 'DISC demotivators']],
  ['Which of her tests disagree the most?', 'DISC and the Enneagram say she takes charge; the Big Five says she is warmer than 93% of people. They measure different things. Dominance is how hard she pushes toward an outcome; Agreeableness is how much she considers people on the way.', ['DISC Dominance', 'Enneagram 8', 'Agreeableness 93rd pct']],
  ["What's her strongest pattern across tests?", 'People. Seven of her ten assessments independently point to it: CliftonStrengths, VIA, the Big Five, HEXACO, Schwartz Values, 16Personalities, and her love languages.', ['7 of 10 assessments', 'Relator #1', 'Love #1', 'Benevolence 83%']]
];
const PAIRS = [['E', 'Extraverted', 'I', 'Introverted'], ['S', 'Observant', 'N', 'Intuitive'], ['F', 'Feeling', 'T', 'Thinking'], ['J', 'Judging', 'P', 'Prospecting']];
const LETTER = {
  E: ['You both recharge around people, so your calendars will fill fast.', 'Two big voices in one room. Take turns having the floor.', null],
  I: ['You bring calm; she brings the plans.', "She'll want to go out more often than you do.", 'She recharges with people. When she drags you out, it is affection.'],
  S: ["You're both practical and grounded.", null, null],
  N: ['You bring big-picture ideas; she makes them real.', "She'll want dates and details while you're still dreaming.", 'Attach a plan to the idea, and she is all in.'],
  F: ['You both lead with your heart.', null, null],
  T: ['You bring the logic to her warmth.', 'Blunt facts without warmth can land hard.', 'Lead with care, then the facts. She will hear both.'],
  J: ['You both love a plan. The group chat will be organized.', 'Two planners, one itinerary. Decide who owns it.', null],
  P: ['You keep things spontaneous and fun.', 'Last-minute changes will test her.', 'Changing the plan is fine. Surprising her with it is not. Give her a heads-up.']
};
const MY_LL = [
  ['Receiving Gifts', 'Thoughtful little things. You already speak her #1 love language.'],
  ['Words of Affirmation', 'You will say it out loud, and she will remember it.'],
  ['Quality Time', 'Your full, phone-down attention.'],
  ['Acts of Service', 'You will help before she has to ask.'],
  ['Physical Touch', 'Your warmth. Pair it with words or a small gift and it lands even better.']
];
const COMBOS = [
  'A <em>creative traditionalist</em> who leads through people',
  'A <em>warm leader</em> who is never passive',
  "A <em>loyal friend</em> with a founder's drive",
  'A <em>planner</em> who lives to create',
  'A <em>soft heart</em> with a Dominance streak',
  'A <em>protector</em> who remembers your coffee order',
  'An <em>artist</em> who still color-codes the calendar'
];

/* inside her head and her heart: the parts of the two drawings, without the drawings */
const BRAIN = [{"name":"Frontal lobe","title":"The <em>boss</em>","line":"Decides fast and steps up first, especially for her people.","chips":["DISC Dominance","Enneagram 8 · 98%","Assertiveness 18/20","Leadership #7"],"thoughts":["Already picked the restaurant.","Has a plan B for the plan B.","Says the thing everyone is thinking."]},{"name":"Parietal lobe","title":"The <em>planner</em>","line":"Structure is how she relaxes. The calendar is color-coded.","chips":["Orderliness 19/20","Judging 82%","Dutifulness 19/20","Achievement 100%"],"thoughts":["I have a list for the list.","Early. Always early.","The spreadsheet is already shared."]},{"name":"Temporal lobe","title":"The memory for <em>people</em>","line":"She stores people, not facts: the order, the birthday, the story.","chips":["Relator #1","Individualization #3","Empathy #2"],"thoughts":["Remembers your coffee order.","I buy gifts six months early.","Knows what makes you, you."]},{"name":"Occipital lobe","title":"The <em>artist's</em> eye","line":"Sees a mood board in everything, then makes it real.","chips":["Creative & Expressive 91.7%","Artistic 17/20","The Creator"],"thoughts":["Picked these exact pinks.","Redesigns the recipe card, keeps the recipe.","Art is how she talks."]},{"name":"Limbic system","title":"The <em>soft heart</em>","line":"Deep in the middle, holding everything up: she feels it all.","chips":["Love #1","Kindness #4","Agreeableness 93","Emotional Sensitivity 94"],"thoughts":["I feel things. A lot.","Feels the whole room at once.","Love is something she does."]},{"name":"Cerebellum","title":"The <em>compass</em>","line":"Keeps her balanced: honest first, kind always.","chips":["Morality 20/20","Honesty #2","Fairness 6.76"],"thoughts":["Tells you the truth, then helps you fix it.","Fair, even when it costs her.","Her word means something."]},{"name":"Brain stem","title":"The <em>fuel line</em>","line":"Keeps the whole thing running. Mostly on vanilla lattes.","chips":["Receiving Gifts · #1 love language","Zest","Activity level 17/20"],"thoughts":["16 oz hot vanilla latte, please.","A surprise snack fixes everything.","Never really runs on empty."]}];
const HEARTPARTS = [{"name":"Right atrium","title":"Who gets <em>in</em>","line":"A small circle, chosen carefully, kept for life.","chips":["Relator #1","Love #1","Benevolence 83%"],"thoughts":["Day ones get a key.","Remembers who showed up.","Once you are in, you are in."]},{"name":"Left atrium","title":"How she <em>gives</em> it","line":"Thoughtful, specific, and early: love she can hand you.","chips":["Kindness #4","Individualization #3","Receiving Gifts 27%"],"thoughts":["I remember your coffee order.","The gift is never random.","Bought months before the birthday."]},{"name":"Right ventricle","title":"What <em>fills</em> it up","line":"Words that mean it, time with the phones down, and a surprise latte.","chips":["Words of Affirmation 23%","Quality Time 23%","Receiving Gifts 27%"],"thoughts":["Hearing that you are proud of her.","A phones-down hang.","A surprise vanilla latte."]},{"name":"Left ventricle","title":"The strongest <em>muscle</em>","line":"Loyalty does the heavy lifting: she defends you in rooms you are not in.","chips":["Dominance × Love #1","Bravery #6","Enneagram 8"],"thoughts":["Defends you when you are not there.","Shows up before you ask.","Soft heart. Strong spirit."]},{"name":"Aorta","title":"Where it <em>flows</em>","line":"Outward: to her family, her faith, and the people she can lift.","chips":["Spirituality #3","Tradition 67%","Developer"],"thoughts":["Family first.","Faith keeps it steady.","Lifts people up."]},{"name":"Pulmonary artery","title":"What it <em>filters</em> out","line":"Fake does not get through. Honesty is the filter.","chips":["Honesty #2","Morality 20/20","Fairness 6.76"],"thoughts":["Fake apologies.","Two-faced sweetness.","Anything performative."]}];
const RECEIPTS = [
  { tab: 'Big Five', title: 'Big Five', note: 'Percentiles for the domains; facets are out of 20.', wave: true, groups: [
    ['Domains (percentile)', [['Agreeableness', 93, 100], ['Conscientiousness', 93, 100], ['Extraversion', 85, 100], ['Openness', 69, 100]]],
    ['Extraversion facets', [['Assertiveness', 18, 20], ['Activity level', 17, 20], ['Gregariousness', 15, 20], ['Friendliness', 14, 20], ['Cheerfulness', 12, 20]]],
    ['Agreeableness facets', [['Morality', 20, 20], ['Altruism', 18, 20], ['Modesty', 16, 20], ['Trust', 14, 20], ['Sympathy', 14, 20], ['Cooperation', 11, 20]]],
    ['Conscientiousness facets', [['Orderliness', 19, 20], ['Dutifulness', 19, 20], ['Self-efficacy', 17, 20], ['Self-discipline', 17, 20], ['Achievement-striving', 13, 20]]],
    ['Openness facets', [['Emotional awareness', 19, 20], ['Artistic interests', 17, 20], ['Intellect', 12, 20], ['Imagination', 11, 20]]]
  ] },
  { tab: 'HEXACO', title: 'HEXACO', note: 'The average person scores 5.0; two-thirds of people land between 4 and 6.', groups: [
    ['Honesty-Humility', [['Fairness', 6.76, 10], ['Sincerity', 5.72, 10]]],
    ['Extraversion', [['Sociability', 6.52, 10], ['Liveliness', 5.31, 10], ['Social boldness', 4.97, 10]]],
    ['Conscientiousness', [['Diligence', 6.42, 10], ['Perfectionism', 6.31, 10], ['Organization', 5.27, 10]]],
    ['Openness', [['Creativity', 6.65, 10], ['Inquisitiveness', 6.25, 10], ['Aesthetic appreciation', 4.74, 10], ['Unconventionality', 4.74, 10]]],
    ['Heart', [['Sentimentality', 6.76, 10], ['Altruism', 6.44, 10]]]
  ] },
  { tab: 'VIA strengths', title: 'VIA Character Strengths', note: 'Her top 20 of 24, in order.', quotes: [["Love", "I remember your coffee order. I buy gifts six months early when I see something that reminds me of you."], ["Honesty", "I'd rather admit something uncomfortable than pretend everything is fine."], ["Spirituality", "Who am I becoming? What kind of life do I want to build? I think about significance more than logistics."], ["Kindness", "It's not enough for me to care internally. I want to do things for people. Kindness is the action version of love."], ["Love of Learning", "I don't just want the answer. I want to know why."], ["Bravery", "Caring deeply doesn't make me passive. I'll speak up, even when it's unpopular."]], list: ['Love', 'Honesty', 'Spirituality', 'Kindness', 'Love of Learning', 'Bravery', 'Leadership', 'Creativity', 'Judgment', 'Curiosity', 'Perspective', 'Social Intelligence', 'Hope', 'Teamwork', 'Zest', 'Fairness', 'Perseverance', 'Humility', 'Gratitude', 'Appreciation of Beauty'].map((n, i) => [String(i + 1), n]) },
  { tab: 'Values', title: 'Schwartz Values (PVQ)', note: 'All ten values.', groups: [
    ['Very high', [['Achievement', 100, 100], ['Security', 100, 100], ['Benevolence', 83, 100], ['Self-Direction', 83, 100]]],
    ['High and average', [['Power', 75, 100], ['Tradition', 67, 100], ['Conformity', 58, 100], ['Stimulation', 58, 100], ['Universalism', 56, 100], ['Hedonism', 50, 100]]]
  ] },
  { tab: 'Career test', title: 'Career Personality: The Creator', note: 'Profile type: Focused. One clear lead strength with solid range behind it.', groups: [
    ['All eight dimensions', [['Creative & Expressive', 91.7, 100], ['People & Helping', 67.5, 100], ['Leadership & Influence', 66.7, 100], ['Hands-On & Practical', 65.6, 100], ['Team & Collaborative', 65.6, 100], ['Independent & Autonomous', 61.1, 100], ['Analytical & Investigative', 55.6, 100], ['Organized & Detail', 50, 100]]]
  ], list: [['1', 'Original thinking'], ['2', 'Visual and verbal expression'], ['3', 'Brainstorming and ideation'], ['4', 'Adaptability to new approaches']], listTitle: 'Key strengths' },
  { tab: 'Enneagram', title: 'Enneagram (Truity)', note: 'Her 8 and 1 tied at 98%, so read the top of the list together.', groups: [
    ['All nine types', [['8 · Challenger', 98, 100], ['1 · Reformer', 98, 100], ['4 · Individualist', 92, 100], ['6 · Loyalist', 90, 100], ['5 · Investigator', 80, 100], ['3 · Achiever', 79, 100], ['2 · Helper', 77, 100], ['7 · Enthusiast', 75, 100], ['9 · Peacemaker', 42, 100]]]
  ] },
  { tab: 'DISC', title: 'DISC: Dominance', note: 'From her BlossomUp report.', list: [['S', 'Assertive and confident'], ['S', 'Goal-oriented'], ['S', 'Leadership and vision'], ['S', 'Resilience'], ['M', 'Motivated by control and autonomy'], ['M', 'Motivated by recognition and achievement'], ['M', 'Motivated by challenge and competition'], ['C', 'Executive leadership'], ['C', 'Entrepreneurship'], ['C', 'Sales and business development'], ['C', 'Project management'], ['C', 'Law and politics']], listNote: 'S = strength · M = motivator · C = suggested career path' },
  { tab: 'CliftonStrengths', title: 'CliftonStrengths Top 5', note: '4 Relationship Building (blue) and 1 Influencing (orange).', list: [['1', 'Relator: deep, lasting friendships with the right people'], ['2', 'Empathy: senses what others think and feel'], ['3', 'Individualization: sees what makes each person unique'], ['4', 'Developer: spots and grows potential in others'], ['5', 'Communication: brings ideas to life in words']] },
  { tab: '16Personalities', title: 'ESFJ-T · The Consul', note: 'A Sentinel type. Bars show how strong each preference is.', groups: [['Preference strength', [['Extraverted', 73, 100], ['Observant', 57, 100], ['Feeling', 59, 100], ['Judging', 82, 100]]]], quotes: [['Turbulent', 'I hold myself to high standards. When something matters to me, I give it my full attention.'], ['Feeling', 'I remember birthdays, plan gifts months ahead, and pay attention to what makes someone feel known.']], list: [['E', 'Extraverted: energized by people'], ['S', 'Observant: practical, grounded in the real world'], ['F', 'Feeling: decides with her heart and values'], ['J', 'Judging: loves a plan and structure'], ['T', 'Turbulent: always pushing to be better']] },
  { tab: 'Love languages', title: '5 Love Languages', note: 'Her #1 is Receiving Gifts.', groups: [
    ['All five', [['Receiving Gifts', 27, 30], ['Words of Affirmation', 23, 30], ['Quality Time', 23, 30], ['Acts of Service', 20, 30], ['Physical Touch', 7, 30]]]
  ] }
];
const LENS = {"Big Five": ["broad personality traits", 4, "describing how someone generally thinks, feels, and acts"], "HEXACO": ["broad traits, plus honesty and humility", 4, "trait description, especially integrity"], "VIA strengths": ["character strengths", 3, "naming what someone does at their best"], "Values": ["what motivates her choices", 4, "understanding priorities and trade-offs"], "Career test": ["vocational interests (the RIASEC model)", 3, "exploring careers; the RIASEC model is well-studied, this particular test less so"], "Enneagram": ["core motivations, as a framework", 2, "reflection and conversation"], "DISC": ["behavioral style at work", 2, "team conversations about work style"], "CliftonStrengths": ["natural talents", 3, "developing strengths at school and work"], "16Personalities": ["preferences for energy, information, decisions, and structure", 2, "shared language and self-reflection"], "Love languages": ["preferred ways to give and receive care", 1, "conversations about relationships"]};
const SUPPORT = ['', 'Reflective framework', 'Limited validation', 'Moderate support', 'Strong research support'];
const SCN = {
  what: [['Cancels plans last minute', 'Reliability', 'Dutifulness 19/20 · Security 100% · ESFJ planner', 'cancellation'], ['Shows up 30 minutes late', 'Respect for her time', 'Orderliness 19/20 · DISC: slow progress frustrates her', 'lateness'], ['Takes credit for her idea', 'Fairness', 'Honesty #2 · Fairness 6.76 · Achievement 100%', 'credit']],
  how: [['Explains honestly, right away', 2], ['Says nothing', -1], ['Makes up an excuse', -2]],
  next: [['Reschedules or fixes it themselves', 2], ['Moves on like nothing happened', -1], ['Then asks her for a favor', -2]]
};
