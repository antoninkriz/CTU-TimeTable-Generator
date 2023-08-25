// @ts-check

const { PHASE_DEVELOPMENT_SERVER, PHASE_TEST } = require('next/constants');
const bundleAnalyzer = require('@next/bundle-analyzer');

module.exports = (/** @type {string} */ phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_TEST;

  const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });

  /** @type {import('next').NextConfig} */
  return withBundleAnalyzer({
    basePath: isDev ? undefined : '/CTU-TimeTable-Generator',
    output: 'export',
    reactStrictMode: true,
    swcMinify: !isDev,
  });
};
