import { ColorSchemeName, useColorScheme } from 'react-native';

export { useColorScheme } from 'react-native';


export const COLORS_light = {
  PRIMARY: '#6B46C1',
  SECONDARY: '#3182CE',
  ERROR: '#E53E3E',
  SUCCESS: '#48BB78',
  BACKGROUND: '#FFFFFF',
  TEXT: '#000000',
  TEXT_SECONDARY: '#666666',
  BORDER: '#E2E8F0',
};

export const COLORS_dark = {
  PRIMARY: '#6B46C1',
  SECONDARY: '#3182CE',
  ERROR: '#E53E3E',
  SUCCESS: '#48BB78',
  BACKGROUND: '#000',
  TEXT: '#fff',
  TEXT_SECONDARY: '#AAA',
  BORDER: '#222',
};

export const FONTS = {
  BOLD: 'Gotham-Bold',
  REGULAR: 'Gotham-Book',
}; 

export const COLORS = (colorScheme: ColorSchemeName) => colorScheme === 'dark' ? COLORS_dark : COLORS_light