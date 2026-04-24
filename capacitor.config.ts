import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homehearth.ledger',
  appName: 'Five Jars',
  webDir: 'dist',

  ios: {
    contentInset: 'never',
    backgroundColor: '#ffffff',
    scheme: 'fivejars',
  },

  android: {
    backgroundColor: '#ffffff',
  },

  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Splash',
      showSpinner: false,
    },
    StatusBar: {
      // LIGHT = white icons, visible on the blue primary header
      style: 'LIGHT',
      backgroundColor: '#2563d9',
    },
  },
};

export default config;
