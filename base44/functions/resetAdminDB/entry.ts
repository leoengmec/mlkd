import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    async function hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    // Limpar admins antigos
    const admins = await base44.asServiceRole.entities.admins.list("", 100);
    for (const admin of admins) {
      await base44.asServiceRole.entities.admins.delete(admin.id);
    }

    // Criar novo admin
    const senhaHash = await hashPassword("Ame@4138");
    const newAdmin = await base44.asServiceRole.entities.admins.create({
      email: "leoengmec@yahoo.com.br",
      senha_hash: senhaHash,
      nome: "Leonardo Alves",
      ativo: true
    });

    return Response.json({ 
      success: true, 
      message: "Admin resetado com sucesso",
      admin: { email: newAdmin.email, id: newAdmin.id }
    });
  } catch (error) {
    console.error("Erro ao resetar admin:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});