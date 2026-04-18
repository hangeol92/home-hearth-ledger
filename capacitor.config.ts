import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homehearth.ledger',
  appName: 'Five Jars',
  webDir: 'dist',

  ios: {
    contentInset: 'always',       // respect safe-area on notch/Dynamic Island
    backgroundColor: '#ffffff',
    scheme: 'fivejars',
  },

  android: {
    backgroundColor: '#ffffff',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Splash',
      showSpinner: false,
    },
    StatusBar: {
      // iOS only – matches the light header in the app
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
