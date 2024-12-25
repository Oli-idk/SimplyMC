export interface format {
  color: string;
  char?: string;
  bold?: string;
  italic?: string;
  underline?: string;
  strikethrough?: string;
}

export const presets = [
  {
    version: 4,
    name: 'Birdflop',
    colors: [
      { hex: '#084CFB', pos: 0 },
      { hex: '#ADF3FD', pos: 100 },
    ],
    length: 1,
  },
  {
    version: 4,
    name: 'SimplyMC',
    colors: [
      { hex: '#00FFE0', pos: 0 },
      { hex: '#EB00FF', pos: 100 },
    ],
    length: 1,
  },
  {
    version: 4,
    name: 'Rainbow',
    colors: [
      { hex: '#FF0000', pos: 0 },
      { hex: '#FF7F00', pos: 16.66 },
      { hex: '#FFFF00', pos: 33.33 },
      { hex: '#00FF00', pos: 50 },
      { hex: '#0000FF', pos: 66.66 },
      { hex: '#4B0082', pos: 83.33 },
      { hex: '#9400D3', pos: 100 },
    ],
    length: 2,
  },
  {
    version: 4,
    name: 'Skyline',
    colors: [
      { hex: '#1488CC', pos: 0 },
      { hex: '#2B32B2', pos: 100 },
    ],
    length: 2,
  },
  {
    version: 4,
    name: 'Mango',
    colors: [
      { hex: '#FFE259', pos: 0 },
      { hex: '#FFA751', pos: 100 },
    ],
    length: 1,
  },
  {
    version: 4,
    name: 'Vice City',
    colors: [
      { hex: '#3494E6', pos: 0 },
      { hex: '#EC6EAD', pos: 100 },
    ],
    length: 1,
  },
  {
    version: 4,
    name: 'Dawn',
    colors: [
      { hex: '#F3904F', pos: 0 },
      { hex: '#3B4371', pos: 100 },
    ],
    length: 1,
  },
  {
    version: 4,
    name: 'Rose',
    colors: [
      { hex: '#F4C4F3', pos: 0 },
      { hex: '#FC67FA', pos: 100 },
    ],
    length: 1,
  },
  {
    version: 4,
    name: 'Firewatch',
    colors: [
      { hex: '#CB2D3E', pos: 0 },
      { hex: '#EF473A', pos: 100 },
    ],
    length: 1,
  },
];

export const v3formats = [
  {
    color: '&#$1$2$3$4$5$6$f$c',
    char: '&',
  },
  {
    color: 'MiniMessage',
    bold: '<b>$t</b>',
    italic: '<i>$t</i>',
    underline: '<u>$t</u>',
    strikethrough: '<st>$t</st>',
  },
  {
    color: '§x§$1§$2§$3§$4§$5§$6$f$c',
    char: '§',
  },
  {
    color: '&x&$1&$2&$3&$4&$5&$6$f$c',
    char: '&',
  },
  {
    color: '<#$1$2$3$4$5$6>$f$c',
    char: '&',
  },
  {
    color: '<##$1$2$3$4$5$6>$f$c',
    char: '&',
  },
  {
    color: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
    bold: '[BOLD]$t[/BOLD]',
    italic: '[ITALIC]$t[/ITALIC]',
    underline: '[UNDERLINE]$t[/UNDERLINE]',
    strikethrough: '[STRIKETHROUGH]$t[/STRIKETHROUGH]',
  },
];

export const types = [
  { name: 'Normal (Left -> Right)', value: 1 },
  { name: 'Reversed (Right -> Left)', value: 2 },
  { name: 'Bouncing (Left -> Right -> Left)', value: 3 },
  { name: 'Full Text Cycle', value: 4 },
];

export const defaults = {
  version: 4,
  colors: presets[0].colors,
  colorlength: 1,
  name: 'logo',
  text: 'Birdflop',
  type: 1,
  speed: 50,
  length: 1,
  format: v3formats[0] as format,
  prefixsuffix: '',
  customFormat: false,
  outputFormat: '%name%:\n  change-interval: %speed%\n  texts:\n%output:{  - "$t"}%',
  trimspaces: true,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
};

function decompress(input: number, expectedValues: number) {
  const values = [];
  for (let i = 0; i < expectedValues; i++) {
    const value = !!((input >> i) & 1);
    values.push(value);
  }
  return values;
}

const v1formats = {
  0: {
    outputPrefix: '',
    template: '&#$1$2$3$4$5$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  1: {
    outputPrefix: '',
    template: '<#$1$2$3$4$5$6>$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  2: {
    outputPrefix: '',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  3: {
    outputPrefix: '/nick ',
    template: '&#$1$2$3$4$5$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  4: {
    outputPrefix: '/nick ',
    template: '<#$1$2$3$4$5$6>$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  5: {
    outputPrefix: '/nick ',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  6: {
    outputPrefix: '',
    template: '§x§$1§$2§$3§$4§$5§$6$f$c',
    formatChar: '§',
  },
  7: {
    outputPrefix: '',
    template: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
    formatChar: '',
  },
  8: {
    outputPrefix: '',
    template: '',
    custom: true,
    formatChar: '',
  },
};

export function fromBinary(encoded: string) {
  let binary;
  try {
    binary = atob(encoded);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return '';
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

export function loadPreset(p: string): Partial<typeof defaults> {
  let preset: any;
  let newPreset = { ...defaults };
  if (fromBinary(p) !== '') {
    const formatting = decompress(preset.formats, 4);
    preset = JSON.parse(fromBinary(p));
    const { name, text, speed } = preset;
    newPreset = {
      ...newPreset, name, text, speed,
      colors: preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i })),
      type: Number(preset.type) + 1,
      format: v3formats.find((f) => f.color === v1formats[preset['output-format'] as keyof typeof v1formats].template) || {
        color: v1formats[preset['output-format'] as keyof typeof v1formats].template,
        char: v1formats[preset['output-format'] as keyof typeof v1formats].formatChar,
      },
      customFormat: preset['custom-format'] !== '',
      prefixsuffix: v1formats[preset['output-format'] as keyof typeof v1formats].outputPrefix ? `${v1formats[preset['output-format'] as keyof typeof v1formats].outputPrefix}$t` : '',
      bold: formatting[0],
      italic: formatting[1],
      underline: formatting[2],
      strikethrough: formatting[3],
    };
  }
  else preset = JSON.parse(p);
  if (preset.colors && preset.colors.length && typeof preset.colors[0] == 'string') {
    if (typeof preset.colors[0] == 'string') preset.colors = preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i }));
  }
  if (preset.version === defaults.version) return preset;
  else if (preset.version === 2) {
    const { name, text, speed, type, customFormat, bold, italic, underline, strikethrough } = preset;
    newPreset = { ...newPreset, name, text, speed, type, customFormat, bold, italic, underline, strikethrough,
      colors: preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i })),
      format: v3formats.find((f) => f.color === preset.format) || {
        color: preset.format,
        char: preset.formatchar,
      },
      prefixsuffix: preset.prefix ? `${preset.prefix}$t` : '',
    };
  }
  else if (preset.version === 3) {
    newPreset = {
      ...newPreset,
      ...preset,
      colors: preset.colors ? preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i })) : newPreset.colors,
    };
    newPreset.version = defaults.version;
  }

  (Object.keys(newPreset) as Array<keyof typeof newPreset>).forEach((key) => {
    if (newPreset[key] === defaults[key] && key !== 'version') {
      delete newPreset[key];
    }
  });

  return newPreset as Partial<typeof defaults>;
}