import { Slot, component$, useStore } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  const store = useStore({
    redirect: '',
    error: '',
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-svh pt-[72px]">
      <div class="my-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          Spark Profile Analysis
        </h1>
        <h2 class="text-gray-50 sm:text-xl">
          These are not magic values. Many of these settings have real consequences on your server's mechanics.<br />
          See <a href="https://eternity.community/index.php/paper-optimization/" class="text-blue-400 hover:underline">this guide</a> for detailed information on the functionality of each setting.
        </h2>

        <Slot />

        <label for="link">Paste the spark profile link here</label>
        <input class="lum-input mt-1 w-full" id="link" onInput$={(e, el) => {
          const link = el.value;
          store.redirect = '';
          if (link.startsWith('https://timin') || link.startsWith('https://www.spigotmc.org/go/timings?url=')) {
            store.error = '⚠️ This is a Timings Report. Use the Timings Report Analysis for this type of report.';
          }
          else if (link.startsWith('https://www.spigotmc.org/go/timings?url=') || link.startsWith('https://spigotmc.org/go/timings?url=')) {
            store.error = '❌ Spigot timings have limited information. Switch to Purpur (or Paper) for better timings analysis. All your plugins will be compatible, and if you don\'t like it, you can easily switch back.';
          }
          else if (!link.startsWith('https://spark.lucko.me/')) {
            store.error = '❌ This is an Invalid Spark Profile Link.';
          }
          else {
            store.error = '';
            const code = link.replace('https://spark.lucko.me/', '');
            store.redirect = `/resources/sparkprofile/${code}`;
          }
        }}/>

        <p class={{
          'text-red-400 mt-3': true,
          'hidden': !store.error,
        }}>{store.error}</p>
        <div class={{
          'flex mt-3': true,
          'hidden': !store.redirect,
        }}>
          <Link href={store.redirect} class="lum-btn lum-bg-blue-700 hover:lum-bg-blue-600">
            Submit
          </Link>
        </div>

        <p class="text-white my-12">
          You can also copy the code into a link<br />
          <span class="text-gray-300">https://birdflop.com/resources/sparkprofile/[code]</span><br />
          Powered by <a href="https://github.com/Pemigrade/botflop" class="text-blue-400 hover:underline">botflop</a>
        </p>
      </div>
    </section>
  );
});