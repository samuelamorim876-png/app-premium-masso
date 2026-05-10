import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = "BO_lrjJGy9nSOdiN5zsaQwMPZa8ine1JBQiCjrKrNWKFgPt34Bq9YFN0vuaYZS3z0JTEXoG-7nTsQSMBgAQy6Zk";

// Web Push requires specific crypto operations
async function sendWebPush(subscription: { endpoint: string; p256dh: string; auth_key: string }, payload: string, vapidPrivateKey: string) {
  // For Web Push, we need to use the web-push protocol
  // Using the fetch API with proper VAPID headers
  const encoder = new TextEncoder();
  
  // Import VAPID private key
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  const publicKeyBytes = base64UrlDecode(VAPID_PUBLIC_KEY);
  
  // Create JWT for VAPID
  const endpoint = new URL(subscription.endpoint);
  const audience = `${endpoint.protocol}//${endpoint.host}`;
  
  const vapidKey = await crypto.subtle.importKey(
    "pkcs8",
    createPkcs8(privateKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const now = Math.floor(Date.now() / 1000);
  const claims = base64UrlEncode(encoder.encode(JSON.stringify({
    aud: audience,
    exp: now + 3600,
    sub: "mailto:pastororxiamorim@gmail.com",
  })));
  
  const signInput = encoder.encode(`${header}.${claims}`);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    vapidKey,
    signInput
  );
  
  const jwt = `${header}.${claims}.${base64UrlEncode(new Uint8Array(signature))}`;
  
  // Encrypt the payload using Web Push encryption
  const encrypted = await encryptPayload(
    encoder.encode(payload),
    base64UrlDecode(subscription.p256dh),
    base64UrlDecode(subscription.auth_key)
  );
  
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Authorization": `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      "TTL": "86400",
    },
    body: encrypted,
  });
  
  return response;
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createPkcs8(rawKey: Uint8Array): ArrayBuffer {
  // Wrap raw EC private key (32 bytes) in PKCS#8 DER structure for P-256
  const pkcs8Prefix = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20
  ]);
  const pkcs8Suffix = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00
  ]);
  
  // Get public key from the VAPID_PUBLIC_KEY
  const pubKeyBytes = base64UrlDecode(VAPID_PUBLIC_KEY);
  
  const result = new Uint8Array(pkcs8Prefix.length + rawKey.length + pkcs8Suffix.length + pubKeyBytes.length);
  result.set(pkcs8Prefix, 0);
  result.set(rawKey, pkcs8Prefix.length);
  result.set(pkcs8Suffix, pkcs8Prefix.length + rawKey.length);
  result.set(pubKeyBytes, pkcs8Prefix.length + rawKey.length + pkcs8Suffix.length);
  
  return result.buffer;
}

async function encryptPayload(
  plaintext: Uint8Array,
  p256dhKey: Uint8Array,
  authSecret: Uint8Array
): Promise<Uint8Array> {
  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  
  // Import subscriber's public key
  const subscriberKey = await crypto.subtle.importKey(
    "raw",
    p256dhKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  
  // Derive shared secret
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberKey },
    localKeyPair.privateKey,
    256
  ));
  
  // Export local public key
  const localPublicKey = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey));
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const encoder = new TextEncoder();
  
  // HKDF to derive IKM
  const authInfo = encoder.encode("WebPush: info\0");
  const authInfoFull = new Uint8Array(authInfo.length + p256dhKey.length + localPublicKey.length);
  authInfoFull.set(authInfo, 0);
  authInfoFull.set(p256dhKey, authInfo.length);
  authInfoFull.set(localPublicKey, authInfo.length + p256dhKey.length);
  
  const authKey = await crypto.subtle.importKey("raw", authSecret, { name: "HKDF" }, false, ["deriveBits"]);
  const prk = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: sharedSecret, info: authInfoFull },
    authKey,
    256
  ));
  
  // Derive content encryption key (CEK)
  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\0");
  const prkKey = await crypto.subtle.importKey("raw", prk, { name: "HKDF" }, false, ["deriveBits"]);
  const cek = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: cekInfo },
    prkKey,
    128
  ));
  
  // Derive nonce
  const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
  const nonce = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: nonceInfo },
    prkKey,
    96
  ));
  
  // Pad plaintext (add delimiter byte 0x02)
  const paddedPlaintext = new Uint8Array(plaintext.length + 1);
  paddedPlaintext.set(plaintext, 0);
  paddedPlaintext[plaintext.length] = 2; // padding delimiter
  
  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    paddedPlaintext
  ));
  
  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const recordSize = 4096;
  const header = new Uint8Array(16 + 4 + 1 + localPublicKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, recordSize);
  header[20] = localPublicKey.length;
  header.set(localPublicKey, 21);
  
  const result = new Uint8Array(header.length + encrypted.length);
  result.set(header, 0);
  result.set(encrypted, header.length);
  
  return result;
}

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  
  // Verify authorization
  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader || !serviceRoleKey || !authHeader.includes(serviceRoleKey)) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!vapidPrivateKey) {
    return new Response(JSON.stringify({ error: "VAPID_PRIVATE_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const body = await req.json();
  const { name, email, type, title: customTitle, message: customMessage } = body;

  if (type !== "access_request" && type !== "test") {
    return new Response(JSON.stringify({ error: "Unknown notification type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Create Supabase admin client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Get admin user IDs
  const { data: adminRoles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  
  if (!adminRoles || adminRoles.length === 0) {
    return new Response(JSON.stringify({ message: "No admins found" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const adminUserIds = adminRoles.map((r: { user_id: string }) => r.user_id);
  
  // Get push subscriptions for admins
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", adminUserIds);
  
  if (!subscriptions || subscriptions.length === 0) {
    return new Response(JSON.stringify({ message: "No push subscriptions for admins" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const payload = JSON.stringify({
    title: "Novo pedido de acesso",
    body: `${name} (${email}) solicitou acesso ao aplicativo.`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/admin" },
  });
  
  const results: { endpoint: string; status: number }[] = [];
  
  for (const sub of subscriptions) {
    try {
      const resp = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth_key: sub.auth_key },
        payload,
        vapidPrivateKey
      );
      results.push({ endpoint: sub.endpoint, status: resp.status });
      
      // If subscription is gone (410), remove it
      if (resp.status === 410 || resp.status === 404) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    } catch (err) {
      console.error("Push failed for", sub.endpoint, err);
      results.push({ endpoint: sub.endpoint, status: 0 });
    }
  }
  
  return new Response(JSON.stringify({ sent: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
