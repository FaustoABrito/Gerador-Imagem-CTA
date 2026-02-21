
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Tone, GenerationResult } from "../types";

export const editImage = async (
  sourceBase64: string,
  referenceBase64: string | null,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const sourceParts = sourceBase64.split(',');
  const sourceData = sourceParts[1];
  const sourceMimeType = sourceParts[0].split(':')[1].split(';')[0];

  const parts: any[] = [
    {
      inlineData: {
        data: sourceData,
        mimeType: sourceMimeType,
      },
    }
  ];

  if (referenceBase64) {
    const refParts = referenceBase64.split(',');
    const refData = refParts[1];
    const refMimeType = refParts[0].split(':')[1].split(';')[0];
    parts.push({
      inlineData: {
        data: refData,
        mimeType: refMimeType,
      },
    });
    parts.push({
      text: `Edit the first image using the style, lighting, and aesthetic of the second image as a high-fidelity reference. User instructions: ${prompt}. Ensure the output is visually balanced for a premium Instagram feed.`,
    });
  } else {
    parts.push({
      text: `Edit this image based on the following instruction: ${prompt}. Maintain professional quality and high visual balance for a social media feed.`,
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("O modelo não retornou uma imagem editada.");
};

export const generateMarketingCopy = async (
  context: string,
  tone: Tone,
  strongCTA: boolean
): Promise<GenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Você é um estrategista de conteúdo sênior de classe mundial, especializado em Instagram e Branding de Alta Conversão.
    Sua missão é criar postagens que dominem o feed através de um equilíbrio visual perfeito e linguagem psicológica estratégica.

    DIRETRIZES ESTRATÉGICAS:
    1. EQUILÍBRIO VISUAL: O 'mainText' deve ser curto (máximo 4 palavras) para maximizar o impacto estético.
    2. LINGUAGEM: Use gatilhos mentais (autoridade, escassez ou curiosidade) dependendo do tom.
    3. CTA (Call to Action): Se 'strongCTA' for verdadeiro, crie uma chamada imperativa e urgente. Se falso, use um convite suave.
    4. FORMATAÇÃO: O 'mainText' e o 'cta' DEVEM ser gerados em CAIXA ALTA (MAIÚSCULO).

    CONTEXTO DA CAMPANHA:
    Edição solicitada: "${context}".
    Tom: ${tone}.
    CTA Ultra-Forte: ${strongCTA ? 'ATIVADO (SER AGRESSIVO NA CONVERSÃO)' : 'DESATIVADO (SER CONVIDATIVO)'}.

    SAÍDA: JSON obrigatório.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Gere a estratégia de conteúdo para este post.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualPrompt: { 
            type: Type.STRING,
            description: "Descrição técnica do estilo visual gerado."
          },
          mainText: { 
            type: Type.STRING,
            description: "Texto de impacto para a imagem em MAIÚSCULO."
          },
          cta: { 
            type: Type.STRING, 
            nullable: true,
            description: "Botão de ação estratégica em MAIÚSCULO."
          },
          caption: { 
            type: Type.STRING,
            description: "Legenda estruturada com storytelling e hashtags."
          },
        },
        required: ["visualPrompt", "mainText", "caption"]
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Falha ao gerar o conteúdo estratégico.");
  return JSON.parse(text) as GenerationResult;
};
