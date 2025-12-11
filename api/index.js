import server from '../dist/server/index.js';

const handler = server?.default ?? server;

// Use Vercel Node serverless runtime (Edge bundle pulls in unsupported modules).
export const config = {
  runtime: 'nodejs',
};

export default async function vercelNodeHandler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);

    // Recreate a Fetch API Request from the Vercel Node request.
    const init = {
      method: req.method,
      headers: req.headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req;
    }

    const request = new Request(url, init);

    const executionContext = {
      waitUntil(promise) {
        return promise.catch((error) => console.error(error));
      },
    };

    const response = await handler.fetch(request, process.env, executionContext);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream/pipe the body back to the client.
    if (response.body) {
      for await (const chunk of response.body) {
        res.write(chunk);
      }
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

