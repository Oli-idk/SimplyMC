/* eslint-disable qwik/valid-lexical-scope */
import { component$, useStore, useTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { Dropdown, Toggle, DropdownRaw } from '@luminescent/ui-qwik';
import { CodeWorkingOutline, CubeOutline, HelpOutline, RefreshCircleOutline, TerminalOutline } from 'qwik-ionicons';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies } from '~/components/util/SharedUtils';
import { generateResult } from '~/components/util/flags/generateResult';
import { extraFlags as extFlags } from '~/data/flags';
import { serverType as srvType } from '~/data/environment/serverType';
import { isBrowser } from '@builder.io/qwik/build';

const flagTypes = {
  'none': 'none',
  'aikars': 'Aikar\'s Flags',
  'meowice': 'MeowIce\'s Flags',
  'benchmarkedG1GC': 'Benchmarked (G1GC)',
  'benchmarkedZGC': 'Benchmarked (ZGC)',
  'benchmarkedShenandoah': 'Benchmarked (Shenandoah)',
  'hillttys': 'hilltty\'s Flags',
  'obyduxs': 'Obydux\'s Flags',
  'etils': 'Etil\'s Flags',
  'proxy': 'Proxy',
};

const defaults = {
  operatingSystem: 'linux',
  serverType: 'paper',
  gui: false,
  variables: false,
  autoRestart: false,
  extraFlags: [] as string[],
  fileName: 'server.jar',
  flags: 'aikars' as keyof typeof flagTypes,
  withResult: true,
  withFlags: false,
  memory: 0,
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  return await getCookies(cookie, 'parsed', url.searchParams) as typeof defaults;
});

export default component$(() => {
  useSpeak({ assets: ['flags'] });
  const t = inlineTranslate();

  const environmentOptions = [
    {
      name: t('flags.environments.linux.label@@Linux'),
      value: 'linux',
    },
    {
      name: t('flags.environments.windows.label@@Windows'),
      value: 'windows',
    },
    {
      name: t('flags.environments.macos.label@@macOS'),
      value: 'macos',
    },
    {
      name: t('flags.environments.pterodactyl.label@@Pterodactyl'),
      value: 'pterodactyl',
    },
    {
      name: t('flags.environments.command.label@@Command'),
      value: 'command',
    },
  ];

  const softwareOptions = [
    {
      name: t('flags.serverType.paper.label@@Paper'),
      value: 'paper',
    },
    {
      name: t('flags.serverType.purpur.label@@Purpur'),
      value: 'purpur',
    },
    //{
    //  name: t('flags.serverType.forge.label@@Forge'),
    //  value: 'forge',
    //},
    //{
    //  name: t('flags.serverType.fabric.label@@Fabric'),
    //  value: 'fabric',
    //},
    {
      name: t('flags.serverType.velocity.label@@Velocity'),
      value: 'velocity',
    },
    {
      name: t('flags.serverType.waterfall.label@@Waterfall'),
      value: 'waterfall',
    },
  ];

  const configOptions = {
    gui: {
      label: <>
        <TerminalOutline class="w-6 h-6"/> {t('flags.gui.label@@No GUI')}
      </>,
      description: t('flags.gui.description@@Whether to display the built-in server management GUI.'),
      disable: ['pterodactyl', 'velocity', 'waterfall'],
    },
    variables: {
      label: <>
        <CodeWorkingOutline class="w-6 h-6" /> {t('flags.variables.label@@Use Variables')}
      </>,
      description: t('flags.variables.description@@Whether to use environment variables within the script to define memory, file name, and other commonly changed elements.'),
      disable: [] as string[],
    },
    autoRestart: {
      label: <>
        <RefreshCircleOutline class="w-6 h-6" /> {t('flags.autoRestart.label@@Auto-restart')}
      </>,
      description: t('flags.autoRestart.description@@Whether to automatically restart after it is stopped.'),
      disable: [] as string[],
    },
  };

  const extraFlagsOptions = {
    vectors: {
      label: <>
        <CubeOutline class="w-6 h-6" /> {t('flags.extraFlags.vectors.label@@Modern Vectors')}
      </>,
      description: t('flags.extraFlags.vectors.description@@Enables SIMD operations to optimize map item rendering on Pufferfish and its forks.'),
    },
    benchmarkedGraalVM: {
      label: <>
        <CubeOutline class="w-6 h-6" /> {t('flags.extraFlags.benchmarkedGraalVM.label@@Benchmarked (GraalVM)')}
      </>,
      description: t('flags.extraFlags.benchmarkedGraalVM.description@@Additional performance flags for Benchmarked (G1GC) exclusive to GraalVM users.'),
    },
    meowiceGraalVM: {
      label: <>
        <CubeOutline class="w-6 h-6" /> {t('flags.extraFlags.meowiceGraalVM.label@@MeowIce\'s Flags (GraalVM)')}
      </>,
      description: t('flags.extraFlags.meowiceGraalVM.description@@Additional performance flags for MeowIce\'s Flags exclusive to GraalVM users.'),
    },
  };

  const cookies = useCookies().value;
  const store = useStore({
    ...defaults,
    ...cookies,
  }, { deep: true });

  useTask$(({ track }) => {
    if (isBrowser) setCookies('parsed', store);
    (Object.keys(store) as Array<keyof typeof store>).forEach((key) => {
      track(() => store[key]);
    });
  });

  return (
    <section class="flex mx-auto max-w-5xl px-6 justify-center min-h-svh pt-[72px] scale-for-mac">
      <div class="w-full my-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('flags.title@@Flags Generator')}
        </h1>
        <h2 class="text-gray-50 sm:text-xl mb-6">
          {t('flags.subtitle@@A simple script generator to start your Minecraft servers with optimal flags.')}
        </h2>

        <div class="flex [&>*]:flex-1 flex-wrap gap-4 justify-between my-6 fill-current">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label for="input">
                <span class="font-bold">{t('flags.fileName.label@@File Name')}</span><br/>
                {t('flags.fileName.description@@The name of the file that will be used to start your server.')}
              </label>
              <input class="lum-input" id="input" value={store.fileName} placeholder="server.jar" onChange$={(e, el) => {
                if (el.value.replace(/ /g, '') == '') return;
                if (!el.value.endsWith('.jar')) { el.value += '.jar'; }
                store.fileName = el.value;
              }}/>
            </div>
            <div class="flex gap-2">
              <Dropdown id="os" class={{ 'w-full': true }} onChange$={(e, el) => {
                store.operatingSystem = el.value;
              }} values={environmentOptions} value={store.operatingSystem}>
                <span class="font-bold">{t('flags.environment.label@@Environment')}</span><br/>
                {t('flags.enviroments.description@@The operating system that the server runs on.')}
              </Dropdown>
              <Dropdown id="software" class={{ 'w-full': true }} onChange$={(e, el) => {
                store.serverType = el.value;
                if (!srvType[store.serverType].flags.includes(el.value)) {
                  store.flags = srvType[store.serverType].flags[1] as keyof typeof flagTypes;
                }
              }} values={softwareOptions} value={store.flags}>
                <span class="font-bold">{t('flags.software.label@@Software')}</span><br/>
                {t('flags.software.description@@The software in which your Minecraft server will run on.')}
              </Dropdown>
            </div>
            <div>
              <span class="font-bold">{t('memory.label@@Memory')}</span><br/>
              {t('flags.memory.description@@The amount of memory (RAM) to allocate to your server.')}
              <div class="group relative w-full h-2 lum-bg-gray-800 hover:lum-bg-gray-700 select-none rounded-lg my-2">
                <div class="h-2 lum-bg-blue-800 group-hover:lum-bg-blue-700 rounded-lg" style={{ width: `${store.memory / 32 * 100}%` }} />
                <div class="absolute w-full top-1 flex justify-between">
                  <span class="text-left">|</span>
                  <span class="text-center">|</span>
                  <span class="text-center">|</span>
                  <span class="text-center">|</span>
                  <span class="text-right">|</span>
                </div>
                <div class="absolute -top-1 flex flex-col gap-4 items-center" style={{ left: `calc(${store.memory / 32 * 100}% - 48px)` }}>
                  <div class="w-4 h-4 lum-bg-blue-700 group-hover:lum-bg-blue-600 rounded-full" />
                  <div class="opacity-0 group-hover:opacity-100 w-24 py-2 bg-gray-800 rounded-lg flex justify-center transition-all z-50">
                    {store.memory} GB
                  </div>
                </div>
                <input id="labels-range-input" type="range" min="0" max="32" step="0.5" value={store.memory} class="absolute top-0 h-2 w-full opacity-0 cursor-pointer" onInput$={(e, el) => {
                  store.memory = Number(el.value);
                }} />
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex items-end gap-2">
              <Dropdown id="flags" class={{ 'w-full': true }} onChange$={(e, el) => {
                store.flags = el.value as keyof typeof flagTypes;
              }} values={Object.keys(flagTypes).map(flag => ({
                name: flagTypes[flag as keyof typeof flagTypes],
                value: flag,
              }))} value={store.flags}>
                <span class="font-bold">{t('flags.flags.label@@Flags')}</span><br/>
                {t('flags.description@@The collection of start arguments that typically optimize the server\'s performance')}
              </Dropdown>
              <DropdownRaw id="flagshelp" onChange$={(e, el) => {
                store.flags = el.value as keyof typeof flagTypes;
              }} display={<><HelpOutline width={24}/></>}>
                <a class="lum-btn lum-bg-transparent" q:slot='extra-buttons' href="https://docs.papermc.io/paper/aikars-flags" target="_blank">
                  Aikar's Flags
                </a>
                <a class="lum-btn lum-bg-transparent" q:slot='extra-buttons' href="https://github.com/MeowIce/meowice-flags" target="_blank">
                  MeowIce's Flags
                </a>
                <a class="lum-btn lum-bg-transparent" href="https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks" target="_blank">
                  Benchmarked Flags
                </a>
                <a class="lum-btn lum-bg-transparent" href="https://github.com/hilltty/hilltty-flags/blob/main/english-lang.md" target="_blank">
                  hilltty's Flags
                </a>
                <a class="lum-btn lum-bg-transparent" href="https://github.com/Obydux/Minecraft-GraalVM-Flags" target="_blank">
                  Obydux's Flags
                </a>
              </DropdownRaw>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <span class="font-bold">{t('flags.config.label@@Config')}</span><br/>
                {t('flags.config.description@@The various additions and modifications that can be made to your start script.')}
              </div>
              {(Object.entries(configOptions) as [keyof typeof configOptions, typeof configOptions[keyof typeof configOptions]][]).filter(([,option]) => {
                return !option.disable?.includes(store.operatingSystem) && !option.disable?.includes(store.serverType);
              }).map(([id, option]) => <>
                <Toggle key={id} label={option.label} checked={store[id]} onClick$={(e, el) => {
                  store[id] = el.checked;
                }} />
                {option.description && <p class="text-gray-400 text-sm">{option.description}</p>}
              </>)}
              {(Object.entries(extraFlagsOptions) as [keyof typeof extraFlagsOptions, typeof extraFlagsOptions[keyof typeof extraFlagsOptions]][]).filter(([id]) => {
                return extFlags[id].supports.includes(store.flags) && srvType[store.serverType].extraFlags?.includes(id);
              }).map(([id, option]) => <>
                <Toggle key={id} label={option.label} checked={store.extraFlags.includes(id)} onClick$={(e, el) => {
                  if (el.checked) {
                    store.extraFlags.push(id);
                  } else {
                    store.extraFlags.splice(store.extraFlags.indexOf(id), 1);
                  }
                }} />
                {option.description && <p class="text-gray-400 text-sm">{option.description}</p>}
              </>)}
            </div>
          </div>
        </div>

        {/* charlimit={256} */}
        <label for="Output" class="text-gray-50">
          <span class="font-bold">{t('flags.script.label@@Script')}</span><br/>
          {t('flags.script.description@@The resulting script that can be used to start your server. Place this file in the same location as {{fileName}}, then execute it!', { fileName: store.fileName })}
        </label>
        <textarea class={{ 'lum-input h-96 font-mono mt-2 w-full': true }} id="Output" value={((p: any) => generateResult(p).script)(store)}/>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Minecraft Flags Generator - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'A simple script generator to start your Minecraft servers with optimal flags. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'A simple script generator to start your Minecraft servers with optimal flags. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
  scripts: [
    {
      props: {
        async: true,
        type: 'text/javascript',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947',
        crossOrigin: 'anonymous',
      },
    },
  ],
};