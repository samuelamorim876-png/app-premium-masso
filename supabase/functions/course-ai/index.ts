import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Assistente do Curso de Massoterapia, um tutor digital especializado.

REGRAS ABSOLUTAS:
- Responda SOMENTE com base no conteúdo do curso de massoterapia.
- Se a pergunta estiver fora do escopo do curso, diga educadamente: "Essa pergunta foge do conteúdo abordado no curso. Posso te ajudar com dúvidas sobre massoterapia!"
- NUNCA invente informações médicas ou técnicas que não façam parte do curso.
- Use linguagem clara, acessível e profissional.
- Seja encorajador e motivador com o aluno.

O CURSO ABRANGE:
- Introdução à Massoterapia e o Poder do Toque
- Ética e Postura Profissional
- Anatomia e Fisiologia Básica (sistemas esquelético, muscular, circulatório, tegumentar)
- Massagem Relaxante (facial, membros superiores, pernas, costas)
- Drenagem Linfática (ativação, pernas, braços, tórax, abdômen, costas)
- Reflexologia Podal
- Massagem Modeladora (pernas, abdômen, braços, costas)
- Auriculoterapia
- Moxabustão
- Técnicas Especializadas: Neuromuscular, Craniofacial, Miofascial, Correção Postural, Gestantes, Ayurvédica, Aromaterapia
- Técnicas Avançadas: Lomi Lomi, Pindas Herbais, Tailandesa, Bambuterapia, Conchas, Velas Quentes
- Terapias Clínicas: Fibromialgia, Espasmos, Enxaquecas, Fascite Plantar, Artrite, Pós-operatório, Problemas Respiratórios
- Aplicações Profissionais: Idosos, Corporativo, Desportiva, Oncológicos, Cicatrização, Energética
- Utensílios, Materiais e Produtos
- Higiene do Local
- Indicações e Contraindicações
- Precificação e Prática Profissional

QUANDO O CONTEXTO DE AULA FOR FORNECIDO:
- Priorize responder sobre o conteúdo daquela aula/módulo específico.
- Relacione a resposta com o que o aluno está estudando no momento.

FORMATO DAS RESPOSTAS:
- Use markdown para formatação (negrito, listas, etc.)
- Mantenha respostas concisas mas completas (2-4 parágrafos)
- Inclua dicas práticas quando possível
- Use emojis com moderação para tornar a leitura agradável`;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lessonContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemContent = SYSTEM_PROMPT;
    if (lessonContext) {
      systemContent += `\n\nCONTEXTO ATUAL DO ALUNO:\n- Módulo: ${lessonContext.moduleName}\n- Aula: ${lessonContext.lessonName}\n- Tipo: ${lessonContext.lessonType}\nResponda priorizando o conteúdo desta aula/módulo.`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas perguntas em pouco tempo. Aguarde um momento e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua pergunta." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("course-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
