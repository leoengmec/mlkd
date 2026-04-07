import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return Response.json({ error: 'ID obrigatório' }, { status: 400 });
    }

    // Buscar avaliação
    const avaliacao = await base44.entities.avaliacoes.filter({ id }, '', 1);
    
    if (!avaliacao || avaliacao.length === 0) {
      return Response.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    // Verificar se pertence ao usuário
    if (avaliacao[0].created_by !== user.email) {
      return Response.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Deletar
    await base44.entities.avaliacoes.delete(id);

    // Log
    try {
      await base44.functions.invoke('logAuditoria', {
        admin_id: user.id,
        admin_email: user.email,
        acao: 'delete',
        tabela: 'avaliacoes',
        record_id: id,
        detalhes: { client_self_delete: true },
      });
    } catch {
      console.log('[LOG] Delete avaliação por cliente:', id);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});