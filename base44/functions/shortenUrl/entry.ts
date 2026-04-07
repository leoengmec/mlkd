import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch('https://tinyurl.com/api/create.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(url)}`
    });

    const shortUrl = await response.text();

    if (shortUrl.includes('error')) {
      return Response.json({ error: 'Failed to shorten URL' }, { status: 500 });
    }

    return Response.json({ shortUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});