import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { admin_id, admin_email, acao, tabela, record_id, detalhes } = await req.json();

    if (!admin_id || !acao) {
      return Response.json({ error: "Parâmetros obrigatórios faltando" }, { status: 400 });
    }

    // Criar ou buscar entity auditoria
    const logEntry = {
      admin_id,
      admin_email,
      acao, // create, update, delete, login, logout
      tabela, // perguntas, temas, avaliacoes, etc
      record_id,
      detalhes: JSON.stringify(detalhes),
      timestamp: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown",
    };

    // Se existir entidade auditoria, salvar. Caso contrário, apenas logar
    try {
      await base44.asServiceRole.entities.auditoria.create(logEntry);
    } catch {
      console.log("[AUDIT]", logEntry);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});