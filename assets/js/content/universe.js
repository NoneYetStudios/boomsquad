/**
 * BOOM SQUAD - Universe & Progression Content Data
 * Contains Device Types, Locations, STF Shared Universe Organizations,
 * Manual Statuses, Scripted Training Missions, and Achievements.
 *
 * Expandable without modifying core game engine logic.
 */

const DEVICE_TYPES = [
    { name: "Portable Boom Generator", category: "standard", icon: "💣" },
    { name: "Unauthorized Countdown Appliance", category: "appliance", icon: "⏲️" },
    { name: "Suspicious Container", category: "container", icon: "📦" },
    { name: "Aggressively Timed Device", category: "standard", icon: "⏱️" },
    { name: "Experimental Lunch Storage Unit", category: "food", icon: "🍱" },
    { name: "High-Energy Picnic Basket", category: "food", icon: "🧺" },
    { name: "Corporate Refrigerator Incident", category: "fish", icon: "🐟" },
    { name: "Unstable Aquarium Apparatus", category: "aquatic", icon: "🐠" },
    { name: "Seasonal Turkey Enhancement Device", category: "poultry", icon: "🦃" },
    { name: "Explosive Decorative Gourd", category: "gourd", icon: "🎃" },
    { name: "Ticking Fish Container", category: "fish", icon: "🐟" },
    { name: "Over-Pressurized Gravy Vessel", category: "food", icon: "🍲" },
    { name: "Unlicensed Acoustic Bass Amplifier", category: "bass", icon: "🔊" },
    { name: "Volatile Tupperware Cylinder", category: "fish", icon: "🧪" },
    { name: "Self-Heating Filing Cabinet", category: "office", icon: "🗄️" },
    { name: "Hyper-Reactive Espresso Machine", category: "appliance", icon: "☕" },
    { name: "Autonomous Poultry Brooder Mk. IV", category: "poultry", icon: "🐔" },
    { name: "Tactical Glitter Dispersal Unit", category: "container", icon: "✨" },
    { name: "Sub-Orbital Crockpot Prototype", category: "appliance", icon: "🥘" },
    { name: "Vibrating Fax Machine of Unknown Origin", category: "office", icon: "📠" },
    { name: "Thermonuclear Casserole Carrier", category: "food", icon: "🥘" },
    { name: "Municipal Confetti Cannon (Overclocked)", category: "standard", icon: "🎉" },
    { name: "Bioluminescent Seafood Thermos", category: "fish", icon: "🦑" },
    { name: "Ornamental Squash With Digital Readout", category: "gourd", icon: "🍐" }
];

const LOCATIONS = [
    "Corporate Breakroom",
    "Employee Refrigerator (Shelf 3)",
    "Municipal Aquarium",
    "County Fair",
    "Turkey Pavilion",
    "Decorative Gourd Expo",
    "Shopping Mall Food Court",
    "Central Public Library",
    "Sub-Basement Office Building",
    "Logistics Warehouse 7B",
    "Applied Condiment Research Lab",
    "Autumn Festival Grounds",
    "Chicken Transport Facility",
    "Basslift Championship Arena",
    "Municipal Public Park",
    "Farm Supply Warehouse",
    "Eastside Community Center",
    "Executive Boardroom Annex",
    "Department of Gravy Annex",
    "Abandoned Bowling Alley Pro Shop",
    "Regional Accounting Bullpen",
    "Mayor's Ornamental Gazebo",
    "Aquatic Petting Zoo Lobby",
    "Interstate Rest Stop Vending Area"
];

const STF_ORGANIZATIONS = [
    "Basslift Competition Committee",
    "United Poultry Emergency Office",
    "Department of Excessive Gravy",
    "Municipal Aquarium Oversight Board",
    "Turkey Preparedness Agency",
    "Decorative Gourd Safety Council",
    "Office of Recreational Chickens",
    "Bureau of Unexplained Lunch Odors",
    "Sub-Committee on Acoustic Fish",
    "National Association of Competitive Forklifting",
    "Institute for Tactical Tupperware",
    "Regional Casserole Stabilization Board"
];

const MANUAL_STATES = [
    "Under Review",
    "Misplaced Behind Copier",
    "Located (Written in Crayon)",
    "Stained with Gravy",
    "Pages 4–9 Missing",
    "Translated from Assembly",
    "Held Hostage by Geese",
    "Approved by Legal (Redacted)",
    "Upside Down",
    "Replaced with Waffle Menu"
];

const LOGIC_OPERATORS_REFERENCE = {
    note: "In all Department of Boom Prevention circuits: 1 = TRUE (ON) and 0 = FALSE (OFF).",
    operators: [
        {
            op: "AND",
            summary: "TRUE (1) only if both inputs are TRUE (1).",
            detail: "Both inputs must be 1 for the output to be 1. Otherwise, it is 0.",
            examples: [
                "TRUE (1) + TRUE (1) = TRUE (1)",
                "TRUE (1) + FALSE (0) = FALSE (0)",
                "FALSE (0) + FALSE (0) = FALSE (0)"
            ]
        },
        {
            op: "OR",
            summary: "TRUE (1) if either input is TRUE (1).",
            detail: "If at least one input is 1 (or both are 1), the output is 1.",
            examples: [
                "TRUE (1) + FALSE (0) = TRUE (1)",
                "TRUE (1) + TRUE (1) = TRUE (1)",
                "FALSE (0) + FALSE (0) = FALSE (0)"
            ]
        },
        {
            op: "XOR",
            summary: "TRUE (1) only if exactly one input is TRUE (1).",
            detail: "Short for 'Exclusive OR'. Output is 1 when the two inputs are DIFFERENT. If both inputs are 1 (or both are 0), XOR outputs 0.",
            examples: [
                "TRUE (1) + FALSE (0) = TRUE (1)",
                "TRUE (1) + TRUE (1) = FALSE (0)",
                "FALSE (0) + FALSE (0) = FALSE (0)"
            ]
        },
        {
            op: "NOT",
            summary: "Reverses the value.",
            detail: "Flips a single input to its opposite: 1 becomes 0, and 0 becomes 1.",
            examples: [
                "NOT TRUE (1) = FALSE (0)",
                "NOT FALSE (0) = TRUE (1)"
            ]
        },
        {
            op: "NAND",
            summary: "Opposite of AND.",
            detail: "Short for 'NOT-AND'. First do AND, then flip the result! Output is TRUE (1) unless BOTH inputs are TRUE (1).",
            examples: [
                "TRUE (1) + FALSE (0) = TRUE (1)",
                "FALSE (0) + FALSE (0) = TRUE (1)",
                "TRUE (1) + TRUE (1) = FALSE (0)"
            ]
        }
    ]
};

const TRAINING_MISSIONS = [
    {
        id: 1,
        chapter: "CHAPTER 1 OF 8",
        title: "Training 101: Wire Panel & Chassis Readouts",
        newConcept: "Wire Panel & Top Chassis HUD (S/N & Batteries)",
        reinforces: "Core Interface Fundamentals",
        location: "Training Cubicle 4A",
        device: "Practice Cardboard Bomb (Non-Dairy)",
        description:
            "Welcome to the Department of Boom Prevention. Every module prints its active rule along its bottom strip, and some rules reference the device's Serial Number (S/N) or Battery count (PWR) on the top HUD bar.",
        instructionalText:
            "1. Look at the bottom strip of the WIRE PANEL to read its active PROTOCOL rule.\n2. If the rule mentions the Serial Number (EVEN/ODD last digit) or Battery Count (PWR CELLS), check the dark Chassis HUD bar at the top of the screen.\n3. Click the single wire that satisfies the rule to snip it.\n4. EQUIPMENT TIP: Press [M] or click '🔭 BOMB TECH VISOR' in the HUD anytime to activate 2x/3x/4x Inspection Optics while interacting with modules!",
        objectivePanel: {
            learning:
                "How to read a module's bottom PROTOCOL rule strip and cross-reference the top Chassis Telemetry bar (Serial S/N & Battery PWR count).",
            successCriteria:
                "Snip the single correct wire so the module status LED switches from ARMED (red) to SAFE (green).",
            commonMistakes:
                "Cutting a wire before reading the bottom rule strip, or confusing wire position (#1 at the top) with voltage (V)."
        },
        timeSeconds: 120,
        modules: ["wires"],
        difficulty: 1,
        introDispatch:
            "Welcome to Boom Squad orientation. Read the protocol strip at the bottom of the Wire Panel and cut the single matching wire. HR asks that you do not cut your own sleeves."
    },
    {
        id: 2,
        chapter: "CHAPTER 2 OF 8",
        title: "Training 102: Keypad Symbol Decoding",
        newConcept: "Keypad Decoder (Symbol-to-Digit Translation)",
        reinforces: "Wire Panel Protocols (Mission 101)",
        location: "Orientation Annex B",
        device: "Dual-Module Training Toaster",
        description:
            "Field devices frequently pair a Wire Panel with an encrypted Keypad Decoder. You will reinforce your wire-snipping skills while learning how to translate Greek cipher symbols into a 4-digit unlock code.",
        instructionalText:
            "1. On the KEYPAD DECODER, inspect the 4 glowing target symbols at the top-left of the module.\n2. Match each symbol left-to-right against the Symbol=Digit legend strip directly below the screen.\n3. Enter the 4 digits on the numeric keypad and press the green OK button (use CLR if you mistype).\n4. Disarm the companion Wire Panel using your Lesson 101 training.",
        objectivePanel: {
            learning:
                "How to translate encrypted target symbols using the Keypad Decoder's on-module legend strip and submit a 4-digit code.",
            successCriteria:
                "Both the Wire Panel and Keypad Decoder display SAFE (2 / 2 DISARMED) before the countdown expires.",
            commonMistakes:
                "Entering symbols in the wrong left-to-right order, or forgetting to press the green OK button after typing the 4 digits."
        },
        timeSeconds: 145,
        modules: ["wires", "keypad"],
        difficulty: 1,
        introDispatch:
            "Training Mission 102. Reinforce your wire skills, then match the four symbols on the Keypad Decoder against its legend strip and press OK."
    },
    {
        id: 3,
        chapter: "CHAPTER 3 OF 8",
        title: "Training 103: Carrier Wave & Frequency Tuning",
        newConcept: "Frequency Dial (MHz & Waveform Alignment)",
        reinforces: "Wire Panel (101) + Keypad Decoder (102)",
        location: "Acoustic Calibration Closet",
        device: "Resonant Practi-Bomb Mk. III",
        description:
            "Adds the Frequency Dial oscilloscope. Learn to align both carrier frequency (MHz) and waveform shape (SINE, SQUARE, TRIANGLE) while reinforcing Wire Panel and Keypad Decoder procedures.",
        instructionalText:
            "1. Read the TUNE RULE at the bottom of the FREQUENCY DIAL to find the required MHz value and wave mode.\n2. Use the slider or -0.5 / +0.5 step buttons to set the exact MHz readout.\n3. Click the matching waveform button (SINE, SQUARE, or TRIANGLE) so your wave overlays the green target wave, then press LOCK.\n4. Neutralize the remaining Wire and Keypad modules.",
        objectivePanel: {
            learning:
                "How to tune the Frequency Dial to both the target frequency (MHz) and modulation mode (SINE, SQUARE, or TRIANGLE) before locking.",
            successCriteria:
                "Lock the Frequency Dial when your signal turns green, and disarm the Wire Panel and Keypad Decoder (3 / 3 DISARMED).",
            commonMistakes:
                "Matching the MHz number but leaving the wrong waveform shape selected, or forgetting to click LOCK after tuning."
        },
        timeSeconds: 170,
        modules: ["wires", "keypad", "frequency"],
        difficulty: 1,
        introDispatch:
            "Now introducing the Frequency Dial. Set both the megahertz value and the wave shape, then press LOCK. If you hear smooth jazz, you have tuned too far left."
    },
    {
        id: 4,
        chapter: "CHAPTER 4 OF 8",
        title: "Training 104: Switch Sequencing & Dispatch Hints",
        newConcept: "Switch Sequencer & Radio Dispatch Hint Button",
        reinforces: "Wire Panel (101) + Frequency Dial (103)",
        location: "Corporate Breakroom",
        device: "Ticking Fish Container (Simulation)",
        description:
            "Introduces the Switch Sequencer and teaches you how to use the Radio Dispatch panel. You can press '💡 REQUEST MANUAL HINT' on the left Dispatch panel anytime you want an exact readout for an active module.",
        instructionalText:
            "1. On the SWITCH SEQUENCER, read the bottom SEQUENCE RULE to see whether to flip switches in ASCENDING (Lowest → Highest kVA) or DESCENDING (Highest → Lowest kVA) order.\n2. Inspect the kVA rating printed beneath each of the 4 switches (SW-1 through SW-4) and flip all 4 in exact order.\n3. Try clicking '💡 REQUEST MANUAL HINT' in the Radio Dispatch panel on the left for live telemetry assistance!",
        objectivePanel: {
            learning:
                "How to sequence switches by kVA load (Ascending vs. Descending) and how to request on-demand telemetry hints from Radio Dispatch.",
            successCriteria:
                "Flip all 4 switches in the required kVA order and clear the companion Wire and Frequency modules (3 / 3 DISARMED).",
            commonMistakes:
                "Sorting switches by their label (SW-1 to SW-4) instead of their kVA load number, or flipping Ascending when the rule asks for Descending."
        },
        timeSeconds: 175,
        modules: ["wires", "frequency", "switches"],
        difficulty: 1,
        isFishIncident: true,
        introDispatch:
            "Welcome to Switch Sequencer training. Check the kVA load under each switch, and remember you can press Request Manual Hint on your radio panel if you ever want a second opinion."
    },
    {
        id: 5,
        chapter: "CHAPTER 5 OF 8",
        title: "Training 105: Boolean Logic Symbols (Step-by-Step)",
        newConcept: "Logic Symbols (1 = TRUE, 0 = FALSE • NOT, AND, OR, NAND, XOR)",
        reinforces: "Reading Input Telemetry & On-Module Reference Guides",
        location: "Boolean Orientation Lab",
        device: "Guided Logic Trainer (1 = TRUE, 0 = FALSE)",
        description:
            "Dedicated, stress-free Boolean Logic lab! Remember: 1 = TRUE and 0 = FALSE. Walks through one operator at a time (NOT → AND → OR → NAND → XOR) with plain-English explanations and unlimited zero-strike retries.",
        instructionalText:
            "1. Remember the golden rule: 1 = TRUE and 0 = FALSE.\n2. Read the input values A, B, and C at the top of the module and the Field Manual Boolean Logic Cheat Sheet hint in the center.\n3. Click nodes Ω1, Ω2, and Ω3 to toggle each output between 0 (FALSE) and 1 (TRUE), then click VERIFY OPERATOR STEP.\n4. Tap '📖 FIELD MANUAL' anytime to open the Boolean Logic Cheat Sheet (AND: Both conditions required, OR: Either condition required, NOT: Reverse condition, XOR: Exactly one condition required, NAND: Anything except both)!",
        objectivePanel: {
            learning:
                "How Boolean Logic operators (NOT, AND, OR, NAND, XOR) evaluate 1 (TRUE) and 0 (FALSE) inputs, one operator at a time.",
            successCriteria:
                "Complete all 5 guided operator steps (NOT, AND, OR, NAND, and XOR) to certify the Logic Symbols trainer.",
            commonMistakes:
                "Confusing NAND (Opposite of AND: only 0 when both inputs are 1) with OR, or forgetting that XOR is 0 when both inputs are 1."
        },
        timeSeconds: 300,
        modules: ["symbols"],
        difficulty: 1,
        isLogicTutorial: true,
        unlimitedRetries: true,
        introDispatch:
            "Welcome to Logic Symbols training. Remember that 1 means TRUE and 0 means FALSE. We will introduce one operator at a time, and wrong answers will not cause a strike in this lab."
    },
    {
        id: 6,
        chapter: "CHAPTER 6 OF 8",
        title: "Training 106: Multi-Stage Memory Panel",
        newConcept: "Memory Panel (Position vs. Label Retention Across 3 Stages)",
        reinforces: "Logic Symbols (105) + Switch Sequencer (104)",
        location: "Cognitive Retention Lab 2C",
        device: "Sequential Memory Toaster",
        description:
            "Introduces the 3-stage Memory Panel while reinforcing live Boolean Logic circuits and Switch Sequencing. In the Memory Panel, you must remember both the POSITION and the LABEL of buttons you press in Stages 1 and 2.",
        instructionalText:
            "1. On the MEMORY PANEL, note the difference between a button's LABEL (the big digit printed on it) and its POSITION (POS 1, POS 2, POS 3, POS 4 from left to right).\n2. Read the bottom instruction for Stage 1, press the correct button, and mentally note both its Position and its Label.\n3. Use what you pressed in Stage 1 (and Stage 2) to answer Stages 2 and 3!\n4. Also disarm the companion Switch Sequencer and Logic Symbols modules.",
        objectivePanel: {
            learning:
                "How to distinguish button POSITION (1st–4th from left) from button LABEL (printed number) and recall them across Stages 1, 2, and 3.",
            successCriteria:
                "Clear all 3 stages of the Memory Panel (S1, S2, S3 pips lit) along with Logic Symbols and Switch Sequencer (3 / 3 DISARMED).",
            commonMistakes:
                "Pressing the button at Position #3 when the rule asks for the button Labeled '3', or forgetting which button you pressed in Stage 1."
        },
        timeSeconds: 195,
        modules: ["symbols", "switches", "memory"],
        difficulty: 2,
        introDispatch:
            "Training 106 introduces the Memory Panel. Pay close attention to whether the rule asks for a button's Position or its printed Label, and remember what you pressed in Stage 1!"
    },
    {
        id: 7,
        chapter: "CHAPTER 7 OF 8",
        title: "Training 107: Matrix Pattern Recognition",
        newConcept: "Pattern Module (3×3 Grid Criteria Selection)",
        reinforces: "Keypad Decoder (102) + Memory Panel (106)",
        location: "Geometric Containment Wing",
        device: "Grid-Locked Casserole Carrier",
        description:
            "Introduces the 3×3 Pattern Module alongside familiar Keypad Decoder and Memory Panel modules. Learn to highlight every cell that matches the active mathematical or geometric rule before committing.",
        instructionalText:
            "1. Read the PATTERN RULE along the bottom strip of the PATTERN MODULE (e.g., all EVEN numbers, all PRIME numbers [2, 3, 5, 7], or X-DIAGONAL cells ≥ 5).\n2. Click every cell in the 3×3 grid that satisfies the rule so it glows amber (and leave non-matching cells unlit).\n3. Click COMMIT PATTERN to lock in the grid, and solve the Keypad and Memory modules.",
        objectivePanel: {
            learning:
                "How to filter a 3×3 matrix by number properties (Even, Prime: 2/3/5/7) or X-Diagonal positions (corners + center) and commit the complete set.",
            successCriteria:
                "Highlight every matching cell (and no extras) on the Pattern Module, press COMMIT PATTERN, and disarm Keypad & Memory (3 / 3 DISARMED).",
            commonMistakes:
                "Mistaking 1 or 9 for prime numbers (primes on the grid are 2, 3, 5, and 7), or missing one matching cell before clicking COMMIT PATTERN."
        },
        timeSeconds: 205,
        modules: ["keypad", "memory", "pattern"],
        difficulty: 2,
        introDispatch:
            "Training 107 introduces the Pattern Module. Check every cell in the three-by-three matrix before committing, and remember that 1 and 9 are not prime numbers."
    },
    {
        id: 8,
        chapter: "CHAPTER 8 OF 8",
        title: "Training 108: Emergency Override & Final Exam",
        newConcept: "Emergency Override (Cross-Device Telemetry Auth Sum)",
        reinforces: "Full Campaign Review: Wires (101) + Logic (105) + Pattern (107)",
        location: "Department Certification Vault",
        device: "Comprehensive Evaluation Appliance",
        description:
            "Your final certification exam! Introduces the two-step Emergency Override module — which combines three pieces of device telemetry into an Authorization Sum — alongside a full review of Wires, Logic Symbols, and Pattern Grid.",
        instructionalText:
            "1. On the EMERGENCY OVERRIDE module, calculate the Auth Sum by adding three numbers from the top Chassis HUD bar:\n   (Last Digit of Serial S/N) + (Number of PWR Battery Cells) + (Total Number of Modules on this device).\n2. Click the matching AUTH-# button in Step 1.\n3. Click '⚠️ FLIP HAZARD COVER' to open the safety cover, then press the big red 'ENGAGE OVERRIDE' button.\n4. Disarm the remaining review modules to earn full Field Certification!",
        objectivePanel: {
            learning:
                "How to compute the Emergency Override Auth Sum (Serial Last Digit + Batteries + Total Modules), select the AUTH code, flip the hazard cover, and engage.",
            successCriteria:
                "Neutralize all 4 modules (Wire Panel, Logic Symbols, Pattern Module, and Emergency Override) to graduate from the Training Campaign.",
            commonMistakes:
                "Flipping the safety cover and pressing ENGAGE OVERRIDE before selecting an AUTH-# button, or forgetting to add the total module count (4) to the sum."
        },
        timeSeconds: 225,
        modules: ["wires", "symbols", "pattern", "override"],
        difficulty: 2,
        introDispatch:
            "Final certification exam! For the Emergency Override, add the Serial's last digit, the Battery count, and the Total Module count together. Select that AUTH code, flip the hazard cover, and press the big red button!"
    }
];

const FISH_CONTAINER_LORE_STAGES = [
    {
        stage: 1,
        badge: "🐟 FISH LORE STAGE 1 // SHELF 3 ORIGIN",
        statusSummary: "Ticking on Breakroom Shelf 3 (Labeled 'KEVIN - 2019')",
        location: "Employee Refrigerator (Shelf 3)",
        device: "Ticking Fish Container (Labeled 'KEVIN - 2019')",
        description:
            "A container located on Shelf 3 of the employee refrigerator has begun emitting ticking sounds and occasional sparks. Contents are believed to be an old fish dish labeled 'KEVIN - DO NOT EAT (2019).' Kevin left the company four years ago. The exact age and intentions of the fish remain under investigation.",
        introDispatch:
            "Dispatch to Boom Squad: You are approaching the Shelf 3 Fish Container. Bio-sensors confirm it is ticking in 4/4 time. Do not remove the Tupperware lid."
    },
    {
        stage: 2,
        badge: "🐟 FISH LORE STAGE 2 // UNAUTHORIZED RELOCATION",
        statusSummary: "The fish container relocated itself.",
        location: "Biometric Executive Floor Safe (Locked)",
        device: "Self-Relocating Fish Container",
        description:
            "Despite being locked inside triple-lined containment after your previous encounter, the fish container relocated itself overnight into the Chief Financial Officer's biometric floor safe. Security footage shows the safe door was never opened. The container is warm to the touch.",
        introDispatch:
            "Update on the Breakroom Fish Container: The fish container relocated itself into a locked biometric safe. Facilities has stopped asking how and simply handed us the crowbar."
    },
    {
        stage: 3,
        badge: "🐟 FISH LORE STAGE 3 // POSTAL SOVEREIGNTY",
        statusSummary: "The fish container has acquired a mailing address.",
        location: "Suite 404-F (Inside Sealed Main Elevator Shaft)",
        device: "Registered Fish Container (Suite 404-F)",
        description:
            "The fish container has acquired a mailing address (Suite 404-F), a four-digit internal phone extension, and a notary stamp—despite currently hovering three inches above a steel girder inside the sealed main elevator shaft. The Postal Service insists on delivering its periodicals.",
        introDispatch:
            "Approach carefully: The fish container has acquired a mailing address inside the sealed elevator shaft and is currently receiving certified mail."
    },
    {
        stage: 4,
        badge: "🐟 FISH LORE STAGE 4 // FORMAL GRIEVANCE",
        statusSummary: "The fish container submitted a complaint.",
        location: "HR Arbitration Ceiling Plenum (Above Room 2B)",
        device: "Aggrieved Fish Container (Pending Arbitration)",
        description:
            "The fish container submitted a complaint to Human Resources citing 'unscheduled wire-snipping and lack of Tartar Sauce accommodation.' It has wedged itself inside a sealed acoustic ceiling tile above Room 2B and armed a countdown until its grievance is entered into the minutes.",
        introDispatch:
            "HR memo: The fish container submitted a complaint naming you specifically. Please disarm its modules politely so Legal does not have to depose a Tupperware cylinder."
    },
    {
        stage: 5,
        badge: "🐟 FISH LORE STAGE 5 // CORPORATE ASCENDANCY",
        statusSummary: "The fish container was elected treasurer.",
        location: "Sealed Sub-Orbital Vacuum Chamber (Lab 9)",
        device: "Departmental Treasurer (2019 Fish Container)",
        description:
            "Following Tuesday's budget audit, the fish container was elected treasurer of the Department Oversight Committee by a unanimous write-in vote. Nobody recalls voting for it. It is currently inside a solid-steel vacuum test chamber in Lab 9, where it balanced the Q3 ledger and armed a countdown.",
        introDispatch:
            "Dispatch advisory: The fish container was elected treasurer this morning. If it detonates, nobody gets reimbursed for mileage or blast goggles."
    },
    {
        stage: 6,
        badge: "🐟 FISH LORE STAGE 6 // IMPOSSIBLE GEOMETRY",
        statusSummary: "Simultaneously occupying a solid concrete pillar and Shelf 3.",
        location: "Inside Solid Concrete Pillar #7 (13th Floor of 12-Story Building)",
        device: "Non-Euclidean Fish Container",
        description:
            "Sonar scans of a solid poured-concrete structural pillar on the 13th floor—in a 12-story office building—have detected the exact same 2019 fish container ticking inside the concrete. More concerningly, a live camera in the breakroom shows it is also still sitting on Shelf 3.",
        introDispatch:
            "We have an architectural anomaly. The fish container relocated itself inside solid concrete on a floor that doesn't exist. Disarm the modules protruding from the pillar."
    },
    {
        stage: 7,
        badge: "🐟 FISH LORE STAGE 7 // TENURED ENIGMA",
        statusSummary: "Tenured Board Member & Unexplained Anomaly (Do Not Question)",
        location: "Inside a Sealed 4-Inch Fire Alarm Glass Box (Executive Lobby)",
        device: "The Inevitable Fish Container (Tenured)",
        description:
            "The two-gallon fish container is currently resting comfortably inside a sealed four-inch glass fire-alarm box in the Executive Lobby without bending the glass. It now holds an executive parking space, signatory authority, and an active countdown timer. We no longer ask what is inside.",
        introDispatch:
            "It's the fish container again. The fish container relocated itself, balanced the budget, acquired a mailing address, and submitted a complaint. Just disarm the modules and do not tap on the glass."
    }
];

const ACHIEVEMENTS = [
    {
        id: "paperwork_first",
        title: "Paperwork First",
        description: "Open the Options menu before touching a single device.",
        icon: "📋"
    },
    {
        id: "not_exploding_is_winning",
        title: "Not Exploding Is Winning",
        description: "Successfully complete your first mission.",
        icon: "🏅"
    },
    {
        id: "trust_issues",
        title: "Trust Issues",
        description: "Ignore 50 dispatch messages across your career and win a mission.",
        icon: "🎧"
    },
    {
        id: "the_other_blue_wire",
        title: "The Other Blue Wire",
        description: "Lose a mission after Dispatch changes its advice mid-countdown.",
        icon: "✂️"
    },
    {
        id: "fish_whisperer",
        title: "Fish Whisperer",
        description: "Successfully resolve 3 Corporate Breakroom Fish Incidents.",
        icon: "🐟"
    },
    {
        id: "fish_relocated",
        title: "It Relocated Itself",
        description: "Encounter the Breakroom Fish Container after it relocates itself to an impossible location.",
        icon: "📦"
    },
    {
        id: "fish_complaint",
        title: "Named In A Halibut Grievance",
        description: "Survive a Fish Container incident after it acquires a mailing address or submits a formal complaint.",
        icon: "✉️"
    },
    {
        id: "fish_treasurer",
        title: "All Hail The Tupperware Treasurer",
        description: "Encounter the Breakroom Fish Container after it is elected Departmental Treasurer.",
        icon: "🗳️"
    },
    {
        id: "training_certified",
        title: "Lanyard Earned",
        description: "Complete all 8 Training Campaign orientation missions.",
        icon: "🎓"
    },
    {
        id: "close_call",
        title: "Budget Time Management",
        description: "Defuse a device with less than 5.0 seconds remaining on the clock.",
        icon: "⏱️"
    },
    {
        id: "speed_demon",
        title: "Before Coffee Gets Cold",
        description: "Defuse a procedural device in under 25 seconds.",
        icon: "⚡"
    },
    {
        id: "flawless_streak_5",
        title: "Employee of the Week",
        description: "Achieve a 5-mission win streak without detonating.",
        icon: "🔥"
    },
    {
        id: "flawless_streak_10",
        title: "Tenured Technician",
        description: "Achieve a 10-mission win streak.",
        icon: "🌟"
    },
    {
        id: "no_strikes_hard",
        title: "Surgical Clippers",
        description: "Complete a 4+ module device with zero strikes.",
        icon: "🧤"
    },
    {
        id: "senior_promotion",
        title: "Corner Cubicle Material",
        description: "Reach the rank of Senior Boom Technician or higher.",
        icon: "💼"
    },
    {
        id: "ceo_not_booming",
        title: "Chief Executive of Not Booming",
        description: "Reach the highest corporate rank in the Department of Boom Prevention.",
        icon: "👑"
    },
    {
        id: "manual_scholar",
        title: "Actually Read The Binder",
        description: "Open the Field Manual reference drawer during an active mission.",
        icon: "📖"
    },
    {
        id: "precision_optics",
        title: "Precision Optics",
        description: "Deploy the Bomb Tech Visor inspection optics during an active mission.",
        icon: "🔭"
    }
];
