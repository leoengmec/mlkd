import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Proxy CRUD para entidades admin — usa service role para bypassar RLS.
 * Payload: { entity, operation, data, id, filter, sort, limit }
 * operations: create | update | delete | list | bulkCreate | filter
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity, operation, data, id, limit, filter, sort } = await req.json();

    const ALLOWED_ENTITIES = ["temas", "perguntas", "admins", "avaliacoes", "opcoes_convidados", "configs", "tarefas", "comentarios_tarefas", "links_avaliacao", "auditoria"];
    if (!ALLOWED_ENTITIES.includes(entity)) {
      return Response.json({ error: `Entidade '${entity}' não permitida` }, { status: 400 });
    }

    const db = base44.asServiceRole.entities[entity];
    let result;

    switch (operation) {
      case "create":
        result = await db.create(data);
        console.log(`[adminCrudProxy] create ${entity}:`, result?.id);
        break;
      case "bulkCreate":
        result = await db.bulkCreate(data);
        console.log(`[adminCrudProxy] bulkCreate ${entity}: ${data?.length} registros`);
        break;
      case "update":
        result = await db.update(id, data);
        console.log(`[adminCrudProxy] update ${entity} id=${id}`);
        break;
      case "delete":
        result = await db.delete(id);
        console.log(`[adminCrudProxy] delete ${entity} id=${id}`);
        break;
      case "list":
        result = await db.list(sort || "-created_date", limit || 1000);
        console.log(`[adminCrudProxy] list ${entity}: ${result?.length} registros`);
        break;
      case "filter":
        result = await db.filter(filter || {}, sort || "-created_date", limit || 1000);
        console.log(`[adminCrudProxy] filter ${entity}: ${result?.length} registros`);
        break;
      default:
        return Response.json({ error: `Operação '${operation}' inválida` }, { status: 400 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("[adminCrudProxy] Erro:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});