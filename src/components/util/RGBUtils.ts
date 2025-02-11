import { AnimatedGradient, Gradient } from './HexUtils';
import { defaults } from './PresetUtils';
import { sortColors } from './SharedUtils';

export function hex(c: number) {
  const s = '0123456789ABCDEF';
  let i = c;
  if (i == 0 || isNaN(c)) { return '00'; }
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

export function convertToHex(RGBAcolor: number[]) {
  return hex(RGBAcolor[0]) + hex(RGBAcolor[1]) + hex(RGBAcolor[2]);
}

export function trim(s: string) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

export function convertToRGB(hexcolor: string) {
  const color = [];
  color[0] = parseInt((trim(hexcolor)).substring(0, 2), 16);
  color[1] = parseInt((trim(hexcolor)).substring(2, 4), 16);
  color[2] = parseInt((trim(hexcolor)).substring(4, 6), 16);
  return color;
}

export function getBrightness(RGBAcolor: number[]) {
  return Math.sqrt(
    (RGBAcolor[0] * RGBAcolor[0] * 0.299) +
    (RGBAcolor[1] * RGBAcolor[1] * 0.587) +
    (RGBAcolor[2] * RGBAcolor[2] * 0.114),
  );
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getAnimFrames(store: typeof defaults) {
  if (store.colors.length < 2) return { OutputArray: [], frames: [] };
  const colors = store.colors.map(color => ({ rgb: convertToRGB(color.hex), pos: color.pos }));

  const text = store.text ?? 'Birdflop';
  let loopAmount;
  const length = text.length * store.length / store.colorlength;
  switch (Number(store.type)) {
  default:
    loopAmount = length * 2 - 2;
    break;
  case 3:
    loopAmount = length;
    break;
  }

  const OutputArray = [];
  const frames = [];
  for (let n = 0; n < loopAmount; n++) {
    const clrs = [];
    const gradient = new AnimatedGradient(colors, length, n);
    let output = '';
    gradient.next();
    if (store.format.color == 'MiniMessage') {
      const colors = sortColors(store.colors);
      if (colors[0].pos !== 0) colors.unshift({ hex: colors[0].hex, pos: 0 });
      if (colors[colors.length - 1].pos !== 100) colors.push({ hex: colors[colors.length - 1].hex, pos: 100 });
      for (let i = 0; i < colors.length - 1; i++) {
        let currentColor = colors[i];
        let nextColor = colors[i + 1];
        if (currentColor.pos > nextColor.pos) {
          const newColor = currentColor;
          currentColor = nextColor;
          nextColor = newColor;
        }

        const numSteps = text.length;
        const lowerRange = Math.round(colors[i].pos / 100 * numSteps);
        const upperRange = Math.round(colors[i + 1].pos / 100 * numSteps);
        if (lowerRange === upperRange) continue;
        output += `<gradient:${currentColor.hex}:${nextColor.hex}>${text.substring(lowerRange, upperRange)}</gradient>`;
      }
      OutputArray.push(output);
    }
    else if (store.type == 4) {
      const hex = convertToHex(gradient.next());
      clrs.push(hex);
      let hexOutput = store.format.color;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
      let formatCodes = '';
      if (store.format.color.includes('$f')) {
        if (store.bold) formatCodes += store.format.char + 'l';
        if (store.italic) formatCodes += store.format.char + 'o';
        if (store.underline) formatCodes += store.format.char + 'n';
        if (store.strikethrough) formatCodes += store.format.char + 'm';
      }
      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', text);
      if (store.prefixsuffix) hexOutput = store.prefixsuffix.replace(/\$t/g, hexOutput);
      OutputArray.push(hexOutput);
    } else {
      const textArray = Array.from(store.text);
      const segments = [];
      let index = 0;
      while (index < textArray.length) {
        segments.push(textArray.slice(index, index + store.colorlength).join(''));
        index += store.colorlength;
      }
      for (const segment of segments) {
        if (store.trimspaces && segment.match(/^\s+$/)) {
          output += segment;
          clrs.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        clrs.push(hex);
        let hexOutput = store.format.color;
        for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
        let formatCodes = '';
        if (store.format.color.includes('$f')) {
          if (store.bold) formatCodes += store.format.char + 'l';
          if (store.italic) formatCodes += store.format.char + 'o';
          if (store.underline) formatCodes += store.format.char + 'n';
          if (store.strikethrough) formatCodes += store.format.char + 'm';
        }

        hexOutput = hexOutput.replace('$f', formatCodes);
        hexOutput = hexOutput.replace('$c', segment);
        output += hexOutput;
      }
      if (store.prefixsuffix) output = store.prefixsuffix.replace(/\$t/g, output);
      OutputArray.push(output);
    }
    frames.push(clrs);
  }

  return { OutputArray, frames };
}

export function AnimationOutput(store: typeof defaults) {
  let FinalOutput = '';

  const AnimFrames = getAnimFrames(store);
  let { OutputArray } = AnimFrames;

  const format = store.outputFormat;
  FinalOutput = format.replace('%name%', store.name);
  FinalOutput = FinalOutput.replace('%speed%', `${store.speed}`);
  if (store.type == 1) {
    OutputArray.reverse();
  }
  else if (store.type == 3) {
    const OutputArray2 = OutputArray.slice();
    OutputArray = OutputArray.reverse().concat(OutputArray2);
  }

  const outputFormat = FinalOutput.match(/%output:{(.*\$t.*)}%/);
  if (outputFormat) OutputArray = OutputArray.map(output => outputFormat[1].replace('$t', output));
  FinalOutput = FinalOutput.replace(/%output:{.*\$t.*}%/, OutputArray.join('\n'));
  return FinalOutput;
}

export function generateOutput(
  text = defaults.text,
  colors = defaults.colors,
  format = defaults.format,
  prefixsuffix?: string,
  trimspaces?: boolean,
  colorlength?: number,
  bold?: boolean,
  italic?: boolean,
  underline?: boolean,
  strikethrough?: boolean,
) {
  let output = '';

  if (format.color == 'MiniMessage') {
    colors = sortColors(colors);
    if (colors[0].pos !== 0) colors.unshift({ hex: colors[0].hex, pos: 0 });
    if (colors[colors.length - 1].pos !== 100) colors.push({ hex: colors[colors.length - 1].hex, pos: 100 });
    for (let i = 0; i < colors.length - 1; i++) {
      let currentColor = colors[i];
      let nextColor = colors[i + 1];
      if (currentColor.pos > nextColor.pos) {
        const newColor = currentColor;
        currentColor = nextColor;
        nextColor = newColor;
      }

      const numSteps = text.length;
      const lowerRange = Math.round(colors[i].pos / 100 * numSteps);
      const upperRange = Math.round(colors[i + 1].pos / 100 * numSteps);
      if (lowerRange === upperRange) continue;
      output += `<gradient:${currentColor.hex}:${nextColor.hex}>${text.substring(lowerRange, upperRange)}</gradient>`;
    }
    console.log(output, '181');
  }

  if (format.color != 'MiniMessage') {
    const newColors = sortColors(colors).map(color => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
    if (newColors.length < 2) return 'Error: Not enough colors.';

    const gradient = new Gradient(newColors, text.length / (colorlength ?? 1));

    const segments = [];
    let index = 0;

    // Break text into segments without splitting multi-byte characters like emojis
    while (index < text.length) {
      const segment = Array.from(text).slice(index, index + (colorlength ?? 1)).join('');
      segments.push([segment]);
      index += colorlength ?? 1;
    }

    for (const segment of segments) {
      // Skip formatting only pure space segments, but not segments with emojis or non-space characters
      if (trimspaces && segment[0].trim() === '') {
        output += segment[0];
        gradient.next();
        continue;
      }

      const hex = convertToHex(gradient.next());
      let hexOutput = format.color;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));

      let formatCodes = '';
      if (format.color.includes('$f')) {
        if (format.char) {
          if (bold) formatCodes += format.char + 'l';
          if (italic) formatCodes += format.char + 'o';
          if (underline) formatCodes += format.char + 'n';
          if (strikethrough) formatCodes += format.char + 'm';
        }
      }

      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', segment[0]);
      output += hexOutput;
    }
  }
  if (format.bold && bold) output = format.bold.replace('$t', output);
  if (format.italic && italic) output = format.italic.replace('$t', output);
  if (format.underline && underline) output = format.underline.replace('$t', output);
  if (format.strikethrough && strikethrough) output = format.strikethrough.replace('$t', output);
  if (prefixsuffix) output = prefixsuffix.replace(/\$t/g, output);
  return output;
}