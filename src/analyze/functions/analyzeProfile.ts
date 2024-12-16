import createField from './createField';
import evalField from './evalField';

import config_bukkit from '~/analyze/configs/bukkit';
import plugins_paper from '~/analyze/configs/plugins/paper';
import plugins_purpur from '~/analyze/configs/plugins/purpur';
import config_paper from '~/analyze/configs/profile/paper';
import config_purpur from '~/analyze/configs/purpur';
import config_server_properties from '~/analyze/configs/server.properties';
import servers from '~/analyze/configs/servers';
import config_spigot from '~/analyze/configs/spigot';

const supportedPlatforms = [
  'paper',
  'bukkit',
];

export default async function analyzeProfile(id: string) {
  const url_raw = `https://spark.lucko.me/${id}?raw=1`;

  let sampler;
  try {
    const response_raw = await fetch(url_raw, {
      headers: { 'Accept': 'application/json' },
    });
    sampler = await response_raw.json();
  }
  catch (err) {
    return [{ name: '❌ Processing Error', value: `Birdflop cannot process this spark profile. Please use an alternative spark profile. ${err}` }];
  }

  const platform = sampler.metadata.platform.name;

  let server_properties: any, bukkit: any, spigot: any, paper: any, purpur: any;

  const plugins: any[] = Object.values(sampler.metadata.sources);
  const configs = sampler.metadata.serverConfigurations;
  if (configs) {
    if (configs['server.properties']) server_properties = JSON.parse(configs['server.properties']);
    if (configs['bukkit.yml']) bukkit = JSON.parse(configs['bukkit.yml']);
    if (configs['spigot.yml']) spigot = JSON.parse(configs['spigot.yml']);
    if (configs['paper/']) paper = JSON.parse(configs['paper/']);
    if (configs['purpur.yml']) purpur = JSON.parse(configs['purpur.yml']);
  }

  const PROFILE_CHECK = {
    servers: servers(),
    plugins: {
      paper: plugins_paper(),
      purpur: plugins_purpur(),
    },
    config: {
      'server.properties': config_server_properties(),
      bukkit: config_bukkit(),
      spigot: config_spigot(),
      paper: config_paper(),
      purpur: config_purpur(),
    },
  };

  // fetch the latest mc version
  const req = await fetch('https://api.purpurmc.org/v2/purpur');
  const json = await req.json();
  const latest = json.versions[json.versions.length - 1];

  const fields: Field[] = [];

  // ghetto version check
  const mcversion = sampler.metadata.platform.minecraftVersion;
  if (platform != undefined && supportedPlatforms.includes(platform.toLowerCase()) == false) {
    return [
      {
        name: '❌ Processing Error',
        value: `birdflop is unable to process this spark profile. It appears that the platform is not supported for analysis. Platform: ${platform}`,
      },
    ];
  }
  if (mcversion.split(')')[0] != latest) {
    fields.push({ name: '❌ Outdated', value: `You are using \`${mcversion}\`. Update to \`${latest}\`.`, buttons: [{ text: 'Paper', url: 'https://papermc.io' }, { text: 'Pufferfish', url: 'https://ci.pufferfish.host/job/Pufferfish-1.19/' }, { text: 'Purpur', url: 'https://purpurmc.org' }] });
  }
  const brand = sampler.metadata.platform.brand;
  if (PROFILE_CHECK.servers.servers) {
    PROFILE_CHECK.servers.servers.forEach((server: FieldOption) => {
      if (brand.includes(server.name)) fields.push(createField(server));
    });
  }

  const flags = sampler.metadata.systemStatistics.java.vmArgs;
  const jvm_version = sampler.metadata.systemStatistics.java.version;

  if (flags.includes('-XX:+UseZGC') && flags.includes('-Xmx')) {
    const flaglist: string[] = flags.split(' ');
    flaglist.forEach((flag) => {
      if (flag.startsWith('-Xmx')) {
        let max_mem = flag.split('-Xmx')[1].toLowerCase();
        max_mem = max_mem.replace('g', '000');
        max_mem = max_mem.replace('m', '');
        if (parseInt(max_mem) < 10000) fields.push({ name: '❌ Low Memory', value: 'ZGC is only good with a lot of memory.', buttons: [{ text: 'Learn More', url: 'https://developers.redhat.com/articles/2021/11/02/how-choose-best-java-garbage-collector#z_garbage_collector__zgc_' }] });
      }
    });
  }
  else if (flags.includes('-Daikars.new.flags=true')) {
    if (!flags.includes('-XX:+PerfDisableSharedMem')) fields.push({ name: '❌ Outdated Flags', value: 'Add `-XX:+PerfDisableSharedMem` to flags.' });
    if (!flags.includes('-XX:G1MixedGCCountTarget=4')) fields.push({ name: '❌ Outdated Flags', value: 'Add `XX:G1MixedGCCountTarget=4` to flags.' });
    if (!flags.includes('-XX:+UseG1GC') && jvm_version.startsWith('1.8.')) fields.push({ name: '❌ Aikar\'s Flags', value: 'You must use G1GC when using Aikar\'s flags.' });
    if (flags.includes('-Xmx')) {
      let max_mem = 0;
      const flaglist: string[] = flags.split(' ');
      flaglist.forEach((flag) => {
        if (flag.startsWith('-Xmx')) {
          flag = flag.split('-Xmx')[1].toLowerCase();
          flag = flag.replace('g', '000');
          flag = flag.replace('m', '');
          max_mem = parseInt(flag);
        }
      });
      if (max_mem < 5400) fields.push({ name: '❌ Low Memory', value: 'Allocate at least 6-10GB of ram to your server if you can afford it.' });
      if (1000 * sampler.metadata.platformStatistics.playerCount / max_mem > 6 && max_mem < 10000) fields.push({ name: '❌ Low Memory', value: 'You should be using more RAM with this many players.' });
      if (flags.includes('-Xms')) {
        let min_mem = 0;
        flaglist.forEach((flag) => {
          if (flag.startsWith('-Xms')) {
            flag = flag.split('-Xms')[1].toLowerCase();
            flag = flag.replace('g', '000');
            flag = flag.replace('m', '');
            min_mem = parseInt(flag);
          }
        });
        if (min_mem != max_mem) fields.push({ name: '❌ Aikar\'s Flags', value: 'Your Xmx and Xms values should be equal when using Aikar\'s flags.' });
      }
    }
  }
  else if (flags.includes('-Dusing.aikars.flags=mcflags.emc.gs')) {
    fields.push({ name: '❌ Outdated Flags', value: 'Your flags are outdated.', buttons: [{ text: 'Update Aikar\'s Flags', url: 'https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/' }] });
  }
  else {
    fields.push({ name: '❌ Aikar\'s Flags', value: 'Aikar\'s Flags add some optimizations to the java garbage collector.', buttons: [{ text: 'Use Aikar\'s Flags', url: 'https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/' }] });
  }

  const cpu = sampler.metadata.systemStatistics.cpu.threads;
  if (cpu <= 2) fields.push({ name: '❌ Threads', value: `You only have ${cpu} thread(s).`, buttons: [{ text: 'Find a better host', url: 'https://www.birdflop.com' }] });

  // Probably a way to do this, idk yet
  // const handlers = Object.keys(request_raw.idmap.handlers).map(i => { return request_raw.idmap.handlers[i]; });
  // handlers.forEach(handler => {
  // 	let handler_name = handler[1];
  // 	if (handler_name.startsWith('Command Function - ') && handler_name.endsWith(':tick')) {
  // 		handler_name = handler_name.split('Command Function - ')[1].split(':tick')[0];
  // 		fields.push({ name: `❌ ${handler_name}`, value: 'This datapack uses command functions which are laggy.' });
  // 	}
  // });

  if (PROFILE_CHECK.plugins) {
    const server_names = Object.keys(PROFILE_CHECK.plugins);
    server_names.forEach(server_name => {
      if (Object.keys(configs).includes(server_name)) {
        plugins.forEach(plugin => {
          const server_plugins = PROFILE_CHECK.plugins[server_name as keyof typeof PROFILE_CHECK.plugins];
          Object.keys(server_plugins).forEach(plugin_name => {
            if (plugin.name == plugin_name) {
              const stored_plugin: any = server_plugins[plugin_name as keyof typeof server_plugins];
              stored_plugin.name = plugin_name;
              fields.push(createField(stored_plugin));
            }
          });
        });
      }
    });
  }

  if (PROFILE_CHECK.config) {
    Object.keys(PROFILE_CHECK.config).map(i => { return PROFILE_CHECK.config[i as keyof typeof PROFILE_CHECK.config]; }).forEach(config => {
      Object.keys(config).forEach(option_name => {
        const option = config[option_name as keyof typeof config];
        evalField(fields, option, option_name, plugins, server_properties, bukkit, spigot, paper, null, purpur);
      });
    });
  }

  plugins.forEach(plugin => {
    if (plugin.authors && plugin.authors.toLowerCase().includes('songoda')) {
      if (plugin.name == 'EpicHeads') fields.push({ name: '❌ EpicHeads', value: 'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative such as [HeadsPlus](https://spigotmc.org/resources/headsplus-»-1-8-1-16-4.40265/) or [HeadDatabase](https://www.spigotmc.org/resources/head-database.14280/).', inline: true });
      else if (plugin.name == 'UltimateStacker') fields.push({ name: '❌ UltimateStacker', value: 'Stacking plugins actually causes more lag.\nRemove UltimateStacker.', inline: true });
      else fields.push({ name: `❌ ${plugin.name}`, value: 'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.', inline: true });
    }
  });

  // No way to get gamerules from spark
  // const worlds = sampler.metadata.platformStatistics.world.worlds;
  // let high_mec = false;
  // worlds.forEach(world => {
  // 	const max_entity_cramming = parseInt(world.gamerules.maxEntityCramming);
  // 	if (max_entity_cramming >= 24) high_mec = true;
  // });
  // if (high_mec) fields.push({ name: '❌ maxEntityCramming', value: 'Decrease this by running the /gamerule command in each world.\nRecommended: 8.' });

  if (fields.length == 0) {
    return [{ name: '✅ All good', value: 'Analyzed with no recommendations.' }];
  }

  return fields;
}