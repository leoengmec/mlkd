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

    const senhaHash = await hashPassword("Ame@4138");

    // Criar admin owner
    const admin = await base44.asServiceRole.entities.admins.create({
      email: "leoengmec@yahoo.com.br",
      senha_hash: senhaHash,
      nome: "Leonardo Alves (Owner)",
      ativo: true
    });

    return Response.json({ success: true, admin });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});