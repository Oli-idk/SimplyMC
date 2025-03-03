import { component$, Slot, useStore, useVisibleTask$ } from '@builder.io/qwik';

import { Header } from '@luminescent/ui-qwik';
import Footer from '~/components/Footer';
import Nav from '../components/Nav';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  const store = useStore({
    cookies: 'true',
    shouldShowConsent: false,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // convert cookies to json
    const cookieJSON: any = document.cookie.split(';').reduce((res, c) => {
      const [key, val] = c.trim().split('=').map(decodeURIComponent);
      return Object.assign(res, { [key]: val });
    }, {});

    if (!cookieJSON['cookies']) {
      store.cookies = 'false';

      try {
        // Fetch user's location information
        const response = await fetch('https://ipapi.co/json/');
        const locationData = await response.json();

        // Check if user is from California or EU
        const isCaliforniaUser = locationData.region_code === 'CA' && locationData.country_code === 'US';
        const isEUUser = [
          'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
          'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
          'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB',
        ].includes(locationData.country_code);

        // Only show consent popup for California or EU users
        store.shouldShowConsent = isCaliforniaUser || isEUUser;
      } catch (error) {
        console.error('Error determining user location:', error);
        // Fallback to showing consent for everyone if geolocation fails
        store.shouldShowConsent = true;
      }
    }
  });

  return <>
    <Nav />
    <Slot />
    {store.cookies != 'true' && store.shouldShowConsent &&
      <div class={{
        'fixed bottom-0 sm:bottom-4 w-svw sm:w-auto sm:right-4 backdrop-blur-xl z-[1000] animate-in fade-in slide-in-from-bottom-8 anim-duration-1000 lum-card lum-bg-gray-900/60': true,
      }} id="cookieprompt">
        <Header subheader="We use cookies to automatically save and load your preferences.">
          Cookies
        </Header>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button class="lum-btn lum-bg-transparent" onClick$={async () => {
            document.cookie = 'optout=true; path=/';
            document.getElementById('cookieprompt')!.remove();
          }}>
            Turn off cookies
          </button>
          <Link class="lum-btn lum-bg-transparent" href="/privacy">
            Privacy Policy
          </Link>
          <button class="lum-btn" onClick$={async () => {
            document.cookie = 'cookies=true; path=/';
            document.getElementById('cookieprompt')!.remove();
          }}>
            Okay
          </button>
        </div>
      </div>
    }
    <Footer />
  </>;
});