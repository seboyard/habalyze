import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const PAYPAL_API_BASE = 'https://api-m.paypal.com';

// Plan IDs de PayPal - Estos deben ser creados en tu dashboard de PayPal
const PLAN_IDS = {
  monthly: 'P-57C98285723689441VNFA3VYQ',
  quarterly: 'P-75N68190GY568922TNFA3WKA', 
  yearly: 'P-47Y60856ER183Z829NFA3WXI'
};

async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  
  const auth = btoa(`${clientId}:${secret}`);
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { plan_id, return_url, cancel_url, custom_data } = await req.json();
    
    if (!plan_id || !PLAN_IDS[plan_id]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }
    
    const accessToken = await getPayPalAccessToken();
    
    const subscriptionData = {
      plan_id: PLAN_IDS[plan_id],
      subscriber: {
        email_address: user.email,
        name: {
          given_name: user.full_name?.split(' ')[0] || 'Usuario',
          surname: user.full_name?.split(' ').slice(1).join(' ') || 'Habalyze'
        }
      },
      application_context: {
        brand_name: 'Habalyze',
        locale: 'es-ES',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: return_url || 'https://app.habalyze.com/premium/success',
        cancel_url: cancel_url || 'https://app.habalyze.com/premium'
      }
    };
    
    // Si es un regalo, agregar custom_id con la info del regalo
    if (custom_data) {
      subscriptionData.custom_id = JSON.stringify(custom_data);
    }
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    });
    
    const subscription = await response.json();
    
    if (!response.ok) {
      console.error('PayPal error:', subscription);
      return Response.json({ 
        error: 'PayPal error', 
        details: subscription,
        status_code: response.status
      }, { status: 500 });
    }
    
    // Guardar subscription ID en el usuario (solo si NO es un regalo)
    if (!custom_data || !custom_data.gift_to) {
      await db.auth.updateMe({
        paypal_subscription_id: subscription.id
      });
    }
    
    // Encontrar el approval link
    const approvalLink = subscription.links.find(link => link.rel === 'approve');
    
    return Response.json({
      subscription_id: subscription.id,
      status: subscription.status,
      approval_url: approvalLink?.href
    });
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    return Response.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
});