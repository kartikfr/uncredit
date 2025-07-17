import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method } = req

    switch (method) {
      case 'GET':
        return await handleGetKey(supabaseClient, req)
      case 'POST':
        return await handleSetKey(supabaseClient, req)
      case 'PUT':
        return await handleUpdateKey(supabaseClient, req)
      case 'DELETE':
        return await handleDeleteKey(supabaseClient, req)
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handleGetKey(supabaseClient: any, req: Request) {
  const url = new URL(req.url)
  const keyName = url.searchParams.get('key_name') || 'openai_api_key'

  const { data, error } = await supabaseClient
    .from('api_keys')
    .select('key_value, is_active')
    .eq('key_name', keyName)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'API key not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ 
    key_value: data.key_value,
    is_active: data.is_active 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function handleSetKey(supabaseClient: any, req: Request) {
  const { key_name, key_value, description } = await req.json()

  if (!key_name || !key_value) {
    return new Response(JSON.stringify({ error: 'key_name and key_value are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Use service role key for admin operations
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await serviceClient
    .from('api_keys')
    .upsert({
      key_name,
      key_value,
      description,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'key_name'
    })
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ 
    message: 'API key saved successfully',
    data: data[0]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function handleUpdateKey(supabaseClient: any, req: Request) {
  const { key_name, key_value, description } = await req.json()

  if (!key_name || !key_value) {
    return new Response(JSON.stringify({ error: 'key_name and key_value are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await serviceClient
    .from('api_keys')
    .update({
      key_value,
      description,
      updated_at: new Date().toISOString()
    })
    .eq('key_name', key_name)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ 
    message: 'API key updated successfully',
    data: data[0]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function handleDeleteKey(supabaseClient: any, req: Request) {
  const url = new URL(req.url)
  const keyName = url.searchParams.get('key_name') || 'openai_api_key'

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await serviceClient
    .from('api_keys')
    .update({ is_active: false })
    .eq('key_name', keyName)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ 
    message: 'API key deactivated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
} 