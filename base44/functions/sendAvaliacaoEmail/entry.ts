import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import nodemailer from 'npm:nodemailer@6.9.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { avaliacao, isTest = false } = await req.json();

    // Get SMTP configs
    const configs = await base44.asServiceRole.entities.configs.list();
    const configMap = {};
    configs.forEach(c => configMap[c.chave] = c.valor);

    const smtpHost = configMap.smtp_host || 'smtp.gmail.com';
    const smtpPort = parseInt(configMap.smtp_port || '587');
    const smtpUser = configMap.smtp_user;
    const smtpPass = configMap.smtp_pass;
    const destinatario = configMap.email_alertas || 'valeriacavalcantiteixeira@yahoo.com.br';

    if (!smtpUser || !smtpPass) {
      console.warn('[sendAvaliacaoEmail] SMTP não configurado — email não enviado (smtp_user/smtp_pass ausentes em configs).');
      return Response.json({ success: false, skipped: true, message: 'SMTP não configurado, email não enviado' });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Format evaluation data
    const data = new Date(avaliacao.data_envio || new Date()).toLocaleDateString('pt-BR');
    const notasArray = avaliacao.notas_json ? Object.entries(avaliacao.notas_json)
      .filter(([_, v]) => v < 7)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ') : '';

    const temaCustom = avaliacao.tema && avaliacao.tema.startsWith('outro:')
      ? avaliacao.tema.replace('outro:', '')
      : avaliacao.tema;

    const body = `
Nova Avaliação Mulekada

👤 Nome: ${avaliacao.nome || 'Anônimo'}
📞 Telefone: ${avaliacao.telefone || 'Não informado'}
📅 Data da Festa: ${avaliacao.data_festa || 'Não informado'}
🎭 Tema: ${temaCustom || 'Não informado'}

⭐ NPS Geral: ${avaliacao.nps_geral}/10
${notasArray ? `⚠️ Notas Baixas: ${notasArray}` : ''}

👧 Idade da Criança: ${avaliacao.idade_crianca || 'Não informado'}
👥 Nº de Convidados: ${avaliacao.numero_convidados || 'Não informado'}
🎯 Motivo da Escolha: ${avaliacao.motivo_escolha?.join(', ') || 'Não informado'}
💰 Preço x Valor: ${avaliacao.preco_valor || 'Não informado'}/10
🎪 Próxima Festa: ${avaliacao.proxima_festa || 'Não informado'}

💡 Sugestões: ${avaliacao.texto_melhorar || 'Nenhuma'}
🤝 Indica Amigos: ${avaliacao.indica ? 'Sim' : 'Não'}
🎂 Faria Outra: ${avaliacao.refaz ? 'Sim' : 'Não'}

---
Envio: ${data}
    `;

    const mailOptions = {
      from: smtpUser,
      to: isTest ? smtpUser : destinatario,
      subject: isTest ? `[TESTE] Nova Avaliação Mulekada - ${data}` : `Nova Avaliação Mulekada - ${data}`,
      text: body
    };

    await transporter.sendMail(mailOptions);
    return Response.json({ success: true, message: 'Email enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});