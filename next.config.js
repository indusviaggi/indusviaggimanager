/** @type {import('next').NextConfig} */

const { version } = require('./package.json');

const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    isLocal: process.env.MONGODB_URI.includes("italy"),
    platform1: "industicketmanager|mpas->...1|gpas->...!",
    platform2: "mahindersinghitaly|Rp1",
    version: version,
  },
};

module.exports = nextConfig;
