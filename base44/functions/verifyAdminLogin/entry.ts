import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Simple password verification (in production, use bcrypt for proper hashing)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return Response.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    // Query admin by email
    const admins = await base44.asServiceRole.entities.admins.filter({ email }, '', 1);
    
    if (!admins || admins.length === 0) {
      return Response.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    const admin = admins[0];

    // Verify password
    const senhaHash = await hashPassword(senha);
    if (admin.senha_hash !== senhaHash) {
      return Response.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    if (!admin.ativo) {
      return Response.json({ error: 'Admin inativo' }, { status: 403 });
    }

    // Update last access
    await base44.asServiceRole.entities.admins.update(admin.id, {
      ultimo_acesso: new Date().toISOString()
    });

    // Return admin info (no sensitive data)
    return Response.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        nome: admin.nome
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});