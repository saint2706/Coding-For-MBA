import { handleGenerate, withErrorHandling } from './_shared.js'

export default async function generate(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  await withErrorHandling(handleGenerate, req, res)
}
