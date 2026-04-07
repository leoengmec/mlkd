import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ipAttempts = new Map();
const MAX_ATTEMPTS = 3; // Bloqueio após 3 falhas
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos

function getClientIP(req) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = ipAttempts.get(ip) || [];
  
  // Remove tentativas fora da janela
  const recentAttempts = attempts.filter(t => now - t < WINDOW_MS);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false; // Bloqueado
  }
  
  recentAttempts.push(now);
  ipAttempts.set(ip, recentAttempts);
  return true; // Permitido
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ip = getClientIP(req);
    const { email, senha } = await req.json();

    // Rate limit
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: "Muitas tentativas de login. Tente novamente em 5 minutos." },
        { status: 429 }
      );
    }

    if (!email || !senha) {
      return Response.json({ error: "Email e senha obrigatórios" }, { status: 400 });
    }

    async function hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    const senhaHash = await hashPassword(senha);
    const admins = await base44.asServiceRole.entities.admins.filter({ email }, "", 1);

    if (!admins || admins.length === 0) {
      return Response.json({ error: "Email ou senha incorretos" }, { status: 401 });
    }

    const admin = admins[0];

    if (admin.senha_hash !== senhaHash) {
      return Response.json({ error: "Email ou senha incorretos" }, { status: 401 });
    }

    if (!admin.ativo) {
      return Response.json({ error: "Admin inativo" }, { status: 403 });
    }

    await base44.asServiceRole.entities.admins.update(admin.id, {
      ultimo_acesso: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      admin: { id: admin.id, email: admin.email, nome: admin.nome },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});