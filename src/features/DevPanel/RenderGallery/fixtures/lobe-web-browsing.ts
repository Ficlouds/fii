'use client';

import { defineFixtures, single, variants } from './_helpers';

export default defineFixtures({
  identifier: 'lobe-web-browsing',
  fixtures: {
    crawlMultiPages: single({
      args: {
        urls: ['https://ficlouds.com', 'https://docs.ficlouds.com'],
      },
      pluginState: {
        results: [
          {
            crawler: 'firecrawl',
            data: {
              content: 'Fi ships desktop and web experiences for AI collaboration.',
              description: 'Product homepage',
              title: 'Fi',
              url: 'https://ficlouds.com',
            },
            originalUrl: 'https://ficlouds.com',
          },
          {
            crawler: 'firecrawl',
            data: {
              content: 'Developer documentation for routing, tooling, and local testing.',
              description: 'Docs homepage',
              title: 'Fi Docs',
              url: 'https://docs.ficlouds.com',
            },
            originalUrl: 'https://docs.ficlouds.com',
          },
        ],
      },
    }),
    crawlSinglePage: single({
      args: { url: 'https://ficlouds.com/blog' },
      pluginState: {
        results: [
          {
            crawler: 'firecrawl',
            data: {
              content: 'Recent product updates and engineering notes.',
              description: 'Blog landing page',
              title: 'Fi Blog',
              url: 'https://ficlouds.com/blog',
            },
            originalUrl: 'https://ficlouds.com/blog',
          },
        ],
      },
    }),
    search: variants([
      {
        args: {
          query: 'Fi devtools preview route',
          searchEngines: ['google', 'bing'],
        },
        label: 'With results',
        pluginState: {
          query: 'Fi devtools preview route',
          results: [
            {
              content: 'Documentation and implementation notes about local preview tooling.',
              engines: ['google'],
              title: 'Preview tooling guide',
              url: 'https://docs.example.com/preview-tooling',
            },
            {
              content: 'Issue thread describing the /devtools route rollout.',
              engines: ['bing'],
              title: 'Builtin render devtools issue',
              url: 'https://linear.example.com/issue/',
            },
          ],
        },
      },
      {
        args: {
          query: 'undocumented internal preview snapshot harness',
          searchEngines: ['google'],
        },
        label: 'No results',
        pluginState: {
          query: 'undocumented internal preview snapshot harness',
          results: [],
        },
      },
    ]),
  },
});
