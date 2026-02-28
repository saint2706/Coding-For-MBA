import { handleEmbed, withErrorHandling } from './_shared.js'

export default async function embed(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  await withErrorHandling(handleEmbed, req, res)
}
