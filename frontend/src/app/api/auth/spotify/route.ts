// Example API route for Spotify OAuth
// This is a reference implementation - adjust according to your backend setup

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // If this is the initial request (no code or error), redirect to Spotify
  if (!code && !error) {
    const spotifyAuthUrl = new URL('https://accounts.spotify.com/authorize');
    spotifyAuthUrl.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID || 'your-client-id');
    spotifyAuthUrl.searchParams.append('response_type', 'code');
    spotifyAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/spotify`);
    spotifyAuthUrl.searchParams.append('scope', 'playlist-read-private playlist-read-collaborative user-read-private user-read-email');
    
    return NextResponse.redirect(spotifyAuthUrl.toString());
  }

  // Handle OAuth callback
  if (error) {
    // Return HTML that sends error message to parent window
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SPOTIFY_AUTH_ERROR',
              error: '${error}'
            }, window.location.origin);
            window.close();
          </script>
          <p>Authentication failed. This window will close automatically.</p>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  if (code) {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/spotify`,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        // Return HTML that sends success message to parent window
        return new NextResponse(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Success</title>
            </head>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'SPOTIFY_AUTH_SUCCESS',
                  token: '${tokenData.access_token}',
                  refresh_token: '${tokenData.refresh_token || ''}',
                  expires_in: ${tokenData.expires_in || 3600}
                }, window.location.origin);
                window.close();
              </script>
              <p>Authentication successful! This window will close automatically.</p>
            </body>
          </html>
        `, {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      // Return HTML that sends error message to parent window
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
          </head>
          <body>
            <script>
              window.opener.postMessage({
                type: 'SPOTIFY_AUTH_ERROR',
                error: 'Token exchange failed'
              }, window.location.origin);
              window.close();
            </script>
            <p>Authentication failed. This window will close automatically.</p>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
