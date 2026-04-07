import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { avaliacaoId } = await req.json();

    if (!avaliacaoId) {
      return Response.json({ error: 'ID da avaliação obrigatório' }, { status: 400 });
    }

    // Buscar avaliação antes de deletar (para log)
    const avaliacao = await base44.entities.avaliacoes.list('', 1);
    const toDelete = avaliacao.find(a => a.id === avaliacaoId);

    if (!toDelete) {
      return Response.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    // Deletar
    await base44.entities.avaliacoes.delete(avaliacaoId);

    // Log auditoria
    await base44.asServiceRole.entities.auditoria.create({
      admin_id: user.id,
      admin_email: user.email,
      acao: 'delete',
      tabela: 'avaliacoes',
      record_id: avaliacaoId,
      detalhes: JSON.stringify({
        nome: toDelete.nome,
        telefone: toDelete.telefone,
        tema: toDelete.tema,
        nps_geral: toDelete.nps_geral
      }),
      timestamp: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 'unknown'
    });

    return Response.json({ success: true, message: 'Avaliação deletada com sucesso' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});