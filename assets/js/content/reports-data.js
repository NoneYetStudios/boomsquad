/**
 * BOOM SQUAD - After-Action Reports & Status Ticker Content Data
 * Contains curated & procedural Failure Reports (comedic only),
 * Success Reports, and HUD Status Updates.
 */

const FAILURE_REPORTS_DATA = {
    curated: [
        "City Hall has been covered in gravy.",
        "The municipal aquarium is now accepting complaints.",
        "8,000 rubber ducks were released.",
        "The mayor has become temporarily magnetic.",
        "The breakroom microwave has been condemned.",
        "The refrigerator now requires a zoning permit.",
        "Every ceiling tile in Accounting has been replaced with coleslaw.",
        "A harmless shockwave rearranged all library books by color instead of Dewey Decimal.",
        "400 gallons of butterscotch pudding now occupy the executive elevator.",
        "The county fair Ferris wheel is now rolling gently toward the next town.",
        "All parking meters within six blocks now dispense tartar sauce.",
        "The Decorative Gourd Expo has become an unintentional pumpkin smoothie festival.",
        "Regional Wi-Fi has been replaced by continuous accordion polka.",
        "The employee of the month plaque was launched into low orbit.",
        "Three hundred inflatable flamingos have claimed the third floor.",
        "The breakroom coffee pot now brews exclusively decaf clam broth.",
        "Every stapler in the building has been fused into a single modern art sculpture.",
        "The Basslift Championship trophy is now lodged in a decorative shrub.",
        "A cloud of biodegradable glitter has reduced visibility in Finance to zero.",
        "The building's intercom is permanently stuck repeating 'Cleanup on Aisle Turnip.'",
        "The blast cleared three offices, yet the 2019 fish container sits completely unharmed on the desk.",
        "The fish container submitted a complaint regarding the decibel level of its own detonation.",
        "Pressurized tartar sauce now coats the ceiling; the fish container itself relocated to the Mayor's car.",
        "As newly elected treasurer, the fish container has docked the department's coffee budget for exploding."
    ],
    fishSpecific: [
        "The blast cleared three offices, yet the 2019 fish container sits completely unharmed on the desk.",
        "The fish container submitted a complaint regarding the decibel level of its own detonation.",
        "Pressurized tartar sauce now coats the ceiling; the fish container itself relocated to the Mayor's car.",
        "As newly elected treasurer, the fish container has docked the department's coffee budget for exploding.",
        "The fish container has acquired a mailing address in the crater and is already receiving junk mail.",
        "The Tupperware lid remained sealed through the explosion. Whatever is inside just knocked twice."
    ],
    places: [
        "The corporate breakroom",
        "Annex Building C",
        "The municipal fountain",
        "The regional accounting wing",
        "The executive parking garage",
        "The turkey pavilion roof",
        "The main reception lobby",
        "The town square gazebo",
        "The third-floor copy room",
        "The community center gymnasium",
        "The local bass pro shop",
        "The county archive vault",
        "The cafeteria salad bar",
        "The HR orientation room",
        "The sub-basement boiler room",
        "The vending machine alcove"
    ],
    effects: [
        "is now knee-deep in lukewarm mashed potatoes.",
        "has been completely wallpapered in urgent compliance memos.",
        "is currently filled with 12,000 self-inflating pool noodles.",
        "now smells permanently of artisanal dill pickles.",
        "has been rezoned as a federal wildlife sanctuary for startled pigeons.",
        "is covered in a fine layer of non-toxic neon confetti.",
        "has had all its furniture rotated exactly 45 degrees.",
        "is echoing with the sound of 500 novelty horns.",
        "now requires galoshes and a canoe to navigate.",
        "has been coated in high-viscosity cranberry sauce.",
        "is experiencing localized indoor drizzle of ranch dressing.",
        "has been declared a historic monument to questionable wiring.",
        "is now magnetized enough to pull belt buckles toward the ceiling.",
        "has been filled to capacity with unsalted packing peanuts."
    ]
};

const SUCCESS_REPORTS_DATA = {
    curated: [
        "Damage avoided.",
        "Pudding secured.",
        "Turkey situation stabilized.",
        "Gravy threat neutralized.",
        "Corporate lunch preserved.",
        "Aquarium remains operational.",
        "Breakroom refrigerator returned to DEFCON 4.",
        "Zero rubber ducks were deployed today.",
        "The mayor remains non-magnetic.",
        "Decorative gourds remain intact and tasteful.",
        "Fish container sealed in triple-lined containment Tupperware.",
        "Basslift tournament may proceed as scheduled.",
        "Insurance premiums remain only slightly astronomical.",
        "Paperwork reduced by at least four binders.",
        "Office microwave lives to reheat another day.",
        "Poultry levels remain nominal across all sectors.",
        "No ceiling tiles were harmed during this incident.",
        "Compliance department has issued a rare nod of approval.",
        "Countdown clock successfully converted into a desk paperweight.",
        "Public park geese remain unbothered.",
        "The fish container relocated itself back to Shelf 3 the moment you turned around.",
        "The fish container has temporarily agreed not to detonate, though it kept its mailing address.",
        "Countdown neutralized. The fish container was elected treasurer anyway and adjourned the meeting.",
        "Incident contained. The fish container withdrew its HR complaint without further explanation."
    ],
    fishSpecific: [
        "Fish container sealed in triple-lined containment Tupperware. A moment later, the containment box was empty.",
        "The fish container relocated itself back to Shelf 3 the moment you turned around.",
        "The fish container has temporarily agreed not to detonate, though it kept its mailing address.",
        "Countdown neutralized. The fish container was elected treasurer anyway and adjourned the meeting.",
        "Incident contained. The fish container withdrew its HR complaint without further explanation.",
        "The Tupperware lid remains sealed. Seismic sensors recorded two polite taps from the inside."
    ],
    subjects: [
        "The suspicious device",
        "The volatile lunchbox",
        "The ticking appliance",
        "The pressurized vessel",
        "The rogue kitchen timer",
        "The acoustic resonator",
        "The experimental casserole",
        "The departmental thermos",
        "The high-energy basket",
        "The ornamental squash",
        "The breakroom apparatus",
        "The mystery container",
        "The sub-basement unit",
        "The fairground contraption",
        "The aquatic filtration pump",
        "The turkey warmer"
    ],
    resolutions: [
        "has been safely powered down and labeled 'Do Not Plug In.'",
        "was neutralized with 0.0% collateral gravy splatter.",
        "is now humming a harmless lullaby in storage locker 9.",
        "was disarmed before Legal had to draft an apology press release.",
        "has been confiscated by the Department of Boom Prevention archive.",
        "was rendered completely inert and mildly refreshing.",
        "is no longer ticking, glowing, or threatening the drywall.",
        "has been downgraded from 'Imminent Catastrophe' to 'Tax Deductible.'",
        "was defused with textbook corporate precision.",
        "has been safely recycled into three calculators and a toaster.",
        "was stabilized to the satisfaction of the Decorative Gourd Safety Council.",
        "has ceased all unauthorized countdown activity.",
        "was disarmed just in time for afternoon coffee break.",
        "is now safe enough to store next to the good napkins."
    ]
};

const STATUS_UPDATES_DATA = {
    curated: [
        "SYS-STATUS: Manual Binder Spine Integrity at 41%",
        "FACILITIES: Breakroom Fridge Seal Holding",
        "LEGAL: Liability Waiver Server Online",
        "TELEMETRY: Ambient Gravy Pressure Normal",
        "ALERT: Unidentified Tupperware in Sector 7",
        "AUDIO: Radio Static Filter Calibrated",
        "HR MEMO: Please label all non-explosive lunches",
        "OVERSIGHT: Municipal Aquarium Eels Calm",
        "WEATHER: 0% Chance of Airborne Pudding",
        "SECURITY: Safety Squints Engaged",
        "FISH-LORE: The fish container relocated itself",
        "MAILROOM: The fish container has acquired a mailing address",
        "FINANCE: The fish container was elected treasurer",
        "HR GRIEVANCE: The fish container submitted a complaint",
        "SENSOR PING: 2019 Tupperware detected in two rooms simultaneously",
        "PARKING: Executive Spot #1 reserved for Shelf 3 Fish Container"
    ],
    fishSpecific: [
        "FISH-LORE: The fish container relocated itself",
        "MAILROOM: The fish container has acquired a mailing address",
        "FINANCE: The fish container was elected treasurer",
        "HR GRIEVANCE: The fish container submitted a complaint",
        "SENSOR PING: 2019 Tupperware detected in two rooms simultaneously",
        "PARKING: Executive Spot #1 reserved for Shelf 3 Fish Container",
        "CONTAINMENT: Tartar Sauce Pressure at 400 PSI",
        "SONAR: Low-Frequency Halibut Pings Detected"
    ],
    prefixes: [
        "SECTOR CHECK",
        "GRID MONITOR",
        "BUREAU FEED",
        "SENSOR LOG",
        "INTERNAL MEMO",
        "COMPLIANCE PING",
        "LAB TELEMETRY",
        "FIELD TICKER",
        "CONTAINMENT LOG",
        "DISPATCH METRIC"
    ],
    metrics: [
        "Capacitor Hum",
        "Poultry Proximity",
        "Gourd Resonance",
        "Halibut Stability",
        "Coffee Pot PSI",
        "Clipboard Readiness",
        "Wire Insulation Index",
        "Bass Frequency Drift",
        "Casserole Core Temp",
        "Static Interference",
        "Intern Morale",
        "Tupperware Seal Integrity",
        "Siren Battery Charge",
        "Manual Page Legibility",
        "Gravy Viscosity",
        "Rubber Duck Containment",
        "Thermos Vacuum Pressure",
        "Toggle Switch Grease",
        "Keypad Backlight Voltage",
        "Basting Radius"
    ],
    states: [
        "NOMINAL",
        "SLIGHTLY SPICY",
        "WITHIN TOLERANCE",
        "UNDER REVIEW",
        "QUESTIONABLE",
        "STABLE-ISH",
        "94% OPTIMAL",
        "HOLDING STEADY",
        "MILDLY VIBRATING",
        "APPROVED BY GARY"
    ]
};

const DISPATCH_ASSESSMENTS_DATA = {
    timer: [
        "Dispatch notes that the countdown clock is a deadline, not a suggestion.",
        "Technician exhibited admirable patience while the timer reached zero.",
        "Time management seminar attendance has been scheduled for your next shift.",
        "The device waited as long as it politely could before detonating.",
        "Actuarial review confirms we ran out of seconds before we ran out of modules."
    ],
    wrong_action: [
        "Dispatch confirms that was decisively the wrong button, wire, or switch.",
        "Bold decisive action! Unfortunately, it was also mathematically incorrect.",
        "Telemetry indicates the module requested the opposite of what was just performed.",
        "Engineering admires your confidence, if not your adherence to the bottom rule strip.",
        "That input bypassed the safety interlock and went straight to the gravy reservoir."
    ],
    strike_accumulation: [
        "Three consecutive warnings were issued; the device eventually took them personally.",
        "Cumulative strike threshold exceeded after multiple experimental inputs.",
        "Each strike accelerated the internal clock by 15% until structural patience ran out.",
        "Safety Monitor logged multiple consecutive protocol deviations prior to boom.",
        "Department policy allows mistakes, just not that many on the same appliance."
    ],
    override: [
        "Emergency Override engaged with an invalid Chassis Auth Sum. The big red button is unforgiving.",
        "Flipping the hazard cover without verifying (Serial Last Digit + Batteries + Modules) voided the warranty.",
        "The Emergency Override module overrode our containment protocols instead of the timer.",
        "Dispatch reminds technicians that the big red button requires exact arithmetic first.",
        "Unauthorized Auth Code submitted to the master override chamber."
    ]
};
