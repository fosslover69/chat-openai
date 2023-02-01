import fs from 'node:fs/promises'
import express from 'express'
import { OpenAIApi, Configuration } from 'openai';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

const configuration = new Configuration({
  organization: "org-OcpugI3unh7ZeCGJ7nI4bflg",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/ssr-manifest.json', 'utf-8')
  : undefined

// Create http server
const app = express()

// Add Vite or respective production middlewares
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}
app.use(bodyParser.json());

// Serve HTML
app.get('/', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    let template
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const rendered = await render(url, ssrManifest)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

app.post('/openai', async (req, res) => {
    const query = req.body.input
    let response = "";
    const request = await openai.createCompletion({
      model: "text-ada-001",
      prompt: query,
      max_tokens: 100,
      temperature: 0,
    });
    if (request.data.choices[0].text) {
      response = request.data.choices[0].text;
    }
    else {
          response="No response";
        }
  res.status(200).json({ message: response });
});
// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
