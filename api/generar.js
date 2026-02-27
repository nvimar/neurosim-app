export default async function handler(req, res) {
  // 1. Asegurarnos de que recibimos la pregunta
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo se permite POST' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Verificar que Vercel tenga la clave secreta
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la API Key en Vercel' });
  }

  // 3. Conectarse a Gemini
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en la API de Gemini');
    }

    // 4. Extraer el texto de la respuesta y darle formato HTML básico
    const texto = data.candidates[0].content.parts[0].text;
    const htmlTexto = texto.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 5. Enviar la respuesta a tu página web
    res.status(200).json({ respuesta: htmlTexto });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la respuesta', detalle: error.message });
  }
}
