import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const questions = [
      { titulo: "Seu nome", tipo: "texto", ordem: 1, max_chars: 100, obrigatorio: true, ativo: true },
      { titulo: "Telefone para contato", tipo: "texto", ordem: 2, max_chars: 15, obrigatorio: true, ativo: true },
      { titulo: "Data da festa", tipo: "date", ordem: 3, obrigatorio: false, ativo: true },
      { titulo: "Tema da festa", tipo: "dropdown_temas", ordem: 4, obrigatorio: false, ativo: true },
      { titulo: "Idade da criança", tipo: "dropdown", ordem: 5, opcoes: ["1-3 anos", "4-6 anos", "7+ anos"], obrigatorio: false, ativo: true },
      { titulo: "Número de convidados", tipo: "dropdown", ordem: 6, opcoes: ["Menos de 20", "20 a 50", "Mais de 50"], obrigatorio: false, ativo: true },
      { titulo: "Nota Geral (NPS)", tipo: "slider", ordem: 7, escala_min: 0, escala_max: 10, obrigatorio: true, ativo: true },
      { titulo: "Reserva / Contato", tipo: "slider", ordem: 8, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Monitores", tipo: "slider", ordem: 9, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Garçonetes", tipo: "slider", ordem: 10, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Supervisora", tipo: "slider", ordem: 11, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Recepção", tipo: "slider", ordem: 12, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Buffet", tipo: "slider", ordem: 13, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Climatização", tipo: "slider", ordem: 14, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Limpeza", tipo: "slider", ordem: 15, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Alimentos", tipo: "slider", ordem: 16, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Brinquedos", tipo: "slider", ordem: 17, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Indicaria o Mulekada para amigos?", tipo: "checkbox", ordem: 18, obrigatorio: false, ativo: true },
      { titulo: "Faria outra festa conosco?", tipo: "checkbox", ordem: 19, obrigatorio: false, ativo: true },
      { titulo: "O que podemos melhorar?", tipo: "texto", ordem: 20, max_chars: 500, obrigatorio: false, ativo: true },
      { titulo: "Por que escolheu o Mulekada?", tipo: "multipla", ordem: 21, opcoes: ["Preço", "Local", "Amigos recomendaram", "Rede social", "Animação"], obrigatorio: false, ativo: true },
      { titulo: "Preço x Valor", tipo: "slider", ordem: 22, escala_min: 0, escala_max: 10, obrigatorio: false, ativo: true },
      { titulo: "Quando faria a próxima festa?", tipo: "dropdown", ordem: 23, opcoes: ["Em 3 meses", "Em 6 meses", "Em 12 meses", "Não sei"], obrigatorio: false, ativo: true },
    ];

    const created = await base44.asServiceRole.entities.perguntas.bulkCreate(questions);

    return Response.json({
      success: true,
      message: `${created.length} perguntas criadas com sucesso`,
      count: created.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});