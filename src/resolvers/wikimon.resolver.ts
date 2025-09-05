import type { InferHandler } from "elysia";
import type serverService from "../services/server.service";

type WikimonHandler = InferHandler<typeof serverService.server, "/wikimon/*">;

export const wikimonResolver: WikimonHandler = async ({ request, params }) => {
  try {
    // Extract the subroute from the URL path
    const url = new URL(request.url);
    const subroute = url.pathname.replace('/wikimon', '') || '/';
    
    // Construct the target URL to wikimon.net
    const targetUrl = `https://wikimon.net${subroute}`;
    
    // Forward query parameters if any
    const searchParams = url.searchParams.toString();
    const finalUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;
    
    // Make the request to wikimon.net
    const response = await fetch(finalUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Digimon-API-Proxy/1.0',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
        'Accept-Encoding': request.headers.get('accept-encoding') || 'gzip, deflate, br',
      },
    });
    
    // Get the response body as ArrayBuffer to preserve binary data
    const responseBuffer = await response.arrayBuffer();
    
    // Return the response with appropriate headers
    return new Response(responseBuffer, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Content-Length': response.headers.get('content-length') || responseBuffer.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Proxy request failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};
