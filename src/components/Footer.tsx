import { component$ } from '@builder.io/qwik';
import { SocialButtons } from './Nav';

export default component$(() => {

  return (
    <footer class="relative flex flex-col gap-1 items-center justify-center text-center w-full z-10 bg-gray-950/30 border-t border-t-gray-700 p-6">
      <div class="flex mb-2">
        <SocialButtons />
      </div>
      <span class="text-sm text-gray-300 max-w-6xl text-center">
        Copyright © 2025 Birdflop. All rights reserved. Birdflop is a registered 501(c)(3) nonprofit organization (EIN: 93-2401009).<br />
        By using this site, you agree to our <a href="/terms" class="text-blue-400 hover:underline">terms of service</a> and <a href="/privacy" class="text-blue-400 hover:underline">privacy policy</a>. Items marked with an asterisk (*) are a reminder that our terms of service apply.
      </span>
    </footer>
  );
});