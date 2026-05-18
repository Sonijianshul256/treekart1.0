export async function initOneSignal(uid: string) {
  const appId = process.env.NEXT_PUBLIC_ONE_SIGNAL_APP_ID;
  if (!appId || !('serviceWorker' in navigator)) return;

  const win = window as unknown as { OneSignalDeferred?: Array<(OneSignal: unknown) => void> };
  win.OneSignalDeferred = win.OneSignalDeferred || [];
  win.OneSignalDeferred.push(async (OneSignal: any) => {
    await OneSignal.init({ appId, allowLocalhostAsSecureOrigin: true });
    await OneSignal.login(uid);
  });

  if (!document.querySelector('script[src*="OneSignalSDK.page.js"]')) {
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);
  }
}
