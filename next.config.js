/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Integrated Author',
  },
}

export default nextConfig