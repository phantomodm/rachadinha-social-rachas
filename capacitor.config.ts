
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fd59ef28ff9f426d826a586aece31536',
  appName: 'rachadinha-social-rachas',
  webDir: 'dist',
  server: {
    url: 'https://fd59ef28-ff9f-426d-826a-586aece31536.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Contacts: {
      permissions: {
        read: "Precisamos de acesso aos seus contatos para importá-los.",
      },
    },
  },
};

export default config;
