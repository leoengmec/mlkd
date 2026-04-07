import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Seed temas (15 default themes)
    const temasDefault = [
      "Princesa", "Super-heróis", "Fazendinha", "Minecraft", "Unicórnio",
      "Dinos", "Paw Patrol", "Frozen", "Carros", "Jurassic World",
      "Meninas Poderosas", "Bob Esponja", "Peppa Pig", "Turma da Mônica", "Futebol"
    ];

    const existingTemas = await base44.asServiceRole.entities.temas.list();
    if (existingTemas.length === 0) {
      await Promise.all(temasDefault.map(nome =>
        base44.asServiceRole.entities.temas.create({ nome, ativo: true })
      ));
    }

    // Seed opcoes_convidados (3 default options)
    const opcoesDefault = [
      { nome: "<20", ativo: true },
      { nome: "20-50", ativo: true },
      { nome: "50+", ativo: true }
    ];

    const existingOpcoes = await base44.asServiceRole.entities.opcoes_convidados.list();
    if (existingOpcoes.length === 0) {
      await Promise.all(opcoesDefault.map(opcao =>
        base44.asServiceRole.entities.opcoes_convidados.create(opcao)
      ));
    }

    return Response.json({ success: true, message: 'Default data seeded' });
  } catch (error) {
    console.error('Error seeding data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});