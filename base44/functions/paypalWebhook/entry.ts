import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { addMonths, format } from 'npm:date-fns';

const PAYPAL_API_BASE = 'https://api-m.paypal.com';

async function verifyWebhookSignature(req, body) {
  const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
  if (!webhookId) return true; // Skip verification if webhook ID not configured
  
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionTime = req.headers.get('paypal-transmission-time');
  const certUrl = req.headers.get('paypal-cert-url');
  const authAlgo = req.headers.get('paypal-auth-algo');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  
  const accessToken = await getPayPalAccessToken();
  
  const verifyData = {
    transmission_id: transmissionId,
    transmission_time: transmissionTime,
    cert_url: certUrl,
    auth_algo: authAlgo,
    transmission_sig: transmissionSig,
    webhook_id: webhookId,
    webhook_event: body
  };
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(verifyData)
  });
  
  const result = await response.json();
  return result.verification_status === 'SUCCESS';
}

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

function getPlanMonths(planId) {
  if (planId.includes('MONTHLY')) return 1;
  if (planId.includes('QUARTERLY')) return 3;
  if (planId.includes('YEARLY')) return 12;
  return 1;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    
    // Verificar firma del webhook
    const isValid = await verifyWebhookSignature(req, body);
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const eventType = body.event_type;
    const resource = body.resource;
    
    const base44 = createClientFromRequest(req);
    
    console.log('PayPal webhook received:', eventType);
    
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.id || resource.billing_agreement_id;
        const subscriberEmail = resource.subscriber?.email_address || resource.payer?.email_address;
        
        if (!subscriberEmail) break;
        
        // Verificar si es un regalo (tiene custom_id)
        let giftData = null;
        if (resource.custom_id) {
          try {
            giftData = JSON.parse(resource.custom_id);
          } catch (e) {
            console.log('Error parsing custom_id:', e);
          }
        }
        
        // Si es un regalo, el usuario destinatario es gift_to, sino es el comprador
        const targetEmail = giftData?.gift_to || subscriberEmail;
        
        // Buscar usuario por email
        const users = await db.asServiceRole.entities.User.filter({ email: targetEmail });
        if (users.length === 0) break;
        
        const user = users[0];
        
        // Calcular fecha de expiración basada en el plan
        const planId = resource.plan_id || 'MONTHLY';
        const months = giftData?.duration || getPlanMonths(planId);
        const premiumUntil = format(addMonths(new Date(), months), 'yyyy-MM-dd');
        
        await db.asServiceRole.auth.updateUser(user.email, {
          is_premium: true,
          premium_until: premiumUntil,
          paypal_subscription_id: giftData ? null : subscriptionId
        });
        
        // Si es un regalo, enviar notificación al destinatario
        if (giftData && giftData.gift_from) {
          const giftFrom = await db.asServiceRole.entities.User.filter({ email: giftData.gift_from });
          const fromName = giftFrom.length > 0 ? giftFrom[0].full_name : 'Un amigo';
          
          await db.asServiceRole.entities.Notification.create({
            user_email: targetEmail,
            type: 'friend_activity',
            title: '¡Regalo Premium recibido!',
            message: `${fromName} te ha regalado ${months} ${giftData.duration_unit} de Premium. ¡Disfrútalo!`,
            icon: '🎁'
          });
        }
        
        console.log(`Premium activated for ${user.email} until ${premiumUntil}`);
        break;
      }
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId = resource.id;
        
        // Buscar usuario por subscription ID
        const users = await db.asServiceRole.entities.User.filter({ 
          paypal_subscription_id: subscriptionId 
        });
        
        if (users.length === 0) break;
        
        const user = users[0];
        
        await db.asServiceRole.auth.updateUser(user.email, {
          is_premium: false,
          premium_until: format(new Date(), 'yyyy-MM-dd')
        });
        
        console.log(`Premium cancelled for ${user.email}`);
        break;
      }
      
      default:
        console.log('Unhandled webhook event:', eventType);
    }
    
    return Response.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
});