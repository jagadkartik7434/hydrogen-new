import server from '../dist/server/index.js';

const handler = server?.default ?? server;

export const config = {
  runtime: 'edge',
};

export default async function vercelEdgeHandler(request) {
  const executionContext = {
    waitUntil(promise) {
      return promise.catch((error) => console.error(error));
    },
  };

  // Vercel Edge Functions expose env vars via process.env; forward them.
  return handler.fetch(request, process.env, executionContext);
}

