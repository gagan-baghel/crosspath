/**
 * DiceBear avatar URLs generated from a seed. Six deterministic variants
 * per username so the user can pick one during onboarding.
 */
const STYLES = ["thumbs", "shapes", "rings", "icons", "bottts-neutral", "fun-emoji"] as const;

export function avatarVariants(seed: string): string[] {
  return STYLES.map(
    (style) =>
      `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&radius=50`
  );
}

export function defaultAvatar(seed: string): string {
  return avatarVariants(seed)[0];
}
