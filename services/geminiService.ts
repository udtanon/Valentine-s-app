import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMagicFlower = async (flowerType: string, flowerColor: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A beautiful, single ${flowerColor} ${flowerType} in a charming hand-drawn animation style. 
                 Think Studio Ghibli or classic watercolor animation. Soft, delicate line art, expressive brushstrokes, 
                 gentle lighting, and a soft minimalist background. Masterpiece quality, artistic and romantic.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateBouquet = async (flowerType: string, flowerColor: string, recipientName: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A lush, overflowing bouquet of many ${flowerColor} ${flowerType}s in a charming hand-drawn animation style. 
                 The bouquet is beautifully arranged, wrapped in soft decorative paper with a silky ribbon. 
                 Tucked into the flowers is a small, elegant cream-colored card that has the name "${recipientName}" written on it in beautiful, clear cursive calligraphy. 
                 Think Studio Ghibli or classic watercolor animation. Soft, delicate line art, expressive brushstrokes, 
                 gentle lighting, and a soft minimalist background. Masterpiece quality, artistic and romantic.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateComicStrip = async (girlPhotoBase64: string, guyPhotoBase64: string | null, flowerType: string, flowerColor: string) => {
  const ai = getAI();
  
  const parts: any[] = [
    {
      text: `Create a high-quality 4-panel comic strip in a strict 2x2 grid layout. 
             
             VISUAL STYLE (STRICT):
             The entire image must look like a charming hand-drawn animation, specifically Studio Ghibli or classic watercolor animation style. 
             Use soft, delicate line art, expressive brushstrokes, gentle lighting, and soft minimalist backgrounds. 
             The colors should be pastel and romantic. Masterpiece quality, artistic and romantic. 
             Do NOT use realistic 3D rendering or harsh photorealism. It must look like a painting or a frame from an anime movie. Matches the style of a delicate watercolor flower painting.

             CHARACTERS:
             - THE GIRL: Based on the provided photo but adapted into this soft hand-drawn anime/watercolor style. She has her distinct features (hair, glasses, etc) but rendered artistically.
             - THE GUY: ${guyPhotoBase64 ? "Based on the provided photo, adapted into the same soft hand-drawn style." : "A kind, handsome young man with friendly features in the same style."}
             
             STORYLINE & LAYOUT (Strict 2x2 Grid):
             Panel 1 (Top Left): The guy is standing in a cozy, soft-lit room, looking nervously but lovingly at the girl. He is asking "Will you be my Valentine?". He is hiding a large bouquet of ${flowerColor} ${flowerType}s behind his back.
             Panel 2 (Top Right): A close-up of the girl's face. She is looking incredibly happy and surprised, blushing slightly, her eyes sparkling, shouting "YES!".
             Panel 3 (Bottom Left): The guy smiling widely as he brings the beautiful bouquet of ${flowerColor} ${flowerType}s from behind his back and offers it to her. The girl gasps with pure joy.
             Panel 4 (Bottom Right): A warm, heartfelt hug between the two. The girl is holding the ${flowerColor} ${flowerType} bouquet close to her heart.
             
             Include clear speech bubbles for the dialogue. The final image must be a single vertical page containing all 4 panels in a 2x2 grid format. Maintain the soft, artistic watercolor feel throughout.`
    }
  ];

  // Add the girl's photo (mandatory)
  parts.push({
    inlineData: {
      mimeType: "image/jpeg",
      data: girlPhotoBase64.split(',')[1] 
    }
  });

  // Add the guy's photo (optional reference)
  if (guyPhotoBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: guyPhotoBase64.split(',')[1]
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "3:4" 
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};