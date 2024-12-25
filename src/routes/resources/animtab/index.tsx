import { $, component$, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { defaults, loadPreset, types, v3formats, presets as presetlist } from '~/components/util/PresetUtils';
import { AnimationOutput, convertToHex, convertToRGB, getAnimFrames, getBrightness, getRandomColor } from '~/components/util/RGBUtils';

import { Add, BarChartOutline, ChevronDown, ChevronUp, ColorFillOutline, DiceOutline, DownloadOutline, GlobeOutline, LinkOutline, SaveOutline, SettingsOutline, ShareOutline, Text, TrashOutline } from 'qwik-ionicons';

import { Dropdown, Toggle, NumberInput, ColorPicker } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies, sortColors } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';
import { rgbDefaults } from '../rgb';
import { Gradient } from '~/components/util/HexUtils';

export const animTABDefaults = {
  name: defaults.name,
  type: defaults.type,
  speed: defaults.speed,
  length: defaults.length,
  outputFormat: defaults.outputFormat,
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  const animtabCookies = await getCookies(cookie, 'animtab', url.searchParams) as Partial<typeof animTABDefaults>;
  const rgbCookies = await getCookies(cookie, 'rgb', url.searchParams) as Partial<typeof rgbDefaults>;
  const presetCookies = await getCookies(cookie, 'presets') as { savedPresets: Partial<typeof defaults>[] };
  if (!rgbCookies.customFormat) {
    delete rgbCookies.format;
    delete animtabCookies.outputFormat;
  }
  return {
    animtab: animtabCookies,
    rgb: rgbCookies,
    presets: presetCookies.savedPresets || [],
  };
});

export default component$(() => {
  useSpeak({ assets: ['animtab', 'color'] });
  const t = inlineTranslate();

  const cookies = useCookies().value;
  const store = useStore({
    ...structuredClone(rgbDefaults),
    ...cookies.rgb,
  }, { deep: true });

  const animtabstore = useStore({
    ...animTABDefaults,
    ...cookies.animtab,
  }, { deep: true });

  const tmpstore: {
    opened: {
      id: number,
      type: number,
    },
    alerts: {
      class: string,
      text: string,
    }[],
    frames: (string | null)[][],
    frame: number,
  } = useStore({
    opened: {
      id: -1,
      type: 0,
    },
    alerts: [],
    frames: [],
    frame: 0,
  }, { deep: true });

  const handleSwap = $((currentIndex: number, newIndex: number) => {
    // check if the index is out of bounds
    const colorsLength = store.colors.length;
    if (newIndex < 0) {
      newIndex = colorsLength - 1;
    } else if (newIndex >= colorsLength) {
      newIndex = 0;
    }

    const newColors = [...store.colors];
    const currentPos = Number(`${store.colors[currentIndex].pos}`);
    newColors[currentIndex].pos = newColors[newIndex].pos;
    newColors[newIndex].pos = currentPos;
    store.colors = sortColors(newColors);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    let lastTime = performance.now();
    function setFrame(currentTime: number) {
      const deltaTime = (currentTime - lastTime);
      if (tmpstore.frames[0] && deltaTime > animtabstore.speed) {
        tmpstore.frame = tmpstore.frame + 1 >= tmpstore.frames.length ? 0 : tmpstore.frame + 1;
        lastTime = currentTime;
      }
      requestAnimationFrame(setFrame);
    }
    setFrame(performance.now());
  });

  useTask$(({ track }) => {
    if (isBrowser) {
      setCookies('rgb', store);
      setCookies('animtab', { version: store.version, ...animtabstore });
    }
    (Object.keys(store) as Array<keyof typeof store>).forEach((key) => {
      track(() => store[key]);
    });
    (Object.keys(animtabstore) as Array<keyof typeof animtabstore>).forEach((key) => {
      track(() => animtabstore[key]);
    });
    const { frames } = getAnimFrames({ ...store, ...animtabstore, text: store.text != '' ? store.text : 'Birdflop' });
    if (animtabstore.type == 1) {
      tmpstore.frames = frames.reverse();
    }
    else if (animtabstore.type == 3) {
      const frames2 = frames.slice();
      tmpstore.frames = frames.reverse().concat(frames2);
    }
    else {
      tmpstore.frames = frames;
    }
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('animtab.title@@Animated TAB')}
        </h1>
        <h2 class="text-gray-50 mt-1 mb-9">
          {t('animtab.subtitle@@TAB plugin gradient animation creator')}
        </h2>

        <label for="output">
          <span class="font-bold mr-2 text-gray-100">{t('color.output@@Output')}</span>
          <span class="text-gray-500">- {t('color.outputSubtitle@@Copy-paste this for RGB text!')}</span>
        </label>
        <textarea id="output" class={{ 'lum-input whitespace-pre h-32 w-full font-mono text-nowrap text-sm mt-1': true }} value={AnimationOutput({ ...store, ...animtabstore })}/>

        <h1 class={{
          'text-3xl md:text-4xl xl:text-5xl my-4 break-all font-mc tracking-tight': true,
          'font-mc-bold': store.bold,
          'font-mc-italic': store.italic,
          'font-mc-bold-italic': store.bold && store.italic,
        }}>
          {(() => {
            if (!store.text || !tmpstore.frames[0]) return '\u00A0';

            const colors = tmpstore.frames[tmpstore.frame];
            if (!colors) return '\u00A0';

            const segments = [...store.text.matchAll(new RegExp(`.{1,${store.colorlength}}`, 'g'))];
            return segments.map((segment, i) => (
              <span key={`char${i}`} style={`color: #${colors[i] ?? colors[i - 1] ?? colors[0]};`} class={{
                'underline': store.underline,
                'strikethrough': store.strikethrough,
                'underline-strikethrough': store.underline && store.strikethrough,
              }}>
                {segment[0].replace(/ /g, '\u00A0')}
              </span>
            ));
          })()}
        </h1>

        <div class="w-full h-3 my-5 rounded-full items-center relative" id="colormap"
          style={`background: linear-gradient(to right, ${sortColors(store.colors).map(color => `${color.hex} ${color.pos}%`).join(', ')});`}
          onMouseDown$={(e, el) => {
            if (e.target != el) return;
            const rect = el.getBoundingClientRect();
            const pos = ((e.clientX - rect.left) / rect.width) * 100;
            if (store.colors.find(c => c.pos == pos)) return;
            const newColors = store.colors.slice(0);
            newColors.push({ hex: getRandomColor(), pos });
            store.colors = sortColors(newColors);
          }}
          onMouseEnter$={(e, el) => {
            const abortController = new AbortController();
            el.addEventListener('mousemove', e => {
              const addbutton = document.getElementById('add-button')!;
              if (e.target != el) {
                addbutton.classList.add('opacity-0');
                return;
              }
              const rect = el.getBoundingClientRect();
              const pos = ((e.clientX - rect.left) / rect.width) * 100;
              if (store.colors.find(c => c.pos == pos)) return;
              addbutton.classList.remove('opacity-0');
              addbutton.style.left = `${pos}%`;
            }, { signal: abortController.signal });
            el.addEventListener('mouseleave', () => {
              const addbutton = document.getElementById('add-button')!;
              addbutton.classList.add('opacity-0');
              abortController.abort();
            }, { signal: abortController.signal });
          }}
        >
          <div id="add-button" class={{
            'absolute -mt-1 -ml-3 w-5 h-5 rounded-md border border-gray-700 bg-gray-800 opacity-0 pointer-events-none': true,
          }}>
            <Add width="19" />
          </div>
          {store.colors.map((color, i) => <div class="absolute -mt-1 -ml-3" key={`${i}/${store.colors.length}`}
            onMouseDown$={(e, el) => {
              const abortController = new AbortController();
              const colormap = document.getElementById('colormap')!;
              const rect = colormap.getBoundingClientRect();
              document.addEventListener('mousemove', e => {
                tmpstore.opened.id = -1;
                el.classList.add('-mt-2', 'scale-125', 'z-[1000]');
                el.style.filter = 'drop-shadow(0 0 10px rgb(31 41 55))';
                let pos = ((e.clientX - rect.left) / rect.width) * 100;
                if (pos < 0) pos = 0;
                if (pos > 100) pos = 100;
                if (store.colors.find(c => c.pos == pos)) return;
                const newColors = store.colors.slice(0);
                newColors[i].pos = pos;
                store.colors = newColors;
              }, { signal: abortController.signal });
              document.addEventListener('mouseup', () => {
                el.classList.remove('-mt-2', 'scale-125', 'z-[1000]');
                el.style.filter = '';
                abortController.abort();
                store.colors = sortColors(store.colors);
              }, { signal: abortController.signal });
            }} style={{
              left: `${color.pos}%`,
            }}
            preventdefault:mousedown
          >
            <div key={`colormap-color-${i + 1}`} id={`colormap-color-${i + 1}`}
              class={{
                'transition-transform w-5 h-5 hover:scale-125 rounded-md shadow-md border': true,
                'border-gray-400': getBrightness(convertToRGB(color.hex)) < 126,
                'border-gray-700': getBrightness(convertToRGB(color.hex)) > 126,
              }}
              style={`background: ${color.hex};`}
              onMouseUp$={() => {
                const picker = document.getElementById(`colormap-color-${i + 1}-picker`)!;
                picker.dataset.value = color.hex;
                picker.dispatchEvent(new Event('input'));
                const opened = tmpstore.opened;
                if (opened.id == i && opened.type == 0) return tmpstore.opened.id = -1;
                else tmpstore.opened = { id: i, type: 0 };
                const abortController = new AbortController();
                document.addEventListener('click', (e) => {
                  if (e.target instanceof HTMLElement && !e.target.closest(`#colormap-color-${i + 1}`) && !e.target.closest(`#colormap-color-${i + 1}-popup`)) {
                    tmpstore.opened.id = -1;
                    abortController.abort();
                  }
                }, { signal: abortController.signal });
              }}
            />
            <div id={`colormap-color-${i + 1}-popup`} stoppropagation:mousedown class="hidden sm:flex">
              <div class={{
                'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2': true,
                'opacity-0 scale-95 pointer-events-none': tmpstore.opened.id != i || tmpstore.opened.type != 0,
                'left-0 items-start': color.pos < 50,
                'right-0 items-end': color.pos >= 50,
              }}>
                {store.colors.length > 2 &&
                  <button class="lum-btn lum-pad-equal-sm lum-bg-red-700 hover:lum-bg-red-600" onClick$={() => {
                    const newColors = store.colors.slice(0);
                    newColors.splice(i, 1);
                    store.colors = sortColors(newColors);
                  }}>
                    <TrashOutline width="20" />
                  </button>
                }
                <ColorPicker
                  id={`colormap-color-${i + 1}-picker`}
                  value={color.hex}
                  onInput$={newColor => {
                    const newColors = store.colors.slice(0);
                    newColors[i].hex = newColor;
                    store.colors = sortColors(newColors);
                  }}
                  horizontal
                />
              </div>
            </div>
          </div>,
          )}
        </div>

        <div id="mobile-navbuttons" class="my-3 sm:hidden">
          <div class="flex gap-2">
            <button class="lum-btn lum-pad-equal-md" aria-label="Colors" onClick$={() => {
              document.getElementById('colors')!.classList.replace('hidden', 'flex');
              document.getElementById('inputs')!.classList.replace('flex', 'hidden');
              document.getElementById('formatting')!.classList.replace('flex', 'hidden');
            }}>
              <ColorFillOutline width="24" />
            </button>
            <button class="lum-btn lum-pad-equal-md" aria-label="Inputs" onClick$={() => {
              document.getElementById('colors')!.classList.replace('flex', 'hidden');
              document.getElementById('inputs')!.classList.replace('hidden', 'flex');
              document.getElementById('formatting')!.classList.replace('flex', 'hidden');
            }}>
              <SettingsOutline width="24" />
            </button>
            <button class="lum-btn lum-pad-equal-md" aria-label="Formatting" onClick$={() => {
              document.getElementById('colors')!.classList.replace('flex', 'hidden');
              document.getElementById('inputs')!.classList.replace('flex', 'hidden');
              document.getElementById('formatting')!.classList.replace('hidden', 'flex');
            }}>
              <Text width="24" class="fill-white" />
            </button>
          </div>
        </div>

        <div class="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div class="hidden sm:flex flex-col gap-2 relative" id="colors">
            <h1 class="hidden sm:flex text-lg md:text-xl xl:text-2xl font-semibold text-gray-50 gap-2 items-center justify-center">
              <ColorFillOutline width="30" />
              {t('color.colors@@Colors')}
            </h1>
            <NumberInput id="length" input disabled value={animtabstore.length * store.text.length} min={store.text.length} class={{ 'w-full !opacity-100': true }}
              onIncrement$={() => {
                animtabstore.length++;
              }}
              onDecrement$={() => {
                animtabstore.length--;
              }}
            >
              {t('animtab.length@@Gradient Length')}
            </NumberInput>
            <NumberInput input disabled min={1} max={store.text.length / store.colors.length} value={store.colorlength} id="colorlength" class={{ 'w-full !opacity-100': true }}
              onIncrement$={() => {
                store.colorlength++;
              }}
              onDecrement$={() => {
                store.colorlength--;
              }}
            >
              {t('color.colorLength@@Characters per color')}
            </NumberInput>
            <NumberInput input min={2} max={store.text.length} value={store.colors.length} id="colorsinput" class={{ 'w-full': true }}
              onChange$={(e, el) => {
                let colorAmount = Number(el.value);
                if (colorAmount < 2) return;
                if (colorAmount > store.text.length) return colorAmount = store.text.length;
                const newColors = [];
                for (let i = 0; i < colorAmount; i++) {
                  if (store.colors[i]) newColors.push(store.colors[i]);
                  else newColors.push({ hex: getRandomColor(), pos: 100 });
                }
                store.colors = newColors;
              }}
              onIncrement$={() => {
                const newColors = [...store.colors, {
                  hex: getRandomColor(),
                }];
                store.colors = newColors.map((color, i) => ({
                  hex: color.hex,
                  pos: (100 / (newColors.length - 1)) * i,
                }));
              }}
              onDecrement$={() => {
                const newColors = store.colors.slice(0);
                newColors.pop();
                store.colors = newColors.map((color, i) => ({
                  hex: color.hex,
                  pos: (100 / (newColors.length - 1)) * i,
                }));
              }}
            >
              {t('color.colorAmount@@Color Amount')}
            </NumberInput>
            <div class="flex gap-2">
              <button class="lum-btn lum-pad-equal-xs" onClick$={() => {
                const newColors = store.colors.map(color => ({ hex: getRandomColor(), pos: color.pos }));
                store.colors = newColors;
              }}>
                <DiceOutline width={24} />
              </button>
              <button class="lum-btn lum-pad-xs w-full" disabled={store.colors.find((color, i) => color.pos != (100 / (store.colors.length - 1)) * i) ? false : true} onClick$={() => {
                const newColors = store.colors.slice(0).map((color, i) => ({ hex: color.hex, pos: (100 / (store.colors.length - 1)) * i }));
                store.colors = newColors;
              }}>
                <BarChartOutline width={24} /> Disperse
              </button>
            </div>
            <div class="flex flex-col gap-2">
              {store.colors.map((color, i) => <div key={`${i}/${store.colors.length}`} class="flex relative gap-2">
                <div class="flex flex-col rounded-md">
                  <button class="lum-btn lum-pad-equal-xs border-b-transparent rounded-b-none" onClick$={() => handleSwap(i, i - 1)}>
                    <ChevronUp width={24} />
                  </button>
                  <button class="lum-btn lum-pad-equal-xs border-t-transparent rounded-t-none" onClick$={() => handleSwap(i, i + 1)}>
                    <ChevronDown width={24} />
                  </button>
                </div>
                <div class="flex flex-col justify-end gap-1">
                  <label for={`colorlist-color-${i + 1}`}>{t('color.color@@Color')} {i + 1}</label>
                  <input key={`colorlist-color-${i + 1}-${color.hex}`} id={`colorlist-color-${i + 1}`}
                    class={{
                      'text-gray-400 hover:text-gray-400': getBrightness(convertToRGB(color.hex)) < 126,
                      'text-gray-700 hover:text-gray-700': getBrightness(convertToRGB(color.hex)) > 126,
                      'lum-input w-full lum-pad-xs hover:': true,
                    }}
                    style={`background: ${color.hex};`}
                    value={color.hex}
                    onInput$={(e, el) => {
                      const picker = document.getElementById(`colorlist-color-${i + 1}-picker`)!;
                      picker.dataset.value = el.value;
                      picker.dispatchEvent(new Event('input'));
                    }}
                    onMouseUp$={() => {
                      const picker = document.getElementById(`colorlist-color-${i + 1}-picker`)!;
                      picker.dataset.value = color.hex;
                      picker.dispatchEvent(new Event('input'));
                      if (tmpstore.opened.id == i && tmpstore.opened.type == 1) return tmpstore.opened.id = -1;
                      else tmpstore.opened = { id: i, type: 1 };
                      const abortController = new AbortController();
                      document.addEventListener('click', (e) => {
                        if (e.target instanceof HTMLElement && !e.target.closest(`#colorlist-color-${i + 1}`) && !e.target.closest(`#colorlist-color-${i + 1}-popup`)) {
                          tmpstore.opened.id = -1;
                          abortController.abort();
                        }
                      }, { signal: abortController.signal });
                    }}
                  />
                </div>
                <div class="flex flex-col justify-end">
                  <button class="lum-btn lum-pad-equal-sm lum-bg-red-700 hover:lum-bg-red-600" disabled={store.colors.length <= 2} onClick$={() => {
                    const newColors = store.colors.slice(0);
                    newColors.splice(i, 1);
                    store.colors = newColors;
                  }}>
                    <TrashOutline width="20" />
                  </button>
                </div>
                <div
                  id={`colorlist-color-${i + 1}-popup`} stoppropagation:mousedown class={{
                    'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2 left-0': true,
                    'opacity-0 scale-95 pointer-events-none': tmpstore.opened.id != i || tmpstore.opened.type != 1,
                  }}>
                  <ColorPicker
                    id={`colorlist-color-${i + 1}-picker`}
                    value={color.hex}
                    onInput$={newColor => {
                      const newColors = store.colors.slice(0);
                      newColors[i].hex = newColor;
                      store.colors = sortColors(newColors);
                    }}
                    showInput={false}
                  />
                </div>
              </div>,
              )}
            </div>
          </div>

          <div class="flex flex-col gap-2 md:col-span-2" id="inputs">
            <h1 class="hidden sm:flex text-lg md:text-xl xl:text-2xl font-semibold text-gray-50 gap-3 items-center justify-center">
              <SettingsOutline width="30" />
              {t('color.inputs@@Inputs')}
            </h1>

            <div class="flex flex-col gap-1">
              <label for="input">
                {t('color.inputText@@Input Text')}
              </label>
              <input class="lum-input" id="input" value={store.text} placeholder="birdflop" onInput$={(e, el) => { store.text = el.value; }}/>
            </div>

            <div class="flex flex-col md:grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-1">
                <label for="nameinput">
                  {t('animtab.animationName@@Animation Name')}
                </label>
                <input class="lum-input" id="nameinput" value={animtabstore.name} placeholder={'name'} onInput$={(e, el) => { animtabstore.name = el.value; }}/>
              </div>
              <NumberInput id="speed" input value={animtabstore.speed} class={{ 'w-full': true }} step={50} min={50}
                onInput$={(event, el) => {
                  animtabstore.speed = Number(el.value);
                }}
                onIncrement$={() => {
                  animtabstore.speed = Number(animtabstore.speed) + 50;
                }}
                onDecrement$={() => {
                  animtabstore.speed = Number(animtabstore.speed) - 50;
                }}>
                {t('animtab.speed@@Speed')}
              </NumberInput>
              <Dropdown id="type" class={{ 'w-full': true }} onChange$={(e, el) => { animtabstore.type = Number(el.value); }}
                values={types}
                value={animtabstore.type}>
                {t('animtab.outputType@@Output Type')}
              </Dropdown>
              <div class="flex flex-col gap-1">
                <label for="prefixsuffix">
                  {t('color.prefixsuffix@@Prefix/Suffix')}
                </label>
                <input class="lum-input" id="prefixsuffix" value={store.prefixsuffix} placeholder={'/nick $t'} onInput$={(e, el) => { store.prefixsuffix = el.value; }}/>
              </div>
            </div>
            {
              store.customFormat && <>
                <Dropdown id="format" value={store.customFormat ? 'custom' : JSON.stringify(store.format)} class={{ 'w-full': true }} onChange$={
                  (e, el) => {
                    if (el.value == 'custom') {
                      store.customFormat = true;
                    }
                    else {
                      store.customFormat = false;
                      store.format = JSON.parse(el.value);
                    }
                  }
                } values={[
                  ...v3formats.map(format => ({
                    name: format.color
                      .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                      .replace('$f', `${store.bold ? store.format.char + 'l' : ''}${store.italic ? store.format.char + 'o' : ''}${store.underline ? store.format.char + 'n' : ''}${store.strikethrough ? store.format.char + 'm' : ''}`)
                      .replace('$c', ''),
                    value: JSON.stringify(format),
                  })),
                  {
                    name: store.customFormat ? store.format.color
                      .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                      .replace('$f', `${store.bold ? store.format.char + 'l' : ''}${store.italic ? store.format.char + 'o' : ''}${store.underline ? store.format.char + 'n' : ''}${store.strikethrough ? store.format.char + 'm' : ''}`)
                      .replace('$c', '')
                      : t('color.custom@@Custom'),
                    value: 'custom',
                  },
                ]}>
                  {t('color.colorFormat@@Color Format')}
                </Dropdown>
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex flex-col gap-1">
                    <label for="customformat">
                      {t('color.customFormat@@Custom Format')}
                    </label>
                    <input class="lum-input" id="customformat" value={store.format.color} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(e, el) => { store.format.color = el.value; }}/>
                    <div class="py-3 font-mono">
                      <p>{t('color.placeholders@@Placeholders:')}</p>
                      <p>$1 = <strong class="text-red-400">R</strong>RGGBB</p>
                      <p>$2 = R<strong class="text-red-400">R</strong>GGBB</p>
                      <p>$3 = RR<strong class="text-green-400">G</strong>GBB</p>
                      <p>$4 = RRG<strong class="text-green-400">G</strong>BB</p>
                      <p>$5 = RRGG<strong class="text-blue-400">B</strong>B</p>
                      <p>$6 = RRGGB<strong class="text-blue-400">B</strong></p>
                      {store.format.char && <p>$f = {t('color.formatting@@Formatting')}</p>}
                      <p>$c = {t('color.character@@Character')}</p>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    {(store.format.char != undefined && !store.format.bold && !store.format.italic && !store.format.underline && !store.format.strikethrough) && <div class="flex flex-col gap-1">
                      <label for="format-char">
                        {t('color.format.character@@Format Character')}
                      </label>
                      <input class="lum-input" id="format-char" value={store.format.char} placeholder="&" onInput$={(e, el) => { store.format.char = el.value; }}/>
                    </div>}
                    {!store.format.char &&
                      <>
                        <label for="format-bold">
                          {t('color.format.bold@@Bold')}
                        </label>
                        <input class="lum-input" id="format-bold" value={store.format.bold} placeholder="<bold>$t</bold>" onInput$={(e, el) => { store.format.bold = el.value; }}/>
                        <label for="format-italic">
                          {t('color.format.italic@@Italic')}
                        </label>
                        <input class="lum-input" id="format-italic" value={store.format.italic} placeholder="<italic>$t</italic>" onInput$={(e, el) => { store.format.italic = el.value; }}/>
                        <label for="format-underline">
                          {t('color.format.underline@@Underline')}
                        </label>
                        <input class="lum-input" id="format-underline" value={store.format.underline} placeholder="<underline>$t</underline>" onInput$={(e, el) => { store.format.underline = el.value; }}/>
                        <label for="format-strikethrough">
                          {t('color.format.strikethrough@@Strikethrough')}
                        </label>
                        <input class="lum-input" id="format-strikethrough" value={store.format.strikethrough} placeholder="<strikethrough>$t</strikethrough>" onInput$={(e, el) => { store.format.strikethrough = el.value; }}/>
                        <div class="py-3 font-mono">
                          <p>{t('color.placeholders@@Placeholders:')}</p>
                          <p>$t = Output Text</p>
                        </div>
                      </>
                    }
                  </div>
                </div>
              </>
            }
            <div class="flex flex-col gap-2 mt-4">
              <h1 class="hidden sm:flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center justify-center">
                <SaveOutline width="26" />
                {t('color.presets@@Presets')}
              </h1>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-2">
                  <Dropdown id="saved-presets" class={{ 'w-full': true }} onChange$={
                    (event, el) => {
                      let json: Partial<typeof defaults> = {};
                      try {
                        const preset = loadPreset(el.value);
                        navigator.clipboard.writeText(JSON.stringify(preset));
                        json = {
                          ...preset,
                        };
                      } catch (err) {
                        const alert = {
                          class: 'text-red-500',
                          text: 'color.invalidPreset@@INVALID PRESET! Please report this to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a> with the preset you tried to import.',
                        };
                        const errtext = {
                          class: 'text-red-300',
                          text: `${err}`,
                        };
                        tmpstore.alerts.push(alert, errtext);
                        return setTimeout(() => {
                          tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                          tmpstore.alerts.splice(tmpstore.alerts.indexOf(errtext), 1);
                        }, 5000);
                      }
                      (Object.keys(store) as Array<keyof typeof store>).forEach(key => {
                        if (store[key] === undefined) return;
                        (store as any)[key] = json[key] ?? defaults[key];
                      });
                      const alert = {
                        class: 'text-green-500',
                        text: 'color.importedPreset@@Successfully imported preset!',
                      };
                      tmpstore.alerts.push(alert);
                      setTimeout(() => {
                        tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                      }, 2000);
                    }
                  } values={
                    cookies.presets.map((preset) => ({
                      name: <span class={{
                        'break-all font-mc tracking-tight': true,
                      }}>
                        {(() => {
                          const colors = sortColors(preset.colors ?? presetlist[0].colors).map((color) => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
                          if (colors.length < 2) return preset.name;

                          const gradient = new Gradient(colors, Math.ceil((preset.name ?? 'Untitled').length));

                          let hex = '';
                          const segments = [...(preset.name ?? 'Untitled').matchAll(new RegExp('.{1,1}', 'g'))];
                          return segments.map((segment, i) => {
                            hex = convertToHex(gradient.next());
                            return (
                              <span key={`segment-${i}`} style={`color: #${hex};`}>
                                {segment[0].replace(/ /g, '\u00A0')}
                              </span>
                            );
                          });
                        })()}
                      </span>,
                      value: JSON.stringify(preset),
                    }))
                  } display={<span class="flex gap-3 flex-1">
                    <DownloadOutline width="20" /> Load saved preset
                  </span>}>
                    {t('color.savedPresets@@Saved Presets')}
                  </Dropdown>
                  <div class="grid grid-cols-2 gap-2">
                    <a class="lum-btn" href="/resources/rgb/presets">
                      <GlobeOutline width="20" /> Browse
                    </a>
                    <button class="lum-btn" id="save" onClick$={() => {
                      const preset: Partial<typeof defaults> = { ...store };
                      (Object.keys(preset) as Array<keyof typeof defaults>).forEach(key => {
                        if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete preset[key];
                      });
                      navigator.clipboard.writeText(JSON.stringify(preset));
                      const alert = {
                        class: 'text-green-500',
                        text: 'color.exportedPreset@@Successfully exported preset to clipboard!',
                      };
                      tmpstore.alerts.push(alert);
                      setTimeout(() => {
                        tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                      }, 2000);
                    }}>
                      <SaveOutline width="20" /> {t('color.save@@Save')}
                    </button>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col gap-1">
                    <label for="import">
                      {t('color.import@@Import')}
                    </label>
                    <input class="lum-input" id="import" name="import" placeholder={t('color.import@@Import (Paste here)')} onInput$={async (e, el) => {
                      let json: Partial<typeof defaults> = {};
                      try {
                        const preset = loadPreset(el.value);
                        el.value = JSON.stringify(preset);
                        navigator.clipboard.writeText(JSON.stringify(preset));
                        json = {
                          ...preset,
                        };
                      } catch (err) {
                        const alert = {
                          class: 'text-red-500',
                          text: 'color.invalidPreset@@INVALID PRESET! Please report this to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a> with the preset you tried to import.',
                        };
                        const errtext = {
                          class: 'text-red-300',
                          text: `${err}`,
                        };
                        tmpstore.alerts.push(alert, errtext);
                        return setTimeout(() => {
                          tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                          tmpstore.alerts.splice(tmpstore.alerts.indexOf(errtext), 1);
                        }, 5000);
                      }
                      (Object.keys(store) as Array<keyof typeof store>).forEach(key => {
                        if (store[key] === undefined) return;
                        (store as any)[key] = json[key] ?? defaults[key];
                      });
                      const alert = {
                        class: 'text-green-500',
                        text: 'color.importedPreset@@Successfully imported preset!',
                      };
                      tmpstore.alerts.push(alert);
                      setTimeout(() => {
                        tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                      }, 2000);
                    }}/>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <button class="lum-btn lum-pad-sm" id="export" onClick$={() => {
                      const preset: Partial<typeof defaults> = { ...store };
                      (Object.keys(preset) as Array<keyof typeof defaults>).forEach(key => {
                        if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete preset[key];
                      });
                      navigator.clipboard.writeText(JSON.stringify(preset));
                      const alert = {
                        class: 'text-green-500',
                        text: 'color.exportedPreset@@Successfully exported preset to clipboard!',
                      };
                      tmpstore.alerts.push(alert);
                      setTimeout(() => {
                        tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                      }, 2000);
                    }}>
                      <ShareOutline width={24} /> {t('color.export@@Export')}
                    </button>
                    <button class="lum-btn lum-pad-sm" id="createurl" onClick$={() => {
                      const base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                      const url = new URL(base_url);
                      const params: Partial<typeof defaults> = { ...store };
                      (Object.entries(params) as Array<[keyof typeof defaults, any]>).forEach(([key, value]) => {
                        if (key == 'format' || key == 'colors') {
                          value = JSON.stringify(value);
                          if (value === JSON.stringify(defaults[key as keyof typeof defaults])) return;
                        }
                        if (value === defaults[key as keyof typeof defaults]) return;
                        url.searchParams.set(key, String(value));
                      });
                      window.history.pushState({}, '', url.href);
                      const alert = {
                        class: 'text-green-500',
                        text: 'color.exportedPresetUrl@@Successfully exported preset to url!',
                      };
                      tmpstore.alerts.push(alert);
                      setTimeout(() => {
                        tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                      }, 2000);
                    }}>
                      <LinkOutline width={24} /> {t('color.url@@Get URL')}
                    </button>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-4 gap-2">
              </div>
              {tmpstore.alerts.map((alert, i) => (
                <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(alert.text)} />
              ))}
            </div>
          </div>

          <div class="flex flex-col gap-2" id="formatting">
            <h1 class="hidden sm:flex text-lg md:text-xl xl:text-2xl font-semibold fill-current text-gray-50 gap-3 items-center justify-center mb-7">
              <Text width="30" />
              {t('color.colors@@Formatting')}
            </h1>
            <Toggle id="bold" checked={store.bold}
              onChange$={(e, el) => { store.bold = el.checked; }}
              label={`${t('color.bold@@Bold')} - ${store.format.char ? `${store.format.char}l` : store.format.bold?.replace('$t', '')}`} />
            <Toggle id="italic" checked={store.italic}
              onChange$={(e, el) => { store.italic = el.checked; }}
              label={`${t('color.italic@@Italic')} - ${store.format.char ? `${store.format.char}o` : store.format.italic?.replace('$t', '')}`} />
            <Toggle id="underline" checked={store.underline}
              onChange$={(e, el) => { store.underline = el.checked; }}
              label={`${t('color.underline@@Underline')} - ${store.format.char ? `${store.format.char}n` : store.format.underline?.replace('$t', '')}`} />
            <Toggle id="strikethrough" checked={store.strikethrough}
              onChange$={(e, el) => { store.strikethrough = el.checked; }}
              label={`${t('color.strikethrough@@Strikethrough')} - ${store.format.char ? `${store.format.char}m` : store.format.strikethrough?.replace('$t', '')}`} />

            <Toggle id="trimspaces" checked={store.trimspaces}
              onChange$={(e, el) => { store.trimspaces = el.checked; }}
              label={<p class="flex flex-col"><span>Trim colors from spaces</span><span class="text-xs text-gray-400">Turn this off if you're using empty underlines / strikethroughs</span></p>} />
            <Toggle id="advanced" checked={store.customFormat}
              onChange$={(e, el) => { store.customFormat = el.checked; }}
              label={<p class="flex flex-col"><span>Show advanced settings</span><span class="text-xs text-gray-400">These settings are hidden, only use them if you're trying to use this tool for a different plugin or know what you're doing.</span></p>} />

            {store.customFormat && <div class="flex flex-col gap-1">
              <label for="formatinput">
                {t('animtab.outputFormat@@Output Format')}
              </label>
              <textarea class="lum-input h-32" id="formatinput" value={animtabstore.outputFormat} placeholder="birdflop" onInput$={(e, el) => { animtabstore.outputFormat = el.value; }}/>
            </div>}
          </div>
        </div>
        <div class="text-sm mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB gradient creator that generates hex formatted text. RGB Birdflop is a public resource developed by Birdflop, a 501(c)(3) nonprofit providing affordable and accessible hosting and public resources. If you would like to support our mission, please <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">click here</a> to make a charitable donation, 100% tax-deductible in the US.
        </div>
      </div>
      <script
        async
        type='text/javascript'
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947"
        crossOrigin='anonymous' />
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Animated TAB',
  meta: [
    {
      name: 'description',
      content: 'TAB plugin gradient animation creator',
    },
    {
      name: 'og:description',
      content: 'TAB plugin gradient animation creator',
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
