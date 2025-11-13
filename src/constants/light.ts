import {
  ITheme,
  ThemeColors,
  ThemeGradients,
  ThemeSizes,
  ThemeSpacing,
} from './types';

import {THEME as commonTheme} from './theme';

export const COLORS: ThemeColors = {
  // default text color
  text: '#252F40',

  // base colors
  /** UI color for #primary */
  primary: '#0B3D4D',
  /** UI color for #secondary */
  secondary: '#60CB58',
  /** UI color for #tertiary */
  tertiary: '#2E6F59',

  // non-colors
  black: '#252F40',
  white: '#FFFFFF',

  dark: '#252F40',
  light: '#E9ECEF',

  // gray variations
  /** UI color for #gray */
  gray: '#A7A8AE',

  // colors variations
  /** UI color for #danger */
  danger: '#EA0606',
  /** UI color for #warning */
  warning: '#FFC107',
  /** UI color for #success */
  success: '#82D616',
  /** UI color for #info */
  info: '#17C1E8',

  /** UI colors for navigation & card */
  card: '#FFFFFF',
  background: '#E9ECEF',

  /** UI color for shadowColor */
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.3)',

  /** UI color for input borderColor on focus */
  focus: '#107090',
  input: '#0B3D4D',

  /** UI color for switch checked/active color */
  switchOn: '#0B3D4D',
  switchOff: '#E9ECEF',

  /** UI color for checkbox icon checked/active color */
  checkbox: ['#0B3D4D', '#14506A'],
  checkboxIcon: '#FFFFFF',

  /** social colors */
  facebook: '#3B5998',
  twitter: '#55ACEE',
  dribbble: '#EA4C89',

  /** icon tint color */
  icon: '#8392AB',

  /** blur tint color */
  blurTint: 'light',

  /** product link color */
  link: '#0B3D4D',
};

export const GRADIENTS: ThemeGradients = {
  primary: ['#0B3D4D', '#60CB58'] as const,
  secondary: ['#60CB58', '#0B3D4D'] as const,
  info: ['#21D4FD', '#2152FF'] as const,
  success: ['#98EC2D', '#17AD37'] as const,
  warning: ['#FBCF33', '#F53939'] as const,
  danger: ['#FF667C', '#EA0606'] as const,

  light: ['#F0F4F6', '#D6E2E7'] as const,
  dark: ['#062633', '#041921'] as const,

  white: [String(COLORS.white), '#EEF3F5'] as const,
  black: [String(COLORS.black), '#041921'] as const,

  divider: ['rgba(255,255,255,0.25)', 'rgba(20, 80, 106, 0.45)'] as const,
  menu: [
    'rgba(255, 255, 255, 0.2)',
    'rgba(16, 112, 144, 0.45)',
    'rgba(255, 255, 255, 0.2)',
  ] as const,
};

export const SIZES: ThemeSizes = {
  // global sizes
  base: 8,
  text: 14,
  radius: 4,
  padding: 20,

  // font sizes
  h1: 44,
  h2: 40,
  h3: 32,
  h4: 24,
  h5: 18,
  p: 16,

  // button sizes
  buttonBorder: 1,
  buttonRadius: 8,
  socialSize: 64,
  socialRadius: 16,
  socialIconSize: 26,

  // button shadow
  shadowOffsetWidth: 0,
  shadowOffsetHeight: 7,
  shadowOpacity: 0.07,
  shadowRadius: 4,
  elevation: 2,

  // input sizes
  inputHeight: 46,
  inputBorder: 1,
  inputRadius: 8,
  inputPadding: 12,

  // card sizes
  cardRadius: 16,
  cardPadding: 10,

  // image sizes
  imageRadius: 14,
  avatarSize: 32,
  avatarRadius: 8,

  // switch sizes
  switchWidth: 50,
  switchHeight: 24,
  switchThumb: 20,

  // checkbox sizes
  checkboxWidth: 18,
  checkboxHeight: 18,
  checkboxRadius: 5,
  checkboxIconWidth: 10,
  checkboxIconHeight: 8,

  // product link size
  linkSize: 12,

  /** font size multiplier: for maxFontSizeMultiplier prop */
  multiplier: 2,
};

export const SPACING: ThemeSpacing = {
  /** xs: 4px */
  xs: SIZES.base * 0.5,
  /** s: 8px */
  s: SIZES.base * 1,
  /** sm: 16px */
  sm: SIZES.base * 2,
  /** m: 24px */
  m: SIZES.base * 3,
  /** md: 32px */
  md: SIZES.base * 4,
  /** l: 40px */
  l: SIZES.base * 5,
  /** xl: 48px */
  xl: SIZES.base * 6,
  /** xxl: 56px */
  xxl: SIZES.base * 7,
};

export const THEME: ITheme = {
  ...commonTheme,
  colors: COLORS,
  gradients: GRADIENTS,
  sizes: {...SIZES, ...commonTheme.sizes, ...SPACING},
};
