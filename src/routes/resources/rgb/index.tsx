import { component$, useStore, useTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { Gradient } from '~/components/util/HexUtils';
import { defaults, loadPreset, presets, v3formats } from '~/components/util/PresetUtils';
import { convertToHex, convertToRGB, generateOutput, getBrightness, getRandomColor } from '~/components/util/RGBUtils';

import { Add, SettingsOutline, Text, TrashOutline } from 'qwik-ionicons';

import { Button, ColorPicker, Header, Dropdown, TextArea, TextInput, Toggle, NumberInputRaw } from '@luminescent/ui';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies, sortColors } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';

export const rgbDefaults = {
  version: defaults.version,
  colors: defaults.colors,
  text: defaults.text,
  format: defaults.format,
  customFormat: defaults.customFormat,
  prefixsuffix: defaults.prefixsuffix,
  trimspaces: defaults.trimspaces,
  bold: defaults.bold,
  italic: defaults.italic,
  underline: defaults.underline,
  strikethrough: defaults.strikethrough,
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  return await getCookies(cookie, Object.keys(rgbDefaults), url.searchParams);
});

export default component$(() => {
  useSpeak({ assets: ['gradient', 'color'] });
  const t = inlineTranslate();

  const cookies = useCookies().value;
  const store = useStore({
    ...rgbDefaults,
    ...cookies,
    opened: -1,
    alerts: [] as {
      class: string,
      text: string,
    }[],
  }, { deep: true });

  useTask$(({ track }) => {
    isBrowser && setCookies(store);
    Object.keys(store).forEach((key: any) => {
      if (key == 'frames' || key == 'frame' || key == 'alerts') return;
      else track(() => store[key as keyof typeof store]);
    });
    if (JSON.stringify(store.colors) != JSON.stringify(sortColors(store.colors))) store.colors = sortColors(store.colors);
  });

  return (
    <section class="flex mx-auto max-w-5xl px-6 justify-center min-h-svh pt-[72px] scale-for-mac">
      <div class="my-10 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('gradient.title@@RGBirdflop')}
        </h1>
        <h2 class="text-gray-50 text-base sm:text-xl">
          {t('gradient.subtitle@@Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}<br />
        </h2>
        <h3 class="text-gray-400 text-sm sm:text-lg mb-6">
          Wanna automate generating gradients or use this in your own project? We have <a class="text-blue-400 hover:underline" href="/api/v2/docs">an API!</a>
        </h3>

        <TextArea output id="output" class={{ 'font-mc': true }} value={generateOutput(store.text, sortColors(store.colors), store.format, store.prefixsuffix, store.trimspaces, store.bold, store.italic, store.underline, store.strikethrough)}>
          <Header subheader={t('color.outputSubtitle@@Copy-paste this for RGB text!')}>
            {t('color.output@@Output')}
          </Header>
        </TextArea>

        <h1 class={{
          'text-4xl sm:text-6xl my-6 break-all max-w-7xl -space-x-[1px] font-mc': true,
          'font-mc-bold': store.bold,
          'font-mc-italic': store.italic,
          'font-mc-bold-italic': store.bold && store.italic,
        }}>
          {(() => {
            const text = store.text ? store.text : 'birdflop';

            const colors = sortColors(store.colors).map((color) => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
            if (colors.length < 2) return text;

            const gradient = new Gradient(colors, text.length);

            let hex = '';
            return text.split('').map((char: string, i: number) => {
              if (store.trimspaces && char == ' ') gradient.next();
              else hex = convertToHex(gradient.next());
              return (
                <span key={`char${i}`} style={`color: #${hex};`} class={{
                  'underline': store.underline,
                  'strikethrough': store.strikethrough,
                  'underline-strikethrough': store.underline && store.strikethrough,
                }}>
                  {char == ' ' ? '\u00A0' : char}
                </span>
              );
            });
          })()}
        </h1>

        <div class="flex gap-2 my-4 items-center">
          <div class="w-full h-3 rounded-full items-center relative" id="colormap"
            style={`background: linear-gradient(to right, ${sortColors(store.colors).map(color => `${color.hex} ${color.pos}%`).join(', ')});`}
            onMouseDown$={(e, el) => {
              if (e.target != el) return;
              const rect = el.getBoundingClientRect();
              const pos = Math.round((e.clientX - rect.left) / rect.width * store.text.length) / store.text.length * 100;
              if (store.colors.find(c => c.pos == pos)) return;
              const newColors = [...store.colors];
              newColors.push({ hex: getRandomColor(), pos });
              store.colors = newColors;
            }}
            onMouseEnter$={(e, el) => {
              const abortController = new AbortController();
              el.addEventListener('mousemove', e => {
                const addbutton = document.getElementById('add-button')!;
                if (e.target != el) {
                  addbutton.classList.add('opacity-0');
                  return;
                }
                const pos = Math.round((e.clientX - el.getBoundingClientRect().left) / el.getBoundingClientRect().width * store.text.length) / store.text.length * 100;
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
              'absolute -mt-1 -ml-3 transition-opacity w-5 h-5 rounded-full shadow-md border border-gray-700 bg-gray-800 opacity-0 pointer-events-none': true,
            }}>
              <Add width="19" />
            </div>
            {store.colors.map((color, i) => <div class="absolute -mt-1 -ml-3" key={i}
              onMouseDown$={() => {
                const abortController = new AbortController();
                const colormap = document.getElementById('colormap')!;
                const rect = colormap.getBoundingClientRect();
                document.addEventListener('mousemove', e => {
                  let pos = Math.round((((e.clientX - rect.left) / rect.width) * store.text.length)) / store.text.length * 100;
                  if (pos < 0) pos = 0;
                  if (pos > 100) pos = 100;
                  if (store.colors.find(c => c.pos == pos)) return;
                  color.pos = pos;
                }, { signal: abortController.signal });
                document.addEventListener('mouseup', () => {
                  abortController.abort();
                }, { signal: abortController.signal });
              }} style={{
                left: `${color.pos}%`,
              }}
            >
              <button key={`color${i + 1}`} id={`color${i + 1}`}
                class={{
                  'transition-transform w-5 h-5 hover:scale-125 rounded-full shadow-md border': true,
                  'border-white': getBrightness(convertToRGB(color.hex)) < 126,
                  'border-black': getBrightness(convertToRGB(color.hex)) > 126,
                }}
                style={`background: ${color.hex};`}
                onClick$={() => {
                  const abortController = new AbortController();
                  document.addEventListener('click', (e) => {
                    if (e.target instanceof HTMLElement && !e.target.closest(`#color${i + 1}`) && !e.target.closest(`#color${i + 1}-popup`)) {
                      if (store.opened == i) store.opened = -1;
                      abortController.abort();
                    }
                  }, { signal: abortController.signal });
                  store.opened = i;
                }}
              />
              <div id={`color${i + 1}-popup`} onMouseDown$={(e) => e.stopPropagation()}>
                <div class={{
                  'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2': true,
                  'opacity-0 scale-95 pointer-events-none': store.opened != i,
                  'left-0 items-start': color.pos < 50,
                  'right-0 items-end': color.pos >= 50,
                }}>
                  <div class="flex gap-2">
                    {store.colors.length > 2 &&
                      <Button class={{ 'backdrop-blur-md': true }} square size='sm' color="red" onClick$={() => {
                        const newColors = [...store.colors];
                        newColors.splice(i, 1);
                        store.colors = newColors;
                      }}>
                        <TrashOutline width="20" />
                      </Button>
                    }
                    <div class="flex w-48">
                      <NumberInputRaw class={{ 'w-full': true }} input id={`color${i + 1}-pos`} value={Number(color.pos.toFixed(2))} min={0} max={100}
                        onInput$={(e, el) => {
                          const newColors = [...store.colors];
                          newColors[i].pos = Number(el.value);
                          store.colors = newColors;
                        }}
                        onDecrement$={() => {
                          const newColors = [...store.colors];
                          newColors[i].pos -= 1;
                          store.colors = newColors;
                        }}
                        onIncrement$={() => {
                          const newColors = [...store.colors];
                          newColors[i].pos += 1;
                          store.colors = newColors;
                        }}
                      />
                    </div>
                  </div>
                  <ColorPicker
                    id={`color${i + 1}`}
                    value={color.hex}
                    onInput$={newColor => {
                      const newColors = [...store.colors];
                      newColors[i].hex = newColor;
                      store.colors = newColors;
                    }}
                    horizontal
                  />
                </div>
              </div>
            </div>,
            )}
          </div>
        </div>

        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-3 md:col-span-2" id="inputs">
            <h1 class="hidden sm:flex text-2xl font-bold text-gray-50 gap-4 items-center justify-center">
              <SettingsOutline width="32" />
              {t('color.inputs@@Inputs')}
            </h1>

            <div class="flex flex-col md:grid grid-cols-2 gap-2">
              <TextInput id="input" value={store.text} placeholder="birdflop" onInput$={(event: any) => { store.text = event.target!.value; }}>
                {t('color.inputText@@Input Text')}
              </TextInput>
              <Dropdown id="format" value={store.customFormat ? 'custom' : JSON.stringify(store.format)} class={{ 'w-full': true }} onChange$={
                (event: any) => {
                  if (event.target!.value == 'custom') {
                    store.customFormat = true;
                  }
                  else {
                    store.customFormat = false;
                    store.format = JSON.parse(event.target!.value);
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
            </div>

            {
              store.customFormat && <>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <TextInput id="customformat" value={store.format.color} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(event: any) => { store.format.color = event.target!.value; }}>
                      {t('color.customFormat@@Custom Format')}
                    </TextInput>
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
                    {(store.format.char != undefined && !store.format.bold && !store.format.italic && !store.format.underline && !store.format.strikethrough) &&
                        <TextInput id="format-char" value={store.format.char} placeholder="&" onInput$={(event: any) => { store.format.char = event.target!.value; }}>
                          {t('color.format.character@@Format Character')}
                        </TextInput>
                    }
                    {!store.format.char &&
                        <>
                          <TextInput id="format-bold" value={store.format.bold} placeholder="<bold>$t</bold>" onInput$={(event: any) => { store.format.bold = event.target!.value; }}>
                            Bold
                          </TextInput>
                          <TextInput id="format-italic" value={store.format.italic} placeholder="<italic>$t</italic>" onInput$={(event: any) => { store.format.italic = event.target!.value; }}>
                            Italic
                          </TextInput>
                          <TextInput id="format-underline" value={store.format.underline} placeholder="<underline>$t</underline>" onInput$={(event: any) => { store.format.underline = event.target!.value; }}>
                            Underline
                          </TextInput>
                          <TextInput id="format-strikethrough" value={store.format.strikethrough} placeholder="<strikethrough>$t</strikethrough>" onInput$={(event: any) => { store.format.strikethrough = event.target!.value; }}>
                            Strikethrough
                          </TextInput>
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

            <div class="grid md:grid-cols-3 gap-2">
              <div class="flex flex-col gap-2">
                <TextInput id="import" name="import" placeholder={t('color.import@@Import (Paste here)')} onInput$={async (event: any) => {
                  let json: any;
                  try {
                    const preset = await loadPreset(event.target!.value);
                      event.target!.value = JSON.stringify(preset);
                      navigator.clipboard.writeText(JSON.stringify(preset));
                      json = { ...rgbDefaults, ...preset };
                  } catch (error) {
                    const alert = {
                      class: 'text-red-500',
                      text: 'color.invalidPreset@@INVALID PRESET! Please report this to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a> with the preset you tried to import.',
                    };
                    store.alerts.push(alert);
                    return setTimeout(() => {
                      store.alerts.splice(store.alerts.indexOf(alert), 1);
                    }, 5000);
                  }
                  Object.keys(json).forEach(key => {
                    if ((store as any)[key] === undefined) return;
                    (store as any)[key] = json[key];
                  });
                  const alert = {
                    class: 'text-green-500',
                    text: 'color.importedPreset@@Successfully imported preset!',
                  };
                  store.alerts.push(alert);
                  setTimeout(() => {
                    store.alerts.splice(store.alerts.indexOf(alert), 1);
                  }, 2000);
                }}>
                  {t('color.presets@@Presets')}
                </TextInput>
                <div class="flex gap-2">
                  <Button id="export" size="sm" onClick$={() => {
                    const preset: any = { ...store };
                    delete preset.alerts;
                    Object.keys(preset).forEach(key => {
                      if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(rgbDefaults[key as keyof typeof rgbDefaults])) delete preset[key];
                    });
                    navigator.clipboard.writeText(JSON.stringify(preset));
                    const alert = {
                      class: 'text-green-500',
                      text: 'color.exportedPreset@@Successfully exported preset to clipboard!',
                    };
                    store.alerts.push(alert);
                    setTimeout(() => {
                      store.alerts.splice(store.alerts.indexOf(alert), 1);
                    }, 2000);
                  }}>
                    {t('color.export@@Export')}
                  </Button>
                  <Button id="createurl" size="sm" onClick$={() => {
                    const base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                    const url = new URL(base_url);
                    const params: any = { ...store };
                    delete params.alerts;
                    Object.entries(params).forEach(([key, value]: any) => {
                      if (key == 'colors') {
                        value = value.join(',');
                        if (value === rgbDefaults.colors.join(',')) return;
                      }
                      if (key == 'format') {
                        value = JSON.stringify(value);
                        if (value === JSON.stringify(rgbDefaults[key as keyof typeof rgbDefaults])) return;
                      }
                      else if (value === rgbDefaults[key as keyof typeof rgbDefaults]) return;
                      url.searchParams.set(key, String(value));
                    });
                    window.history.pushState({}, '', url.href);
                    const alert = {
                      class: 'text-green-500',
                      text: 'color.exportedPresetUrl@@Successfully exported preset to url!',
                    };
                    store.alerts.push(alert);
                    setTimeout(() => {
                      store.alerts.splice(store.alerts.indexOf(alert), 1);
                    }, 2000);
                  }}>
                    {t('color.url@@Export As URL')}
                  </Button>
                </div>
              </div>
              <Dropdown id="color-preset" class={{ 'w-full': true }} onChange$={
                (event: any) => {
                  if (event.target!.value == 'custom') return;
                  store.colors = presets[event.target!.value as keyof typeof presets];
                }
              } values={[
                ...Object.keys(presets).map(preset => ({ name: preset, value: preset })),
                { name: t('color.custom@@Custom'), value: 'custom' },
              ]} value={Object.keys(presets).find((preset: any) => presets[preset as keyof typeof presets].toString() == store.colors.toString()) ?? 'custom'}>
                {t('color.colorPreset@@Color Preset')}
              </Dropdown>
              <TextInput id="prefixsuffix" value={store.prefixsuffix} placeholder={'/nick $t'} onInput$={(event: any) => { store.prefixsuffix = event.target!.value; }}>
                  Prefix/Suffix
              </TextInput>
            </div>
            <Toggle id="trimspaces" checked={store.trimspaces}
              onChange$={(event: any) => { store.trimspaces = event.target!.checked; }}
              label={<p class="flex flex-col"><span>Trim color codes from spaces</span><span class="text-sm">Turn this off if you're using empty underlines / strikethroughs</span></p>} />
            {store.alerts.map((alert: any, i: number) => (
              <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(alert.text)} />
            ))}
          </div>
          <div class="mb-4 flex flex-col gap-3" id="formatting">
            <h1 class="hidden sm:flex text-2xl font-bold fill-current text-gray-50 gap-4 items-center justify-center">
              <Text width="32" />
              {t('color.colors@@Formatting')}
            </h1>
            <Toggle id="bold" checked={store.bold}
              onChange$={(event: any) => { store.bold = event.target!.checked; }}
              label={`${t('color.bold@@Bold')} - ${store.format.char ? `${store.format.char}l` : store.format.bold?.replace('$t', '')}`} />
            <Toggle id="italic" checked={store.italic}
              onChange$={(event: any) => { store.italic = event.target!.checked; }}
              label={`${t('color.italic@@Italic')} - ${store.format.char ? `${store.format.char}o` : store.format.italic?.replace('$t', '')}`} />
            <Toggle id="underline" checked={store.underline}
              onChange$={(event: any) => { store.underline = event.target!.checked; }}
              label={`${t('color.underline@@Underline')} - ${store.format.char ? `${store.format.char}n` : store.format.underline?.replace('$t', '')}`} />
            <Toggle id="strikethrough" checked={store.strikethrough}
              onChange$={(event: any) => { store.strikethrough = event.target!.checked; }}
              label={`${t('color.strikethrough@@Strikethrough')} - ${store.format.char ? `${store.format.char}m` : store.format.strikethrough?.replace('$t', '')}`} />
          </div>
        </div>
        <div class="text-sm mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB gradient creator that generates hex formatted text. RGB Birdflop is a public resource developed by Birdflop, a 501(c)(3) nonprofit providing affordable and accessible hosting and public resources. If you would like to support our mission, please <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">click here</a> to make a charitable donation, 100% tax-deductible in the US.
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  meta: [
    {
      name: 'description',
      content: 'Public resources developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Public resources developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};