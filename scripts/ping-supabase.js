/**
 * Keep Supabase Alive Script
 * Pings Supabase PostgREST endpoint periodically to prevent free-tier project pausing due to inactivity.
 */

const https = require('https');
const http = require('http');

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://xavkprxarmlfdqulyhgd.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_JLFsW2kTkmC4SCZcCGT0kA_UXo1FWDA';

async function pingSupabase() {
  const endpoint = new URL('/rest/v1/profiles?select=id&limit=1', SUPABASE_URL);

  console.log(`[Supabase Keep-Alive] Pinging: ${endpoint.origin}${endpoint.pathname}...`);

  const options = {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  };

  const client = endpoint.protocol === 'https:' ? https : http;

  return new Promise((resolve) => {
    const req = client.request(endpoint, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Supabase Keep-Alive] SUCCESS: Received HTTP ${res.statusCode}. Project is active!`);
          resolve(true);
        } else {
          console.warn(`[Supabase Keep-Alive] Warning: Received HTTP ${res.statusCode}: ${data.substring(0, 150)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[Supabase Keep-Alive] Connection Error: ${err.message}`);
      if (err.code === 'ENOTFOUND') {
        console.error(
          '[Supabase Keep-Alive] NOTE: Hostname could not be resolved (ENOTFOUND).\n' +
          'This typically means the Supabase project is currently PAUSED.\n' +
          'Please visit your Supabase dashboard (https://supabase.com/dashboard) and click "Restore project".\n' +
          'Once restored, this automated workflow will keep it alive.'
        );
      }
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error('[Supabase Keep-Alive] Request timed out.');
      resolve(false);
    });

    req.end();
  });
}

pingSupabase();

