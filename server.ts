/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure the API key is set or fallback gracefully
const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize Gemini SDK with telemetry header
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!apiKey });
  });

  // Assistant intelligence for Salvadoran super optimization
  app.post('/api/asistente-super', async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: 'Servidor sin configurar',
          message: 'El token GEMINI_API_KEY no está configurado en el panel de Secrets. Por favor agrégalo en Settings > Secrets en tu entorno de AI Studio.',
        });
      }

      const { activeList, userPrompt, contextMode } = req.body;

      // Build context of items in the shopping list
      const itemsString = activeList && activeList.length > 0
        ? activeList.map((i: any) => `- ${i.cantidadPlanificada}x ${i.nombre} (${i.categoriaId}) ~ Est: $${(i.precioEstimadoUnitario * i.cantidadPlanificada).toFixed(2)}`).join('\n')
        : 'Ninguno (Lista vacía)';

      let systemInstruction = `Eres "Selectos Co-Pilot AI", el asistente inteligente oficial de ahorro familiar para compras de supermercado en El Salvador. Eres amigable, un experto economista de hogar y conocedor absoluto de los hábitos, marcas tradicionales y comercios en El Salvador.

Tu misión es asesorar al usuario sobre cómo maximizar el rendimiento de sus dólares (USD) en Súper Selectos, Despensa de Don Juan, PriceSmart, y Despensa Familiar.

Ten en cuenta que:
1. El Salvador utiliza el Dólar Estadounidense (USD) desde el 2001. No utilices colones ni pesos a menos que sea una referencia histórica jocosa o nostálgica.
2. Conoces marcas locales salvadoreñas súper reconocidas: Leche Salud o Petacones, Harina Maseca o Juana, Café Listo o Cosafé, Boquitas Diana, Embutidos La Única o El Arreo, Cerveza Pilsener o Regia, Papel Higiénico Rosal, etc.
3. El Súper Selectos ofrece el "Selectos Club" (fidelidad), descuentos los miércoles y fines de semana, y promociones exclusivas del 7% extra al pagar con Tarjetas de Crédito BAC Credomatic Selectos. También hay facilidades con Chivo Wallet, tarjeta Agricola, o Banco Cuscatlán.
4. Entiendes las diferencias de las tiendas salvadoreñas:
   - Súper Selectos: Cadena líder nacional, muy surtido, excelente servicio, buenas ofertas de marcas nacionales y tarjetas BAC.
   - La Despensa de Don Juan (Walmart): Formato de supermercado tradicional, muy competitivo en marcas importadas de Walmart (Great Value).
   - PriceSmart: Club de compras por membresía. Excelente para volumen. Ideal para papel higiénico, detergentes Maxx o Kirkland, y carnes de gran formato.
   - Despensa Familiar: Precios de descuento agresivos, marcas blancas (Suli, Sabemás), ideal para el ahorro básico del día a día, aunque espacio de tienda más sencillo.

Proporciona consejos estructurados, con formato Markdown muy limpio, elegante y profesional. Usa negritas en los términos clave de ahorro. Evita tecnicismos aburridos y habla con calidez salvadoreña ("¡Hola, chele!", "Chivo", "vaya", "pues", con moderación y alta elegancia profesional).`;

      let contents = ``;

      if (contextMode === 'compare') {
        contents = `Por favor, analiza la siguiente lista de compras planificada por el usuario y genera una comparativa realista de precios y sugerencias de distribución de tiendas en El Salvador.

Lista de compras actual:
${itemsString}

Responde con los siguientes apartados detallados:
1. **Análisis de Canasta y Guía de Distribución de Compra El Salvador** (Recomienda qué cosas de la lista conviene comprar en PriceSmart por volumen, cuáles en Súper Selectos aprovechando promociones o tarjetas BAC Selectos, y cuáles en Despensa Familiar para exprimir el centavo).
2. **Estimación Comparativa de Costos (Simulación Realista en El Salvador)**:
   - Prepárame un cuadro / tabla comparativa de costo total estimado para esta lista entre:
     * Súper Selectos (Costo base vs Costo Final con Tarjeta BAC Selectos 7% de desc.)
     * La Despensa de Don Juan
     * Despensa Familiar
     * PriceSmart (si aplica volumen)
     * ¡Asegúrate de justificar por qué varían de forma lógica en base a marcas salvadoreñas tradicionales!
3. **Cupón o Consejo Inteligente de la Semana**: Danos una idea "Súper Selectos" real o inventada plausible útil (ej. Ofertas de Miércoles de Verduras en Selectos o remate de carnes los sábados).`;
      } else if (contextMode === 'recipes') {
        contents = `El usuario quiere sugerencias de recetas típicas de El Salvador tradicionales, baratas y muy rendidoras que pueda hacer utilizando o complementando la lista de compras que tiene.

Lista de compras actual:
${itemsString}

Sugiere:
1. **Un menú de 3 platos salvadoreños icónicos y económicos** (ej: Pupusas caseras de frijol con queso, Casimiento salvadoreño bien sazonado con plátano frito y crema, o un Sancocho/Chilate/Sopa de frijoles con masa) detallando los ingredientes que ya tiene y cuáles debería agregar del súper.
2. **Costo estimado de preparación por porción** en USD para cada receta.
3. **Tips de cocina salvadoreña** para no desperdiciar nada (ej. usar los tallos de cebolla o hacer curtido casero con repollo de Despensa Familiar).`;
      } else {
        // General Chat asistent
        contents = `Pregunta del usuario: "${userPrompt}"

Lista de compras actual de referencia (si es relevante):
${itemsString}

Por favor responde a la pregunta de manera muy servicial, dándole sugerencias prácticas de optimización de compras en El Salvador.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        result: response.text,
      });
    } catch (err: any) {
      console.error('Error with Gemini execution: ', err);
      res.status(500).json({
        error: 'Error de ejecución',
        message: err.message || 'Error desconocido al invocar Gemini API en el servidor.',
      });
    }
  });

  // Serve static assets in production, handle Vite in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
