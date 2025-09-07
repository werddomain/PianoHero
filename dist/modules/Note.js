export var HitQuality;
(function (HitQuality) {
    HitQuality["PERFECT"] = "perfect";
    HitQuality["GOOD"] = "good";
    HitQuality["POOR"] = "poor";
    HitQuality["MISS"] = "miss";
})(HitQuality || (HitQuality = {}));
export const TIMING_WINDOWS = {
    PERFECT: 16.7, // ms
    GOOD: 40, // ms
    POOR: 80 // ms
};
export const SCORE_VALUES = {
    PERFECT: 100,
    GOOD: 50,
    POOR: 25,
    SUSTAINED_NOTE_TICK: 5 // Points per tick for held notes
};
export const COMBO_MULTIPLIERS = [
    { threshold: 0, multiplier: 1 }, // 0-3 notes
    { threshold: 4, multiplier: 2 }, // 4-7 notes
    { threshold: 8, multiplier: 4 }, // 8-11 notes
    { threshold: 12, multiplier: 6 }, // 12-15 notes
    { threshold: 16, multiplier: 8 } // 16+ notes
];
//# sourceMappingURL=Note.js.map