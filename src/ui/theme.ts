import tokens from './tokens.json';

export const color = tokens.color;
export const radius = tokens.radius;
export const space = tokens.space;
export const courtCellSpacing = tokens.courtCellSpacing;
export const pressScale = tokens.pressScale;

/**
 * Like Clipeo: Space Grotesk (Medium) for titles and big numbers; body text
 * keeps the platform system font, so it has no fontFamily.
 */
export const font = {
  heading: 'SpaceGrotesk_500Medium',
  headingBold: 'SpaceGrotesk_700Bold',
} as const;
