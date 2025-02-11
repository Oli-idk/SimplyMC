import { QwikAuth$ } from '@auth/qwik';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '~/components/util/prisma';
import Discord from '@auth/qwik/providers/discord';

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  () => ({
    providers: [Discord({
      profile(profile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber =
            profile.discriminator === '0'
              ? Number(BigInt(profile.id) >> BigInt(22)) % 6
              : parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png';
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          username: profile.username,
          email: profile.email,
          image: profile.image_url,
        };
      },
    })],
    adapter: PrismaAdapter(prisma),
  }),
);
