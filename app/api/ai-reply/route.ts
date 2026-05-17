import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey || anthropicKey === 'your_anthropic_api_key') {
    return NextResponse.json({ error: 'Anthropic API Key nicht konfiguriert.' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey })

  const { reviewContent, authorName, rating, platform, style, businessName } = await request.json()

  const isPersonal = style === 'personal'

  const systemPrompt = isPersonal
    ? `Du bist ein herzlicher, authentischer Gastgeber/Unternehmer.
Schreibe IMMER auf Deutsch.
Deine Antworten auf Bewertungen sind:
- Persönlich und warmherzig, du sprichst den Reviewer direkt mit Vornamen an
- Emotional und echt, du freust dich wirklich über das Feedback
- Mit einem persönlichen Detail aus der Bewertung
- Einladend für einen nächsten Besuch
- 3-5 Sätze lang, kein Corporate-Sprech
- Bei negativen Bewertungen: einfühlsam, entschuldigend und lösungsorientiert
Beginne nie mit "Sehr geehrte/r" — nutze "Liebe/r [Name]"`
    : `Du bist ein professioneller, freundlicher Unternehmensvertreter.
Schreibe IMMER auf Deutsch.
Deine Antworten auf Bewertungen sind:
- Professionell aber warmherzig
- Sachlich positiv, ohne zu überschwänglich zu sein
- Dankbar und höflich
- 2-4 Sätze lang, klare Sprache
- Bei negativen Bewertungen: verständnisvoll, professionell und konstruktiv
Beginne mit "Vielen Dank für Ihre Bewertung" oder ähnlichem`

  const userPrompt = `Schreibe eine Antwort auf diese ${platform}-Bewertung:

Bewertung von: ${authorName}
Sterne: ${rating}/5
Text: "${reviewContent}"
${businessName ? `Unser Business: ${businessName}` : ''}

Schreibe nur die Antwort, keine Erklärung.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const reply = (message.content[0] as { type: string; text: string }).text

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('AI reply error:', err)
    return NextResponse.json({ error: 'KI-Antwort konnte nicht generiert werden.' }, { status: 500 })
  }
}
