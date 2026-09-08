// Vercel Serverless Function — pings Supabase to prevent free-tier project pausing
// Triggered automatically by Vercel Cron (see vercel.json)

export default async function handler(req, res) {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return res.status(200).json({ status: 'skipped', reason: 'No Supabase URL configured' });
  }

  try {
    // Simple health check — hits the Supabase REST endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    });

    return res.status(200).json({
      status: 'ok',
      supabaseStatus: response.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(200).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
