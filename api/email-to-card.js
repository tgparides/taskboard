import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify shared secret
  const authHeader = req.headers['x-webhook-secret']
  if (authHeader !== process.env.EMAIL_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { boardCode, subject, body, from, attachments } = req.body

  if (!boardCode || !subject) {
    return res.status(400).json({ error: 'Missing boardCode or subject' })
  }

  try {
    // Look up board by email_code
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('email_code', boardCode.toLowerCase())
      .single()

    if (boardError || !board) {
      return res.status(404).json({ error: `No board found with code: ${boardCode}` })
    }

    // Get the first column (lowest position) for this board
    const { data: column, error: colError } = await supabase
      .from('columns')
      .select('id')
      .eq('board_id', board.id)
      .order('position', { ascending: true })
      .limit(1)
      .single()

    if (colError || !column) {
      return res.status(404).json({ error: 'Board has no columns. Create a column first.' })
    }

    // Get the next position in the column (add to top)
    const { data: topCard } = await supabase
      .from('cards')
      .select('position')
      .eq('column_id', column.id)
      .order('position', { ascending: true })
      .limit(1)
      .single()

    const position = topCard ? topCard.position / 2 : 65536

    // Build description from email
    const description = [
      from ? `**From:** ${from}` : null,
      '',
      body || '',
    ].filter(v => v !== null).join('\n')

    // Create the card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        column_id: column.id,
        title: subject.substring(0, 500),
        description: description.substring(0, 10000),
        position,
      })
      .select('id')
      .single()

    if (cardError) {
      console.error('Error creating card:', cardError)
      return res.status(500).json({ error: 'Failed to create card' })
    }

    return res.status(200).json({ success: true, cardId: card.id })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
