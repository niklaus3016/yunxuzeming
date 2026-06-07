import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yunxuzeming.app',
  appName: '云序择名',
  webDir: 'dist',
  icon: {
    source: 'yunxu512.png'
  },
  splash: {
    imagePath: 'yunxu512.png'
  }
};

export default config;
