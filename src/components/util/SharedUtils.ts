import type { Cookie } from '@builder.io/qwik-city';
import { rgbDefaults } from '~/routes/resources/rgb';
import { animTABDefaults } from '~/routes/resources/animtab';
import { defaults, loadPreset } from './PresetUtils';

type names = 'rgb' | 'animtab' | 'parsed' | 'animpreview' | 'presets';

function deepclone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function getCookies(cookie: Cookie, preset: names, urlParams?: URLSearchParams) {
  let json = deepclone(defaults);
  try {
    const cookieVal = cookie.get(preset)?.value;
    if (cookieVal) {
      json = JSON.parse(decodeURIComponent(cookieVal));  // Decode the cookie value
    } else if (preset == 'rgb' || preset == 'animtab') {
      json = preset == 'rgb' ? deepclone(rgbDefaults) : deepclone(animTABDefaults);
    } else {
      json = {};
    }
  } catch (e) {
    console.error(e);
  }

  if (urlParams) {
    const params = Object.fromEntries([...urlParams.entries()]) as any;
    Object.keys(params).forEach(key => {
      try {
        if (key == 'format' || key == 'colors') params[key] = JSON.parse(params[key]);
        else if (params[key] === 'true' || params[key] === 'false') params[key] = params[key] === 'true';
        else if (!isNaN(Number(params[key]))) params[key] = Number(params[key]);
      } catch (e) {
        console.error(e);
      }
    });
    json = { ...json, ...params };
  }

  // migrate
  let migrated = false;
  if (preset == 'rgb' || preset == 'animtab') {
    const newrgbDefaults = deepclone(rgbDefaults);
    const newanimTABDefaults = deepclone(animTABDefaults);
    const names = preset == 'rgb' ? Object.keys(newrgbDefaults) : Object.keys(newanimTABDefaults);
    if (preset == 'animtab') names.push('version');
    names.forEach(name => {
      const cookieValue = cookie.get(name)?.value;
      if (!cookieValue) return;
      console.log('Migrating', name);
      try {
        if (name == 'colors') json[name] = cookieValue.split(',');
        else if (name == 'format') json[name] = JSON.parse(cookieValue);
        else if (cookieValue === 'true' || cookieValue === 'false') json[name] = cookieValue === 'true';
        else if (!isNaN(Number(cookieValue))) json[name] = Number(cookieValue);
        else json[name] = cookieValue;
      }
      catch (e) {
        console.error(e);
      }
      console.log('Deleting', name);
      cookie.delete(name, { path: '/' });
      migrated = true;
    });
    json = loadPreset(JSON.stringify(json));
  }
  if (migrated) cookie.set(preset, JSON.stringify(json), { path: '/' });

  return json;
}

export function setCookies(name: names, json: { [key: string]: any }) {
  console.debug('cookie', name, JSON.stringify(json));

  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  if (cookie.optout === 'true') return;

  const cookieValue = { ...json };
  const test = deepclone(defaults);
  Object.keys(cookieValue).forEach(key => {
    if (key != 'version' && JSON.stringify(cookieValue[key]) === JSON.stringify(test[key as keyof typeof defaults])) delete cookieValue[key];
  });

  const existingCookie = cookie[name];
  const encodedValue = encodeURIComponent(JSON.stringify(cookieValue));
  if (existingCookie === encodedValue) return;
  console.debug('cookie processed', name, encodedValue);
  document.cookie = `${name}=${encodedValue}; path=/`;
}

export function sortColors(colors: { hex: string, pos: number }[]) {
  return [...colors].sort((a, b) => a.pos - b.pos);
}