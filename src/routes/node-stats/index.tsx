import { component$, useOnDocument, $ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

import { Blobs, Header } from '@luminescent/ui-qwik';
import { StatsChartOutline } from 'qwik-ionicons';
import { unloadGoogleAds } from '~/components/util/GoogleAds';

export default component$(() => {

  useOnDocument(
    'load',
    $(() => {
      unloadGoogleAds();
    }),
  );

  return <>
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 py-16 items-center min-h-svh">
      <div class="justify-center flex relative max-w-6xl px-10 py-24">
        <div class="flex flex-col gap-8">
          <h1 class="flex gap-4 items-center justify-center text-gray-100 text-2xl sm:text-4xl font-bold mb-4 text-center drop-shadow-lg">
            <StatsChartOutline width="64" /> Node Stats
          </h1>
          <div class="flex flex-wrap gap-3 justify-center">
            <a class="lum-btn lum-pad-lg lum-bg-blue-600/70 hover:lum-bg-blue-600 text-lg" href="https://status.birdflop.com/">
              Overview
            </a>
            <a class="lum-btn lum-pad-lg lum-bg-blue-600/70 hover:lum-bg-blue-600 text-lg" href="https://netdata.birdflop.com/panel">
              Web Services
            </a>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <a class="lum-card lum-bg-red-900/30 hover:lum-bg-red-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=crabwings.birdflop.com:9100&orgId=1">
              <Header subheader="New York City Metro, USA">
                Crabwings
              </Header>
              crabwings.birdflop.com
              <Blobs color='red' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-orange-900/30 hover:lum-bg-orange-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=impeyes.birdflop.com:9100&orgId=1">
              <Header subheader="Falkenstein, Germany (EU)">
                Impeyes
              </Header>
              impeyes.birdflop.com
              <Blobs color='orange' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-yellow-900/30 hover:lum-bg-yellow-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=jellyfishjaws.birdflop.com:9100&orgId=1">
              <Header subheader="Falkenstein, Germany (EU)">
                Jellyfishjaws
              </Header>
              jellyfishjaws.birdflop.com
              <Blobs color='yellow' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-green-900/30 hover:lum-bg-green-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=koalaknees.birdflop.com:9100&orgId=1">
              <Header subheader="Ashburn, VA, USA">
                Koalaknees
              </Header>
              koalaknees.birdflop.com
              <Blobs color='green' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-teal-900/30 hover:lum-bg-teal-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=llamalips.birdflop.com:9100&orgId=1">
              <Header subheader="Falkenstein, Germany (EU)">
                Llamalips
              </Header>
              llamalips.birdflop.com
              <Blobs color='teal' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-blue-900/30 hover:lum-bg-blue-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=monkeymouth.birdflop.com:9100&orgId=1">
              <Header subheader="New York City Metro, USA">
                Monkeymouth
              </Header>
              monkeymouth.birdflop.com
              <Blobs color='blue' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-violet-900/30 hover:lum-bg-violet-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=narwhalnose.birdflop.com:9100&orgId=1">
              <Header subheader="Ashburn, VA, USA">
                Narwhalnose
              </Header>
              narwhalnose.birdflop.com
              <Blobs color='violet' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-pink-900/30 hover:lum-bg-pink-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=owlorgans.birdflop.com:9100&orgId=1">
              <Header subheader="Falkenstein, Germany (EU)">
                Owlorgans
              </Header>
              owlorgans.birdflop.com
              <Blobs color='pink' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
          </div>
        </div>
      </div>
    </section>
  </>;
});

export const head: DocumentHead = {
  title: 'Birdflop Node Stats',
  meta: [
    {
      name: 'description',
      content: 'Check the status of Birdflop\'s nodes.',
    },
    {
      name: 'og:description',
      content: 'Check the status of Birdflop\'s nodes.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};