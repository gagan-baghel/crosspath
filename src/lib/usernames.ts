const ADJECTIVES = [
  "Quiet", "Gentle", "Brave", "Calm", "Bright", "Kind", "Warm", "Soft",
  "Steady", "Silent", "Hopeful", "Patient", "Wandering", "Curious", "Mellow",
  "Serene", "Humble", "Honest", "Peaceful", "Thoughtful", "Dreamy", "Misty",
  "Golden", "Silver", "Amber", "Velvet", "Wistful", "Tender", "Free", "Wild",
];

const NOUNS = [
  "River", "Willow", "Cloud", "Meadow", "Ember", "Harbor", "Aspen", "Brook",
  "Cedar", "Dawn", "Fern", "Grove", "Haven", "Iris", "Juniper", "Lake",
  "Maple", "North", "Ocean", "Pine", "Quill", "Rain", "Sky", "Trail",
  "Valley", "Wave", "Wren", "Moon", "Star", "Horizon",
];

/** Generates an anonymous username like "QuietRiver482". */
export function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}${noun}${num}`;
}
