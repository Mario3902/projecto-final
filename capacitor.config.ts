import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ao.digitalcomputer.nzila",
  appName: "Nzila",
  webDir: "dist",
  android: {
    allowMixedContent: true,
  },
  server: {
    url: "http://192.168.100.5:8080",
    cleartext: true,
    androidScheme: "http",
  },
};

export default config;
