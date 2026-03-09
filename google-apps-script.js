// ============================================================
// Google Apps Script — Email-to-Card for TaskBoard
// ============================================================
// 1. Go to https://script.google.com while logged into signstaskboard@gmail.com
// 2. Create a new project, paste this entire file
// 3. Update WEBHOOK_URL and WEBHOOK_SECRET below
// 4. Run setup() once (it will ask for Gmail permissions)
// 5. Emails sent to signstaskboard+<boardcode>@gmail.com will create cards
// ============================================================

const WEBHOOK_URL = 'https://taskboard-xi-seven.vercel.app/api/email-to-card'
const WEBHOOK_SECRET = 'CHANGE_ME_TO_A_RANDOM_STRING' // Must match EMAIL_WEBHOOK_SECRET env var in Vercel

// Label used to track processed emails
const PROCESSED_LABEL = 'processed'

function setup() {
  // Create the 'processed' label if it doesn't exist
  let label = GmailApp.getUserLabelByName(PROCESSED_LABEL)
  if (!label) {
    label = GmailApp.createLabel(PROCESSED_LABEL)
  }

  // Set up a time-based trigger to run every 2 minutes
  const triggers = ScriptApp.getProjectTriggers()
  const existing = triggers.find(t => t.getHandlerFunction() === 'processEmails')
  if (!existing) {
    ScriptApp.newTrigger('processEmails')
      .timeBased()
      .everyMinutes(2)
      .create()
  }

  Logger.log('Setup complete! Trigger will run every 2 minutes.')
}

function processEmails() {
  const processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL)
  if (!processedLabel) {
    Logger.log('No processed label found. Run setup() first.')
    return
  }

  // Search for unread emails NOT already processed
  const threads = GmailApp.search('is:unread -label:' + PROCESSED_LABEL, 0, 20)

  for (const thread of threads) {
    const messages = thread.getMessages()

    for (const message of messages) {
      if (message.isUnread()) {
        try {
          const toAddress = message.getTo() || ''
          const boardCode = extractBoardCode(toAddress)

          if (!boardCode) {
            Logger.log('No board code found in: ' + toAddress)
            continue
          }

          const subject = message.getSubject() || '(No Subject)'
          const body = message.getPlainBody() || ''
          const from = message.getFrom() || ''

          // Send to webhook
          const response = UrlFetchApp.fetch(WEBHOOK_URL, {
            method: 'post',
            contentType: 'application/json',
            headers: {
              'x-webhook-secret': WEBHOOK_SECRET,
            },
            payload: JSON.stringify({
              boardCode: boardCode,
              subject: subject,
              body: body.substring(0, 10000), // Limit body size
              from: from,
            }),
            muteHttpExceptions: true,
          })

          const status = response.getResponseCode()
          const result = response.getContentText()
          Logger.log('Board: ' + boardCode + ' | Status: ' + status + ' | ' + result)

          if (status === 200) {
            message.markRead()
          }
        } catch (err) {
          Logger.log('Error processing message: ' + err.message)
        }
      }
    }

    // Mark thread as processed
    thread.addLabel(processedLabel)
  }
}

function extractBoardCode(toAddress) {
  // Parse signstaskboard+boardcode@gmail.com
  // toAddress might contain multiple addresses or display names
  const match = toAddress.match(/signstaskboard\+([a-zA-Z0-9_-]+)@gmail\.com/i)
  return match ? match[1].toLowerCase() : null
}

// Manual test function — run this to verify the webhook works
function testWebhook() {
  const response = UrlFetchApp.fetch(WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-webhook-secret': WEBHOOK_SECRET,
    },
    payload: JSON.stringify({
      boardCode: 'test',
      subject: 'Test email card',
      body: 'This is a test card created from Google Apps Script.',
      from: 'test@example.com',
    }),
    muteHttpExceptions: true,
  })

  Logger.log('Status: ' + response.getResponseCode())
  Logger.log('Response: ' + response.getContentText())
}
