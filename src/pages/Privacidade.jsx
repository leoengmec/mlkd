import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Política de Privacidade
          </h1>
        </div>

        <article className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="font-heading text-xl font-bold mb-3">1. Introdução</h2>
            <p>
              A Mulekada Buffet ("nós", "nosso" ou "empresa") respeita a privacidade de seus usuários. 
              Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos 
              suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">2. Dados que Coletamos</h2>
            <p>Coletamos as seguintes informações:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Dados obrigatórios</strong>: Nome (para identificação)</li>
              <li><strong>Dados opcionais</strong>: Telefone, data festa, tema, idade criança, número convidados</li>
              <li><strong>Avaliações</strong>: Notas numéricas (0-10), texto livre, respostas checkbox</li>
              <li><strong>Dados técnicos</strong>: IP, user-agent (logs de acesso)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">3. Base Legal (LGPD Art. 7)</h2>
            <p>Processamos seus dados com base em:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Consentimento</strong>: Você autoriza explicitamente ao enviar o formulário</li>
              <li><strong>Interesse legítimo</strong>: Melhorar serviços e segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">4. Uso dos Dados</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Análise de satisfação (NPS, gráficos, inteligência artificial)</li>
              <li>Melhoria contínua de serviços</li>
              <li>Comunicações sobre atualizações (se autorizado)</li>
              <li>Cumprimento legal e segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">5. Retenção de Dados</h2>
            <p>
              Seus dados são retidos por <strong>2 anos</strong> após coleta. Após este período, 
              são automaticamente deletados de nossos sistemas. Você pode solicitar exclusão anterior.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">6. Seus Direitos LGPD (Art. 18)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Acesso</strong>: Consultar seus dados coletados</li>
              <li><strong>Exclusão</strong>: Solicitar remoção de seus dados</li>
              <li><strong>Portabilidade</strong>: Transferir dados em formato estruturado</li>
              <li><strong>Retificação</strong>: Corrigir informações incorretas</li>
            </ul>
            <p className="mt-3 font-semibold">
              Para exercer direitos: entre em <Link to="/meus-dados" className="text-primary hover:underline">Meus Dados</Link>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">7. Compartilhamento de Dados</h2>
            <p>
              Seus dados <strong>não são compartilhados</strong> com terceiros, exceto:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Processadores de dados (serviços de email com Data Processing Agreement)</li>
              <li>Requisição legal (decisão judicial)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">8. Segurança</h2>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Criptografia TLS em trânsito (HTTPS)</li>
              <li>Hash de senhas administrativas (SHA-256)</li>
              <li>Controle de acesso baseado em roles (RBAC)</li>
              <li>Logs de auditoria (6 meses retenção)</li>
              <li>Rate-limiting contra ataques (brute-force)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">9. Cookies</h2>
            <p>
              Utilizamos cookies para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Armazenar consentimento LGPD</li>
              <li>Sessão administrativa (segurança)</li>
            </ul>
            <p className="mt-3 text-sm">
              Você pode desabilitar cookies nas configurações do navegador. 
              Banner de consentimento é exibido na primeira visita.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">10. Contato</h2>
            <p>
              <strong>Responsável pelos dados:</strong> Mulekada Buffet<br/>
              <strong>Email:</strong> contato@mulekada.com.br
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mb-3">11. Alterações na Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. 
              Notificaremos sobre mudanças materiais via email ou banner.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString("pt-BR")}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}