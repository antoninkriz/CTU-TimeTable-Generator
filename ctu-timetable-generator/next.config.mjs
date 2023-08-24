// @ts-check

import { PHASE_DEVELOPMENT_SERVER, PHASE_TEST } from 'next/constants.js';
import bundleAnalyzer from '@next/bundle-analyzer';

export default (/** @type {string} */ phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_TEST;

  // eslint-disable-next-line import/no-extraneous-dependencies
  const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });

  /** @type {import('next').NextConfig} */
  return withBundleAnalyzer({
    images: {
      unoptimized: true,
    },
    compiler: {
      styledComponents: {
        displayName: isDev,
        ssr: true,
        fileName: isDev,
        minify: true,
        transpileTemplateLiterals: true,
        pure: true,
        cssProp: false,
      },
    },
    output: 'export',
    reactStrictMode: true,
    swcMinify: !isDev,
  });
};
