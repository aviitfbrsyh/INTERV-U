import type {NextConfig} from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  turbopack: {
    resolveAlias: {
      'isomorphic-fetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
      'node-fetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
      'whatwg-fetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
      'cross-fetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
      'isomorphic-unfetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
      'unfetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
      'isomorphic-form-data': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
      'fetch-retry': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
    },
  },
  webpack: (config, {dev, isServer}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'isomorphic-fetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
        'node-fetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
        'whatwg-fetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
        'cross-fetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
        'isomorphic-unfetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
        'unfetch': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
        'isomorphic-form-data': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
        'fetch-retry': path.resolve(__dirname, 'lib/empty-fetch-polyfill.js'),
      };
    }
    return config;
  },
};

export default nextConfig;
