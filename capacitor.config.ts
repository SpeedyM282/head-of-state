import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.headofstate.app',
  appName: 'Head of State',
  webDir: 'dist',
  android: {
    // Same navy as the splash and icon background, so splash → WebView has no white flash
    // before CSS loads (in either theme).
    backgroundColor: '#1B2C4D',
  },
};

export default config;
