import { $, component$, useOn, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { Toggle } from '@luminescent/ui-qwik';
import {
  inlineTranslate,
  useSpeak,
} from 'qwik-speak';

export default component$(() => {
  useSpeak({ assets: ['animtexture'] });
  const t = inlineTranslate();

  const store = useStore({
    frames: [] as any[],
    textureName: '',
    cumulative: false,
  }, { deep: true });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (document.getElementsByName('gifframes')[0]) return;
    const script = document.createElement('script');
    script.src = '/scripts/gif-frames.js';
    script.defer = true;
    script.setAttribute('name', 'gifframes');
    document.head.appendChild(script);
  });

  useOn('change', $((e, el) => {
    const { files } = el as HTMLInputElement;
    if (!files) return;
    Array.from(files).forEach(file => {
      const f = new FileReader();
      f.readAsDataURL(file);
      f.onloadend = async (e) => {
        const b64 = e!.target!.result;
        const type = b64!.toString().split(',')[0].split(';')[0].split(':')[1];
        if (type == 'image/gif') {
          // @ts-ignore
          const gifframes = await gifFrames({ url: b64, frames: 'all', cumulative: store.cumulative });
          gifframes.forEach((frame: any) => {
            const contentStream = frame.getImage();
            const imageData = window.btoa(String.fromCharCode.apply(null, contentStream._obj));
            const b64frame = `data:image/png;base64,${imageData}`;

            store.frames.push({ img: b64frame, delay: Math.ceil(20 * frame.frameInfo.delay / 100) });
          });
          return;
        }
        store.frames.push({ img: b64, delay: 20 });
      };
    });
  }));
  return (
    <section class="flex mx-auto max-w-4xl px-6 items-center justify-center min-h-svh pt-[72px]">
      <div class="my-10 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('animtexture.title@@Animated Textures')}
        </h1>
        <h2 class="text-gray-50 sm:text-xl mb-12">
          {t('animtexture.subtitle@@Easily merge textures for resource pack animations')}
        </h2>

        <div class="flex flex-col gap-2">
          <label for="fileInput">Select Frame(s) or a GIF</label>
          <input id="fileInput" type="file" multiple accept="image/*" class="file:lum-btn rounded-lg file:cursor-pointer flex" />
        </div>

        <div id="imgs" class="flex flex-wrap max-h-[620px] overflow-auto my-4 gap-2">
          {store.frames.map((frame, i) => (
            <div key={`frame${i}`} class="w-24 rounded-lg border-gray-700 border-2">
              <img width={96} height={96} class="rounded-t-md" src={frame.img} />
              <input type="number" value={frame.delay} onInput$={(e, el) => { store.frames[i].delay = el.value; }} class="w-full text-lg bg-gray-700 text-white text-center focus:bg-gray-600 p-2 rounded-b-md" />
            </div>
          ))}
        </div>

        <label for="textureName">{t('animtexture.textureName@@Texture Name')}</label><br />
        <input id="textureName" class={{ 'lum-input mb-3 mt-2': true }} value={store.textureName} onInput$={(e, el) => { store.textureName = el.value; }}/>

        <Toggle id="Cumulative" checked={store.cumulative}
          onChange$={(e, el) => { store.cumulative = el.checked; }}
          label={t('animtexture.cumulative@@Cumulative (Turn this on if gif frames are broken)')} />

        <button class={{ 'lum-btn my-6': true }} onClick$={() => {
          const canvas = document.getElementById('c') as HTMLCanvasElement;
          canvas.classList.add('sm:flex');
          const imglist = document.getElementById('imgs') as HTMLDivElement;
          const ctx = canvas.getContext('2d')!;
          const imgs = imglist.getElementsByTagName('IMG') as HTMLCollectionOf<HTMLImageElement>;
          let max = 0;
          for (let i = 0; i != imgs.length; i++) {
            if (imgs[i].naturalWidth > max) max = imgs[i].naturalWidth;
          }
          canvas.width = max;
          canvas.height = max * imgs.length;
          ctx.imageSmoothingEnabled = false;
          for (let i = 0; i != imgs.length; i++) {
            ctx.drawImage(imgs[i], 0, i * max);
            ctx.drawImage(imgs[i], 0, max * i, max, max);
          }
          const b64 = canvas.toDataURL();
          const pngd = document.getElementById('pngd') as HTMLAnchorElement;
          const mcmeta = document.getElementById('mcmeta') as HTMLAnchorElement;
          pngd.href = b64;
          pngd.download = store.textureName + '.png';
          mcmeta.download = store.textureName + '.png.mcmeta';

          const start = '{"animation":{"frames": [';
          const frameBase = '{"index": ';
          const frameMid = ', "time": ';
          const frameEnd = '},';
          let res = start;
          for (let i = 0; i != store.frames.length; i++) {
            let tmp = frameBase;
            tmp += i;
            tmp += frameMid;
            tmp += store.frames[i].delay;
            tmp += frameEnd;
            res += tmp;
          }
          res = res.substring(0, res.length - 1);
          res += ']}}';

          mcmeta.href = 'data:text/plain;charset=utf-8,' + res;

          const links = document.getElementById('links')!;
          links.className = 'inline';
        }}>
          {t('animtexture.generate@@Generate')}
        </button>

        <div id="links" class="hidden">
          <p class="mb-4">Animated Texture Generated Successfully!</p>
          <div class="flex gap-2">
            <a class="lum-btn" id="pngd" href='/'>
              {t('animtexture.downloadPNG@@Download PNG')}
            </a>
            <a class="lum-btn" id="mcmeta" target="_blank" href='data:text/plain;charset=utf-8,{"animation":{}}'>
              {t('animtexture.downloadMCMETA@@Download MCMETA')}
            </a>
          </div>
        </div>

      </div>
      <canvas id="c" class="w-24 max-h-svh ml-48 hidden"></canvas>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Minecraft Animated Textures Creator - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'Easily merge textures for resource pack animations or convert from GIF, by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Easily merge textures for resource pack animations or convert from GIF, by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};