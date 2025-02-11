import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { Dropdown } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';

export default component$(() => {
  useSpeak({ assets: ['colorstrip'] });
  const t = inlineTranslate();

  const store = useStore({
    type: 0,
    input: '',
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-svh pt-[72px]">
      <div class="my-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('colorstrip.title@@Color Code Stripper')}
        </h1>
        <h2 class="text-gray-50 sm:text-xl mb-12">
          {t('colorstrip.subtitle@@Strips all color / format codes from text')}
        </h2>

        <label for="input">{t('colorstrip.inputText@@Input Text')}</label>
        <input class="lum-input mt-1 mb-3 w-full font-mono" id="input" onInput$={(e, el) => { store.input = el.value; }}/>

        <Dropdown id="gradienttype" class={{ 'w-full': true }} onChange$={(e, el) => { store.type = Number(el.value); }}
          values={[
            { value: 0, name: '&#rrggbb' },
            { value: 1, name: '<#rrggbb>' },
            { value: 2, name: '&x&r&r&g&g&b&b' },
            { value: 3, name: '§x§r§r§g§g§b§b' },
          ]}>
          {t('colorstrip.colorCodeType@@Color Code Type')}
        </Dropdown>

        <div class="mt-3">
          <label for="colorstrip-output">{t('colorstrip.output@@Output')}</label>
          <textarea id="colorstrip-output"
            class={{ 'lum-input h-96 font-mono mt-1 w-full': true }}
            value={
              store.type == 0 ? store.input.replace(/&#([A-Fa-f0-9]){6}/g, '') :
                store.type == 1 ? store.input.replace(/<#([A-Fa-f0-9]){6}>/g, '') :
                  store.type == 2 ? store.input.replace(/&x&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])/g, '') :
                    store.input.replace(/§x§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])/g, '')
            }
          />
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Minecraft Color Code Stripper - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'Strips all color / format codes from text. Developed by Birdflop, a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Strips all color / format codes from text. Developed by Birdflop, a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};