import { createContext, useContext } from 'react';

export type ColorScheme = 'emerald' | 'teal';

export interface ThemeColors {
  // Primary solid backgrounds
  bg600: string;       // e.g. bg-teal-600
  bg700: string;       // e.g. bg-teal-700
  bg900: string;       // e.g. bg-teal-900
  bg50: string;        // e.g. bg-teal-50
  bg100: string;       // e.g. bg-teal-100
  // Hover backgrounds
  hoverBg600: string;  // e.g. hover:bg-teal-600
  hoverBg700: string;  // e.g. hover:bg-teal-700
  hoverBg50: string;   // e.g. hover:bg-teal-50
  // Text
  text600: string;     // e.g. text-teal-600
  text700: string;     // e.g. text-teal-700
  text500: string;     // e.g. text-teal-500
  text400: string;     // e.g. text-teal-400
  // Borders
  border200: string;   // e.g. border-teal-200
  border600: string;   // e.g. border-teal-600
  hoverBorder600: string; // e.g. hover:border-teal-600
  // Focus ring
  focusRing: string;   // e.g. focus:ring-teal-500
  // Shadow
  shadow200: string;   // e.g. shadow-teal-200
}

const themes: Record<ColorScheme, ThemeColors> = {
  emerald: {
    bg600: 'bg-emerald-600',
    bg700: 'bg-emerald-700',
    bg900: 'bg-emerald-900',
    bg50: 'bg-emerald-50',
    bg100: 'bg-emerald-100',
    hoverBg600: 'hover:bg-emerald-600',
    hoverBg700: 'hover:bg-emerald-700',
    hoverBg50: 'hover:bg-emerald-50',
    text600: 'text-emerald-600',
    text700: 'text-emerald-700',
    text500: 'text-emerald-500',
    text400: 'text-emerald-400',
    border200: 'border-emerald-200',
    border600: 'border-emerald-600',
    hoverBorder600: 'hover:border-emerald-600',
    focusRing: 'focus:ring-emerald-500',
    shadow200: 'shadow-emerald-200',
  },
  teal: {
    bg600: 'bg-teal-600',
    bg700: 'bg-teal-700',
    bg900: 'bg-teal-900',
    bg50: 'bg-teal-50',
    bg100: 'bg-teal-100',
    hoverBg600: 'hover:bg-teal-600',
    hoverBg700: 'hover:bg-teal-700',
    hoverBg50: 'hover:bg-teal-50',
    text600: 'text-teal-600',
    text700: 'text-teal-700',
    text500: 'text-teal-500',
    text400: 'text-teal-400',
    border200: 'border-teal-200',
    border600: 'border-teal-600',
    hoverBorder600: 'hover:border-teal-600',
    focusRing: 'focus:ring-teal-500',
    shadow200: 'shadow-teal-200',
  },
};

export const ThemeContext = createContext<ThemeColors>(themes.emerald);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({
  scheme,
  children,
}: {
  scheme: ColorScheme;
  children: React.ReactNode;
}) => (
  <ThemeContext.Provider value={themes[scheme]}>
    {children}
  </ThemeContext.Provider>
);
