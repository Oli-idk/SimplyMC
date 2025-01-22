import { $, component$, useOnWindow, useVisibleTask$, useStore, useOnDocument } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';

import { Anchor, Header } from '@luminescent/ui-qwik';
import { CartOutline, CashOutline, ColorPaletteOutline, CubeOutline, EyeOutline, GlobeOutline, HeartOutline, PersonOutline, RocketOutline, ServerOutline, StarOutline, CheckmarkCircleOutline, AlertCircleOutline, LogoGoogle } from 'qwik-ionicons';
import Chart from '~/components/elements/Chart';
import { initiateTyper } from '~/components/util/Typer';

import Background from '~/components/images/background.png?jsx';
import { plans } from './plans';
import { unloadGoogleAds } from '~/components/util/GoogleAds';

export default component$(() => {

  const missionContentVisible = useStore({ expanded: false });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    initiateTyper();
  });

  useOnWindow('scroll', $(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    const bg = document.getElementById('bg')!;
    bg.style.bottom = `${window.scrollY / 2}px`;
    bg.style.filter = `blur(${window.scrollY * 2 / 100}px)`;
  }));

  useOnDocument(
    'load',
    $(() => {
      unloadGoogleAds();
    }),
  );

  return <>
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-svh pt-[72px]">
      <Background class="fixed bottom-0 scale-110 overflow-hidden -z-10 h-lvh w-lvw object-cover object-center opacity-55" id="bg" alt="background" />
      <div class="text-center justify-center flex relative w-full">
        <div class="flex flex-col gap-2 sm:gap-6 w-full px-4">
          <h1 class="text-white text-3xl sm:text-6xl font-bold animate-in fade-in slide-in-from-top-8 anim-duration-1000 drop-shadow-lg">
            Birdflop
          </h1>
          <h2 class="text-gray-300 text-lg sm:text-2xl animate-in fade-in slide-in-from-top-16 anim-duration-1000">
            The only 501(c)(3) nonprofit server host — dedicated to <span
              class="typer"
              id="main"
              data-words={'minecraft hosting,public resources,communities,you'}
              data-colors="#5487CB,#54B1DF,#54DAF4,#54EEFF"
              data-delay="50"
              data-deleteDelay="1500">
            </span>
            <span class="cursor" data-owner="main" data-cursor-display="|"></span>
          </h2>
          <div class="flex flex-col gap-2 mt-8 animate-in fade-in slide-in-from-top-24 anim-duration-1000">
            <div class="flex flex-col sm:flex-row gap-2 justify-center">
              <a href="#plans" class="lum-btn lum-pad-xl rounded-xl text-lg lum-bg-blue-700/80 hover:lum-bg-blue-600 gap-4">
                <ServerOutline width="30" class="text-3xl" />Hosting
              </a>
              <Link href="/resources" class="lum-btn lum-pad-xl rounded-xl text-lg lum-bg-purple-700/80 hover:lum-bg-purple-600 gap-4">
                <CubeOutline width="30" class="text-3xl" /> Resources
              </Link>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 justify-center">
              <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U" class="lum-btn lum-pad-xl rounded-xl text-lg lum-bg-pink-700/80 hover:lum-bg-pink-600 gap-4">
                <CashOutline width="30" class="text-3xl" /> Donate Today
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative max-w-4xl px-10">
        <div class="flex flex-col gap-4">
          <h2 class="text-gray-100 text-3xl sm:text-5xl font-bold mb-4 text-center">
            Our Nonprofit Mission
          </h2>
          <p class="text-gray-200 sm:text-lg">
            At the heart of our mission, we are dedicated to igniting and nurturing a passion for technology and computer science. We uniquely approach our mission by offering affordable and accessible hosting resources, not just as a service, but as a catalyst for technological curiosity.&nbsp;
            {missionContentVisible.expanded && <>
              Our belief is rooted in the idea that the hands-on experience of creating and managing a game server can be a gateway to a lifelong interest in technology and computer science. By ensuring this journey is engaging and frustration-free, we significantly enhance the likelihood of sparking a deeper interest in technological fields.
              <br />
              <br />
              Birdflop goes beyond mere hosting; we actively foster a community of learning and growth, exemplified through the wealth of public resources available on our <Link href="/resources" class="text-blue-400 hover:underline">Resources</Link> page. Looking ahead, we are committed to expanding our reach, investing in initiatives that fuel a passion for computer science and technology, and making a lasting impact in shaping future innovators. If you would like to further our mission, please consider making a tax-deductible <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U" class="text-blue-400 hover:underline">charitable donation</a>.&nbsp;
            </>}
            <button class="text-blue-400 hover:underline" onClick$={() => missionContentVisible.expanded = !missionContentVisible.expanded}>
              {missionContentVisible.expanded ? 'Read less' : 'Read more'}
            </button>
          </p>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative max-w-5xl px-6">
        <div class="flex flex-col gap-4">
          <Anchor id="plans" />
          <h2 class="text-gray-100 text-3xl sm:text-5xl font-bold mb-4 text-center">
            Plans
          </h2>
          <div class="grid md:grid-cols-3 gap-4">
            {Object.keys(plans).map((planName) => {
              const plan = plans[planName as keyof typeof plans];
              const ramOptions = Object.keys(plan.ramAndId);
              return <div class="lum-card hover:lum-bg-gray-900/70 transition duration-1000 hover:duration-75 ease-out" key={planName}>
                <p>
                  Last quarter, clients paid <strong>~${plan.$PerGBReimbursed}/GB RAM</strong> after reimbursements.
                </p>
                <Header subheader={<>{ramOptions[0]} - {ramOptions[ramOptions.length - 1]} GB plans<br/>capped at ${plan.$PerGB}/GB</>}>
                  {planName}
                </Header>
                <ul class="list-disc ml-5 flex flex-col gap-2 h-full">
                  {plan.features.map((feature) => {
                    return <li key={feature}>
                      {feature}
                    </li>;
                  })}
                </ul>
                {plan.outOfStock ?
                  <a href="https://discord.gg/nmgtX5z" target='_blank' class="lum-btn lum-bg-red-600/60 hover:lum-bg-red-600 fill-current">
                    <AlertCircleOutline width="30" class="text-3xl" /> Out of stock
                  </a>
                  :
                  <Link href={`/plans?plan=${encodeURIComponent(planName)}`} class="lum-btn lum-bg-blue-500/50 hover:lum-bg-blue-500 mt-4">
                    <CartOutline width="30" class="text-3xl" /> Order Now
                  </Link>
                }
              </div>;
            })}
          </div>
          <div class="lum-card lum-bg-indigo-600/50 hover:lum-bg-indigo-600 transition duration-1000 hover:duration-75 ease-out max-w-xl mx-auto">
            <Header>
              <CheckmarkCircleOutline width="36" /> Benefits Galore
            </Header>
            <p class="text-gray-100">
              All plans come with a one-click modpack installer, DDoS protection, 3 off-site backups, dedicated IPs on 8+ GB plans, an improved Pterodactyl Panel for server management, and a 3-day satisfaction guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative max-w-5xl px-6">
        <div class="flex flex-col gap-4">
          <h2 class="text-gray-100 text-3xl sm:text-5xl font-bold mb-4 text-center">
            Features
          </h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out">
              <Header>
                <RocketOutline width="36" /> Sheer Performance
              </Header>
              <p>
                We don't make compromises. Choose from our blazing fast Ryzen 9 processors and NVMe SSDs. All plans include a satisfaction guarantee.
              </p>
            </div>
            <div class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out">
              <Header>
                <ColorPaletteOutline width="36" class="fill-current" /> Fully Configurable
              </Header>
              <p>
                You'll have full access to your server. You can set your startup flags, change your java version, upload custom jars, and create reverse proxies.
              </p>
            </div>
            <div class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out">
              <Header>
                <EyeOutline width="36" /> Transparent
              </Header>
              <p>
                We don't oversell, and we're transparent about that. View our public <Link href="/node-stats" class="text-blue-400 hover:underline">detailed server statistics</Link> or financial breakdown.
              </p>
            </div>
            <div class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out">
              <Header>
                <GlobeOutline width="36" /> Price Matching
              </Header>
              <p>
                We're confident that we have the best plans available. If you locate a similar plan at a lower price, ask us about our price matching.
              </p>
            </div>
            <div class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out">
              <Header>
                <HeartOutline width="36" /> Instant Support
              </Header>
              <p>
                You can contact support at any time through our <a href="https://discord.gg/nmgtX5z" class="text-blue-400 hover:underline">Discord server</a>.
              </p>
            </div>
            <div class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out">
              <Header>
                <CashOutline width="36" /> Nonprofit
              </Header>
              <p>
                Our nonprofit status helps us keep our services affordable and accessible. Clients receive periodic reimbursements for excess profit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 sitems-center justify-center bg-gray-800">
      <div class="justify-center flex relative max-w-4xl px-10">
        <div class="flex flex-col gap-4">
          <h2 class="text-gray-100 text-3xl sm:text-5xl font-bold mb-4 text-center">
            How do reimbursements work?
          </h2>
          <p class="text-gray-200 sm:text-lg">
            As a nonprofit, Birdflop periodically reimburses clients based on excess profit. At the end of each reimbursement period, active clients receive a reimbursement for excess profit from their plan. These reimbursements are dependent on usage, maximally lowering prices at high service utilization. Last quarter, US clients received a 37% reimbursement and EU clients received a 27% reimbursement, effectively lowering prices to $1.89/GB RAM and $1.46/GB RAM for the US and EU, respectively. Not good enough? Find a competitor with similar specifications and inquire about our price matching.
          </p>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative max-w-4xl px-10">
        <div class="flex flex-col gap-4">
          <h2 class="text-gray-100 text-3xl sm:text-5xl font-bold mb-4 text-center">
            Where do my payments go?
          </h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <Chart />
              <p class="text-gray-400 text-center py-2 text-sm">
                Plot shows revenue (inner ring) and expenditures (outer ring) for Q4 2024. Some numbers may be approximations, and categories may be simplified. US Hosting Expenses includes depreciation.
              </p>
            </div>
            <div class="flex flex-col gap-4">
              <p class="text-gray-200 sm:text-lg">
                Birdflop is a 501(c)(3) nonprofit organization. As such, all profit generated is reinvested into improving our services and accomplishing our mission. Your service fees are used for covering our server costs, including building new servers, colocation fees, server rental fees, and software licensing fees. Our quarterly financial report is proudly displayed on the left.
              </p>
              <p class="text-gray-200 sm:text-lg">
                Your payments get you the best possible rate while contributing to the development of our <Link href="/resources" class="text-blue-400 hover:underline">free public resources</Link>. We reimburse clients based on excess profit, and we never overload our servers. View our server statistics on the <Link href="/node-stats" class="text-blue-400 hover:underline">Node Stats</Link> page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative max-w-5xl px-6">
        <div class="flex flex-col gap-4">
          <h2 class="text-gray-100 text-3xl sm:text-5xl font-bold mb-4 text-center">
            Testimonials
          </h2>
          <div class="grid md:grid-cols-3 gap-4">
            <a class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out" href="https://g.co/kgs/mUU1j1G">
              <Header>
                <PersonOutline width="36" /> Mikkel Hansen
              </Header>
              <p class="h-full">
                I'm happy with my subscription, providing nearly full system access at a great price point. They've proven to be reliable, trustworthy and transparent. It's clear that actual humans run this place and their support is S tier (if you don't mind the need to be part of their Discord server).
              </p>
            </a>
            <a class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out" href="https://www.trustpilot.com/reviews/65a592b5f66c25889e859abe">
              <Header>
                <PersonOutline width="36" /> Wizzy SMP
              </Header>
              <p class="h-full">
                Birdflop is the best Minecraft server hosting out there! Unbeatable pricing (due to their tax-exempt 501(c)3 non-profit status), amazing support on their Discord server and great servers! We have 24/7 access to all stats that we'd need to know like in/out network speed, average CPU usage per node, and a lot more. Birdflop is my recommendation to all my friends!
              </p>
            </a>
            <a class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out" href="https://www.trustpilot.com/reviews/60283aec679d97052cd70ca9">
              <Header>
                <PersonOutline width="36" /> Beaunation
              </Header>
              <p class="h-full">
                I've been using Birdflop for several months and I believe it is loads better than any other hosting company I've used. I recommend this company over any other
              </p>
            </a>
            <a class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out" href="https://www.trustpilot.com/reviews/602d901e679d97052cdb67d1">
              <Header>
                <PersonOutline width="36" /> Jmaster
              </Header>
              <p class="h-full">
                Amazing hosting, amazing staff, and top of the line performance. 11/10, and I recommend it to everyone. I can say with confidence, this is a valid host and has no cringe features.
              </p>
            </a>
            <a class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out" href="https://www.trustpilot.com/reviews/5fd91bba755dc10b4824093d">
              <Header>
                <PersonOutline width="36" /> Oliver Flynn
              </Header>
              <p class="h-full">
                Best hosting I have ever used. great owners, fast help, amazing servers. all around a good host.
              </p>
            </a>
            <div class="lum-card hover:lum-bg-gray-900/50 transition duration-1000 hover:duration-75 ease-out">
              <Header>
                <StarOutline width="36" /> More
              </Header>
              <p class="h-full">
                Check out our Trustpilot or Google page for more testimonials.
              </p>
              <a href="https://www.trustpilot.com/review/birdflop.com" class="lum-btn lum-bg-blue-500/50 hover:lum-bg-blue-500">
                <StarOutline width="24" /> Trustpilot
              </a>
              <a href="https://maps.app.goo.gl/R1AYXVd1Q6YvTLBT8" class="lum-btn lum-bg-blue-500/50 hover:lum-bg-blue-500 fill-current">
                <LogoGoogle width="24" /> Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 sitems-center justify-center bg-gray-800">
      <div class="justify-center flex relative max-w-4xl px-10">
        <div class="flex flex-col gap-4">
          <h2 class="text-gray-100 text-3xl sm:text-5xl font-bold mb-4 text-center">
            Still not convinced?
          </h2>
          <p class="text-gray-200 sm:text-lg">
            Create a ticket on our <a href="https://discord.gg/nmgtX5z" class="text-blue-400 hover:underline">Discord server</a> to ask for more information or request a free trial. All plans include a 3-day refund guarantee if you're not satisfied for any reason. On the Discord, you'll also find several more happy clients who can tell you about their experiences with Birdflop.
          </p>
        </div>
      </div>
    </section>
    <div class="pt-16 bg-gray-800" />
  </>;
});

export const head: DocumentHead = {
  title: 'Birdflop - Minecraft Hosting & Resources',
  meta: [
    {
      name: 'description',
      content: 'Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $1.48/GB RAM for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $1.48/GB RAM for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};
