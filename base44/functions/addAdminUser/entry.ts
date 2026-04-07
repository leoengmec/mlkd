import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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
    const { email, senha, nome } = await req.json();

    if (!email || !senha) {
      return Response.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    // Check if admin already exists
    const existing = await base44.asServiceRole.entities.admins.filter({ email }, '', 1);
    if (existing && existing.length > 0) {
      return Response.json({ error: 'Admin com este email já existe' }, { status: 409 });
    }

    // Hash password
    const senhaHash = await hashPassword(senha);

    // Create admin
    const admin = await base44.asServiceRole.entities.admins.create({
      email,
      senha_hash: senhaHash,
      nome: nome || email.split('@')[0],
      ativo: true,
      ultimo_acesso: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Admin criado com sucesso',
      admin: {
        id: admin.id,
        email: admin.email,
        nome: admin.nome,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});