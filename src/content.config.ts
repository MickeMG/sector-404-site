import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['in-progress', 'available', 'sold', 'archived']).default('in-progress'),
    price_sek: z.number().nullable().optional(),
    year: z.number().optional(),
    medium: z.string().optional(),
    dimensions: z.string().optional(),
    cover: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const characters = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/characters' }),
  schema: z.object({
    name: z.string(),
    status: z.string().default('unknown'),
    role: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['draft', 'published']).default('draft'),
    type: z.string().default('fragment'),
    tags: z.array(z.string()).default([]),
  }),
});


const signals = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/signals' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['prospect', 'active', 'archived']).default('prospect'),
    type: z.string().default('external'),
    summary: z.string().default(''),
    tags: z.array(z.string()).default([]),
  }),
});

const lore = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/lore' }),
  schema: z.object({
    title: z.string(),
    category: z.string().default('lore'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { works, characters, stories, lore, signals };
