import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface DohAnswer { name: string; type: number; data: string }
interface DohResponse { Status: number; Answer?: DohAnswer[] }

async function lookupTxt(host: string): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=TXT`
  const resp = await fetch(url, { headers: { accept: 'application/dns-json' } })
  if (!resp.ok) return []
  const json = (await resp.json()) as DohResponse
  // TXT records come back as quoted strings; strip surrounding quotes and unescape.
  return (json.Answer ?? [])
    .filter((a) => a.type === 16)
    .map((a) => a.data.replace(/^"|"$/g, '').replace(/"\s*"/g, ''))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Missing authorization' }, 401)
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401)
    const userId = userData.user.id

    const body = await req.json().catch(() => ({}))
    const domainId = body?.domain_id as string | undefined
    if (!domainId || typeof domainId !== 'string') {
      return json({ error: 'domain_id required' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: domain, error: dErr } = await admin
      .from('organization_domains')
      .select('id, organization_id, hostname, domain_type, verification_token, status')
      .eq('id', domainId)
      .maybeSingle()
    if (dErr || !domain) return json({ error: 'Domain not found' }, 404)

    // Only that org's program_admin may trigger verification.
    const { data: isAdmin } = await admin.rpc('has_role', {
      _user_id: userId,
      _org_id: domain.organization_id,
      _role: 'program_admin',
    })
    if (!isAdmin) return json({ error: 'Forbidden' }, 403)

    if (domain.domain_type !== 'custom') {
      return json({ error: 'Only custom domains require DNS verification' }, 400)
    }
    if (domain.status === 'active') {
      return json({ ok: true, status: 'active', message: 'Already verified' })
    }

    const txtHost = `_lrp-verify.${domain.hostname}`
    const records = await lookupTxt(txtHost)
    const matched = records.some((r) => r.trim() === domain.verification_token)

    if (!matched) {
      await admin.rpc('mark_domain_check', { _domain_id: domain.id, _status: 'failed' })
      return json({
        ok: false,
        status: 'failed',
        expected_host: txtHost,
        expected_value: domain.verification_token,
        found: records,
        message:
          records.length === 0
            ? 'No TXT record found at that host. DNS may still be propagating.'
            : 'TXT record found but the value does not match the verification token.',
      })
    }

    await admin.rpc('mark_domain_verified', { _domain_id: domain.id })
    // SSL for vanity domains is issued by the platform out-of-band; keep ssl_status=pending
    // until the wildcard/hosting layer marks it active.
    return json({ ok: true, status: 'active', ssl_status: 'pending' })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
