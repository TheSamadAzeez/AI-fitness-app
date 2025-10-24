import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// client safe configuration
export const config = {
  projectId: '5r500ptx',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
};

// admin level client, used for server side operations
// admin client for mutations
const adminConfig = {
  ...config,
  token: process.env.SANITY_API_TOKEN,
};

export const client = createClient(config);
export const adminClient = createClient(adminConfig);

// image URL builder
const builder = imageUrlBuilder(client);
export const urlFor = (source: string) => {
  return builder.image(source);
};
