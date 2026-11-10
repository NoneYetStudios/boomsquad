/**
 * BOOM SQUAD - Radio Dispatch Content Data
 * Contains curated radio chatter, Corporate Breakroom Fish Incident lines,
 * conflicting advice gags, and combinatorial template pools.
 */

const DISPATCH_CORE_LINES = [
    "Boom Squad, we have reports of an unauthorized countdown appliance.",
    "We are currently reviewing the manual.",
    "We have misplaced the manual.",
    "The manual has been located.",
    "The manual appears to be written in crayon.",
    "Legal has advised us not to call it a bomb.",
    "Correction. Legal has advised us not to call anything anything.",
    "We are 38 percent confident.",
    "Update. Confidence reduced to 12 percent.",
    "Please remain calm. Panic requires Form 27-B in triplicate.",
    "Our senior analyst suggests cutting a wire, or possibly taking a brisk walk.",
    "Good news: your dental plan covers mild singeing.",
    "Correction: dental plan only covers Tuesday singeing.",
    "We asked the intern to verify the schematic. The intern has fled the building.",
    "If the device starts humming a polka, step back immediately.",
    "Management wants to know if you can defuse this before payroll closes.",
    "The manual coffee stain covers the chapter on red wires. Best of luck.",
    "We are routing your audio to the executive speakerphone for entertainment.",
    "Reminder: Friday is Hawaiian shirt and blast-goggles day.",
    "Our predictive algorithm says you have a 64 percent chance of remaining in one piece.",
    "Correction: the algorithm was upside down. It's 46 percent.",
    "Facilities asks that if it explodes, please aim it away from the new carpet.",
    "Hold on, my headset is picking up a local country station.",
    "Have you tried turning the suspicious device off and on again? Actually, don't.",
    "Accounting says each strike costs the department fourteen dollars in paperwork.",
    "We just received an updated manual via carrier pigeon. Stand by.",
    "The pigeon refused to enter the building. Using backup notes.",
    "Please do not lick any glowing components, regardless of flavor.",
    "Safety bulletin: blinking red lights are rarely decorative.",
    "I'm reading the schematic now. Wait, this is a Waffle House menu.",
    "Okay, found the real schematic behind the radiator.",
    "Whatever you do, don't press the button that isn't there.",
    "Status check: are your eyebrows still attached? Blink twice for yes.",
    "We have consulted the Magic 8-Ball in HR. It says 'Ask Again Later.'",
    "Telemetry indicates the device is either ticking or very angry.",
    "Budget cuts mean we could only afford three-quarters of the defusal guide.",
    "If you hear a duck quack inside the casing, do not engage the duck.",
    "Compliance reminds you to wear safety squints at all times.",
    "Wait—my notes say 'Cut the blue wire.' Or 'Buy more glue.' Handwriting is rough.",
    "Great posture out there, technician. Very professional slouch.",
    "Dispatch reminder: NAND is the opposite of AND.",
    "The Department continues to regret naming some of these operators.",
    "We asked engineering for simpler terminology. Engineering responded with XOR.",
    "Quick binary memo: 1 means TRUE, 0 means FALSE, and blinking red means hurry.",
    "XOR is only TRUE when exactly one input is TRUE. If both are TRUE, XOR gets philosophical and outputs FALSE."
];

const DISPATCH_LOGIC_LINES = [
    "Dispatch reminder: NAND is the opposite of AND.",
    "The Department continues to regret naming some of these operators.",
    "We asked engineering for simpler terminology. Engineering responded with XOR.",
    "Quick binary memo: 1 means TRUE and 0 means FALSE.",
    "Remember: XOR is TRUE only if one input is TRUE, not both. Engineering calls it 'Exclusive OR.' We call it annoying.",
    "Operator tip: NOT simply reverses the input. 1 becomes 0, and 0 becomes 1."
];

const DISPATCH_FISH_LINES = [
    "The fish container relocated itself.",
    "The fish container has acquired a mailing address.",
    "The fish container was elected treasurer.",
    "The fish container submitted a complaint.",
    "The fish may no longer be the most dangerous thing in the container.",
    "HR estimates the fish exceeded its intended life expectancy nine fiscal quarters ago.",
    "The refrigerator has been evacuated.",
    "The fish has filed an appeal.",
    "Bio-sensors indicate the halibut has achieved rudimentary consciousness.",
    "Do not open the Tupperware lid unless you have diplomatic immunity.",
    "The microwave next to the fish container has surrendered.",
    "Someone labeled the container 'KEVIN - DO NOT EAT' in 2019. Kevin is ticking.",
    "Air quality in the breakroom has been downgraded to 'Nautical Hazard.'",
    "The Municipal Aquarium Oversight Board denies all involvement with this salmon.",
    "Wait—the tartar sauce packet inside is pressurized to 400 PSI.",
    "The fish dish is now emitting low-frequency sonar pings.",
    "We tried contacting Kevin from Accounting. Kevin left the company four years ago.",
    "The lemon wedge appears to be acting as a voltage regulator.",
    "Environmental Health says if that lid pops, we lose three zip codes.",
    "Security footage confirms the fish container relocated itself through three locked fire doors without opening them.",
    "Mailroom update: The fish container has acquired a mailing address and now receives three trade journals and a rotary club newsletter.",
    "Minutes from Tuesday's board meeting confirm the fish container was elected treasurer by a margin of fourteen votes.",
    "Human Resources confirms the fish container submitted a complaint regarding unauthorized wire-cutting near its lid.",
    "We locked the fish container in the sub-basement vault yesterday. It was waiting on the Director's desk this morning.",
    "Payroll says we cannot legally unplug the fish container because it now has direct deposit and dental coverage.",
    "The fish container's return address is listed as 'Shelf 3, Non-Euclidean Annex.'",
    "We asked Legal why the fish container was elected treasurer. Legal said its spreadsheets were immaculate.",
    "Please do not question how the fish container fit inside a sealed wall cavity. Just disarm the modules."
];

const DISPATCH_CONFLICTING_PAIRS = [
    {
        first: "Manual Override Advisory: Definitely cut the FIRST wire immediately. Ignore all labels.",
        correction:
            "Wait! Scratch that! Do NOT cut the first wire, I was looking at a toaster diagram! Follow the module panel rule instead!"
    },
    {
        first: "Urgent from Engineering: Flip every switch UP right now to drain the capacitor!",
        correction:
            "Correction from Engineering! Do NOT flip all switches up! That was for the 1998 espresso maker! Follow standard sequencer rules!"
    },
    {
        first: "Dispatch Override: Enter 0-0-0-0 on the keypad to trigger maintenance mode!",
        correction:
            "ABORT 0-0-0-0! Maintenance mode actually orders 400 gallons of clam chowder and adds a strike! Use the keypad cipher!"
    },
    {
        first: "Tactical Tip: Press the red Emergency Override button before solving anything else!",
        correction:
            "WAIT NO! Don't touch Emergency Override until the arming steps are complete! Gary had the chart sideways!"
    },
    {
        first: "Signal Advisory: Tune the frequency dial to minimum MHz regardless of the scope!",
        correction:
            "Disregard last transmission! Minimum MHz summons security geese! Match the green waveform on your scope!"
    }
];

const DISPATCH_RETRY_LINES = [
    "Dispatch to Boom Squad. Let's pretend the previous explosion was a training exercise.",
    "Incident restored from backup paperwork.",
    "We have rewound the consequences.",
    "Time-loop protocol engaged. Legal has shredded the previous incident report.",
    "Welcome back. Facilities has swept up the previous timeline.",
    "Re-initializing countdown appliance from carbon-copy backup.",
    "Departmental mulligan approved. Try the other wire this time.",
    "Actuarial tables reset. Technically, nothing just exploded.",
    "HR has agreed to classify the prior detonation as a 'loud rehearsal.'",
    "Backup device deployed with identical wiring. Second time is the corporate charm."
];

const DISPATCH_TRAINING_DEBRIEF_LINES = [
    "The Department considers this a learning opportunity.",
    "The matrix did not matrix correctly.",
    "The Department considers this a learning opportunity. Review the Training Debrief card below before retrying.",
    "Training simulation paused for educational reflection. Check the expected solution on your debrief screen.",
    "Even Senior Supervisors cut the wrong wire on their first day. Consult the Training Debrief below.",
    "Good effort, technician. The Training Debrief shows the exact rule and expected answer."
];

const DISPATCH_VISOR_LINES = {
    firstActivation: "Dispatch to Boom Squad. Inspection optics are now online.",
    additional: [
        "Please avoid using the optics to inspect sandwiches.",
        "The optics are rated for bomb components, not fish containers.",
        "Optics calibrated. Results may vary around decorative gourds.",
        "Bomb Tech Visor magnification locked. Please return the visor before clocking out.",
        "Telemetry confirms your Inspection Optics are functioning within acceptable squinting parameters.",
        "Equipment memo: Do not stare directly into the sun or the breakroom microwave with the visor engaged."
    ]
};

const DISPATCH_GRAMMAR = {
    senders: [
        "Dispatch Desk 4",
        "Senior Supervisor Brenda",
        "Compliance Bot 9000",
        "Legal Counsel",
        "Facilities Maintenance",
        "Sub-Basement Telemetry",
        "Lunchroom Overwatch",
        "HR Crisis Desk",
        "Director of Boom Mitigation",
        "Actuarial Table 12",
        "Night Shift Gary",
        "Archive Intern"
    ],
    verbs: [
        "reports that",
        "insists that",
        "would like to remind you that",
        "has calculated that",
        "just noticed that",
        "is mildly concerned that",
        "has issued a memo stating",
        "urgently whispers that",
        "cannot legally confirm whether",
        "wonders why"
    ],
    subjects: [
        "the auxiliary timer capacitor",
        "your current defusal trajectory",
        "the decorative gourd sensor",
        "the breakroom air filtration unit",
        "section 8 of the wiring binder",
        "the suspiciously warm thermos",
        "the secondary gravy valve",
        "the regional basslift transformer",
        "the backup piezoelectric buzzer",
        "the warranty sticker on that casing",
        "the third toggle switch from the left",
        "the office ficus plant"
    ],
    outcomes: [
        "is operating outside of approved corporate vibes.",
        "has been recalled by the Decorative Gourd Safety Council.",
        "was originally calibrated in metric poultry units.",
        "may void our security deposit if jostled.",
        "is currently being audited by three interns and a ferret.",
        "requires a signed permission slip from the Turkey Preparedness Agency.",
        "is humming in B-flat, which is never a good sign.",
        "was assembled on a Friday afternoon before a three-day weekend.",
        "has a 19 percent chance of dispensing lukewarm clam chowder.",
        "is technically classified as office furniture for tax purposes."
    ]
};

const DISPATCH_DIFFICULTY_DIAL_LINES = {
    byLevel: {
        1: [
            "Difficulty Dial set to 1. Training wheels and laminated manuals have been issued.",
            "Dial 1 selected. HR considers this a stress-free administrative exercise."
        ],
        2: [
            "Difficulty Dial set to 2. Standard breakroom patrol parameters engaged.",
            "Dial 2 active. Please remember not to microwave foil while disarming."
        ],
        3: [
            "Difficulty Dial set to 3. Standard Department of Boom Prevention regulation protocol.",
            "Dial 3 locked in. The manual is only slightly coffee-stained at this tier."
        ],
        4: [
            "Difficulty Dial set to 4. Sub-Basement telemetry cross-checks are now active.",
            "Dial 4 selected. Expect Emergency Override hardware and multi-module arithmetic."
        ],
        5: [
            "Difficulty Dial set to 5. Inter-agency oversight is now monitoring your wire cuts.",
            "Dial 5 engaged. The Decorative Gourd Safety Council has joined the radio channel."
        ],
        6: [
            "Difficulty Dial set to 6. Overtime Protocol active. Manual pages are now written in crayon.",
            "Dial 6 selected. Visual scope assistance has been downgraded for budget reasons."
        ],
        7: [
            "Difficulty Dial set to 7. Strike tolerance reduced. Supervisor Gary is sweating.",
            "Dial 7 active. Municipal Crisis alarms are sounding in the hallway."
        ],
        8: [
            "Difficulty Dial set to 8. Regional containment interlocks engaged across all modules.",
            "Dial 8 locked in. Dispatch confidence has dropped below 30 percent."
        ],
        9: [
            "Difficulty Dial set to 9. Executive Boardroom Panic mode. Blind harmonic locks enabled.",
            "Dial 9 active. Legal has redacted half of our reference binder."
        ],
        10: [
            "Difficulty Dial set to 10. Maximum Authorized Hazard! All 8 module bays are hot.",
            "Dial 10 engaged. This is the highest setting approved by municipal building codes."
        ],
        11: [
            "Supervisor Gary has logged a formal objection to Difficulty 11.",
            "Department policy recommends against touching the 11 setting.",
            "The difficulty dial appears to go past 10. Engineering refuses to explain why.",
            "Difficulty 11 engaged. The Corporate Breakroom Fish Container is now co-signing your paperwork.",
            "Warning: Dial 11 bypasses standard physics and several municipal zoning laws."
        ]
    },
    elevenSpecial: [
        "Supervisor Gary has logged a formal objection to Difficulty 11.",
        "Department policy recommends against touching the 11 setting.",
        "The difficulty dial appears to go past 10. Engineering refuses to explain why.",
        "Dispatch to Boom Squad: Dial 11 is not covered by our group dental plan.",
        "Telemetry alert: At Difficulty 11, Emergency Overrides chain their auth codes together out of spite."
    ],
    autoIncrement: [
        "Incident contained! Department protocol has automatically advanced the Difficulty Dial by +1.",
        "Promotion momentum logged: Difficulty Dial ratcheted up one notch for the next incident.",
        "Next incident queued. Engineering has turned the Difficulty Dial up by one click."
    ]
};
