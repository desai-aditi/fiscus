import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] = width < height ? [width, height] : [height, width];

//Default guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 400;
const guidelineBaseHeight = 776;

export const scale = (size: number): number => shortDimension / guidelineBaseWidth * size;
export const verticalScale = (size: number): number => longDimension / guidelineBaseHeight * size;
export const moderateScale = (size: number, factor = 0.5): number => size + (scale(size) - size) * factor;
export const moderateVerticalScale = (size: number, factor = 0.5): number => size + (verticalScale(size) - size) * factor;

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;

// Generate a random color with good contrast and brightness
export const generateRandomColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30) + 60; // 60-90%
  const lightness = Math.floor(Math.random() * 20) + 45; // 45-65%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};