/*
 * WHAT IS THIS FILE?
 *
 * It's the  entry point for cloudflare-pages when building for production.
 *
 * Learn more about the cloudflare integration here:
 * - https://qwik.builder.io/deployments/cloudflare-pages/
 *
 */
import {
  createQwikCity,
  type PlatformCloudflarePages,
} from '@builder.io/qwik-city/middleware/cloudflare-pages';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import render from './entry.ssr';

declare global {
  type QwikCityPlatform = PlatformCloudflarePages;
}

const fetch = createQwikCity({ render, qwikCityPlan, manifest });

export { fetch };