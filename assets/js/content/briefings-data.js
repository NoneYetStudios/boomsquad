/**
 * BOOM SQUAD - Mission Briefings Content Data
 * Curated incident briefings and procedural narrative grammar.
 */

const CURATED_MISSION_BRIEFINGS = [
    {
        location: "Corporate Breakroom Refrigerator",
        device: "Suspicious Container",
        description:
            "A container located in the employee refrigerator has begun emitting ticking sounds and occasional sparks. Contents are believed to be an old fish dish. The exact age of the fish remains under investigation.",
        isFishIncident: true
    },
    {
        location: "Basslift Championship Arena",
        device: "Unlicensed Acoustic Bass Amplifier",
        description:
            "An illegal sub-woofer array rigged to a kitchen timer is threatening to rattle the trophy trout right off the wall. Disarm before the semi-finals begin.",
        isFishIncident: false
    },
    {
        location: "Decorative Gourd Expo",
        device: "Explosive Decorative Gourd",
        description:
            "Booth 14 entered a prized autumn squash that weighs 90 pounds, has a digital LED countdown, and smells faintly of solder. The Decorative Gourd Safety Council requests immediate intervention.",
        isFishIncident: false
    },
    {
        location: "Turkey Pavilion",
        device: "Seasonal Turkey Enhancement Device",
        description:
            "Someone attempted to deep-fry a turkey using particle physics and an alarm clock. The Turkey Preparedness Agency has evacuated a four-block basting radius.",
        isFishIncident: false
    },
    {
        location: "Locked Executive Biometric Safe",
        device: "Self-Relocating Fish Container",
        description:
            "The breakroom fish container relocated itself overnight into a sealed titanium floor safe without triggering the laser grid. It is ticking steadily.",
        isFishIncident: true
    },
    {
        location: "Suite 404-F (Sealed Elevator Shaft)",
        device: "Registered Fish Container",
        description:
            "The fish container has acquired a mailing address inside the main elevator shaft and is refusing to pause its countdown until its mail is sorted.",
        isFishIncident: true
    },
    {
        location: "Department Oversight Boardroom",
        device: "Treasurer's Fish Container",
        description:
            "The fish container was elected treasurer at 09:00 and immediately submitted a complaint regarding our wire-snipping budget. Disarm with respect.",
        isFishIncident: true
    }
];

const BRIEFING_GRAMMAR = {
    situations: [
        "has begun emitting rhythmic ticking sounds and occasional purple sparks.",
        "was left unattended next to a stack of quarterly compliance binders.",
        "is vibrating across the linoleum at an alarming velocity.",
        "has locked its own maintenance hatch and started a digital countdown.",
        "is broadcasting unauthorized polka telemetry on emergency frequencies.",
        "was flagged by janitor sensors after emitting a loud 'BEEP' during lunch.",
        "appears to have been wired together using paperclips, duct tape, and sheer corporate spite.",
        "is threatening to cover the entire facility in pressurized gravy.",
        "has exceeded safe thermodynamic limits according to a sticky note on its side.",
        "is humming menacingly and refuses to respond to standard IT helpdesk tickets.",
        "was delivered by an unmarked courier wearing flippers and a reflective vest.",
        "has triggered three separate smoke alarms and the building's gravy sprinkler.",
        "is counting down in red LED digits while playing elevator music.",
        "contains an unknown quantity of volatile leftovers from the 2021 holiday party.",
        "was discovered behind the vending machine during routine coin retrieval."
    ],
    notes: [
        "Contents are believed to be an old fish dish. The exact age of the fish remains under investigation.",
        "The Department of Excessive Gravy has placed the building on Condition Biscuit.",
        "Local witnesses report a faint smell of ozone and toasted bagels.",
        "Legal requests that you disarm the unit without scratching the leased mahogany table.",
        "The United Poultry Emergency Office is monitoring the situation via satellite.",
        "Please preserve all wires for recycling compliance.",
        "Do not disturb the nearby motivational posters while working.",
        "HR notes that any detonation during business hours will count as an unexcused absence.",
        "The Municipal Aquarium Oversight Board asks that no loud noises startle the eels.",
        "Previous technician attempted to unplug it and is now trapped in a supply closet.",
        "The Office of Recreational Chickens has issued a temporary no-cluck zone.",
        "Basslift Competition Committee officials are standing by with ear protection."
    ]
};

const DIFFICULTY_11_SPECIAL_BRIEFINGS = [
    {
        location: "Sub-Basement Singularity Vault 11",
        device: "Dial-11 Chained Interlock Megabox",
        description:
            "Someone turned the facility's master calibration dial past 10. Two Emergency Overrides have welded themselves into a chained dependency loop while the Breakroom Fish Container hums in approvals.",
        isFishIncident: true,
        anomalyTitle: "DUAL-INTERLOCK OVERRIDE CHAIN & TELEMETRY SURGE"
    },
    {
        location: "Department of Excessive Gravy Command Bunker",
        device: "Thermonuclear Gravy Centrifuge (Mark XI)",
        description:
            "Operating at Unauthorized Level 11. All module circuits are cross-linked through the primary chassis bus, and Supervisor Gary has locked himself in the stationery cupboard.",
        isFishIncident: false,
        anomalyTitle: "CROSS-CHASSIS HARMONIC LOCKDOWN"
    },
    {
        location: "Municipal Aquarium High-Pressure Dome",
        device: "Sovereign Fish Container Tactical Monolith",
        description:
            "The Corporate Breakroom Fish Container has annexed eight separate countdown modules and demanded an immediate audit at Difficulty 11.",
        isFishIncident: true,
        anomalyTitle: "AQUATIC TREASURER SOVEREIGNTY PROTOCOL"
    },
    {
        location: "Decorative Gourd Safety Council Reactor Core",
        device: "11-Stage Autumnal Resonance Collider",
        description:
            "Engineering swore the dial stopped at 10, yet here we are at 11. Multiple interlocks require cross-module verification while Dispatch reads from a charred napkin.",
        isFishIncident: false,
        anomalyTitle: "UNEXPLAINED DIAL-11 RESONANCE"
    }
];
