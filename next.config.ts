import type {NextConfig} from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WebpackPolyfillPath = path.resolve(__dirname, 'lib/empty-fetch-polyfill.js');
const TurboPolyfillPath = './lib/empty-fetch-polyfill.js';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'motion',
      'motion/react',
      '@react-three/drei',
      '@react-three/fiber',
      'three',
    ],
  },
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
      'isomorphic-fetch': TurboPolyfillPath,
      'node-fetch': TurboPolyfillPath,
      'whatwg-fetch': TurboPolyfillPath,
      'cross-fetch': TurboPolyfillPath,
      'isomorphic-unfetch': TurboPolyfillPath,
      'unfetch': TurboPolyfillPath,
      'isomorphic-form-data': TurboPolyfillPath,
      'fetch-retry': TurboPolyfillPath,
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
        'isomorphic-fetch': WebpackPolyfillPath,
        'node-fetch': WebpackPolyfillPath,
        'whatwg-fetch': WebpackPolyfillPath,
        'cross-fetch': WebpackPolyfillPath,
        'isomorphic-unfetch': WebpackPolyfillPath,
        'unfetch': WebpackPolyfillPath,
        'isomorphic-form-data': WebpackPolyfillPath,
        'fetch-retry': WebpackPolyfillPath,
      };
    }
    return config;
  },
};

export default nextConfig;
