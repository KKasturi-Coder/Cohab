/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Black & Gold Elegance theme with dark blue accents.
 */

import { Platform } from 'react-native';

// Majestic Black & Gold Elegance Palette
const goldPrimary = '#FFC125';      // Rich golden yellow - more majestic
const goldSecondary = '#D4AF37';    // Metallic gold - elegant
const goldAccent = '#CD853F';       // Perennial gold - sophisticated
const goldBright = '#FFD700';       // Bright gold for highlights
const darkBlue = '#0F172A';         // Deep slate blue - regal
const darkBlueLight = '#1E293B';    // Slate blue - elegant
const darkBlueBright = '#1E3A8A';   // Royal blue - majestic
const darkBlueDark = '#020617';    // Almost black blue - profound
const blackPrimary = '#000000';     // Pure black
const blackSecondary = '#0A0A0A';  // Deep black - more depth
const blackTertiary = '#1A1A1A';   // Charcoal black
const blackText = '#E5E5E5';       // Off-white text for contrast
const white = '#FFFFFF';            // Pure white
const grayLight = '#2A2A2A';       // Dark gray for subtle elements
const grayMedium = '#8B8B8B';      // Medium gray - more visible on black

const tintColorLight = goldPrimary;
const tintColorDark = goldPrimary;

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: blackPrimary,
    tint: goldPrimary,
    icon: grayMedium,
    tabIconDefault: grayMedium,
    tabIconSelected: goldPrimary,
    // Extended majestic palette
    gold: goldPrimary,
    goldSecondary: goldSecondary,
    goldAccent: goldAccent,
    goldBright: goldBright,
    darkBlue: darkBlue,
    darkBlueLight: darkBlueLight,
    darkBlueBright: darkBlueBright,
    darkBlueDark: darkBlueDark,
    black: blackPrimary,
    blackSecondary: blackSecondary,
    blackTertiary: blackTertiary,
    blackText: blackText,
    white: white,
    grayLight: grayLight,
    grayMedium: grayMedium,
  },
  dark: {
    text: '#FFFFFF',
    background: blackPrimary,
    tint: goldPrimary,
    icon: grayMedium,
    tabIconDefault: grayMedium,
    tabIconSelected: goldPrimary,
    // Extended majestic palette
    gold: goldPrimary,
    goldSecondary: goldSecondary,
    goldAccent: goldAccent,
    goldBright: goldBright,
    darkBlue: darkBlue,
    darkBlueLight: darkBlueLight,
    darkBlueBright: darkBlueBright,
    darkBlueDark: darkBlueDark,
    black: blackPrimary,
    blackSecondary: blackSecondary,
    blackTertiary: blackTertiary,
    blackText: blackText,
    white: white,
    grayLight: grayLight,
    grayMedium: grayMedium,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
