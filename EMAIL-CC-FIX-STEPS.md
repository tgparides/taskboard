# TaskBoard Email-to-Card — CC Fix Steps

**Problem:** Emails that CC'd the board address (instead of putting it in "To")
were not creating cards. The Apps Script only read the To field, so it never
saw the board code and skipped the email.

The code fix is already pushed to GitHub. But the Google Apps Script does NOT
auto-deploy — you must update it in Google, then recover the stuck emails.

---

## Step 1 — Update the live Apps Script (this is what actually fixes it)

1. Log into **signstaskboard@gmail.com**.
2. Go to **https://script.google.com** and open the **TaskBoard** project.
3. In the `processEmails` function, find this block:

```js
const toAddress = message.getTo() || ''
const boardCode = extractBoardCode(toAddress)

if (!boardCode) {
  Logger.log('No board code found in: ' + toAddress)
  continue
}
```

4. Replace it with this:

```js
const recipients = [message.getTo(), message.getCc(), message.getBcc()]
  .filter(Boolean)
  .join(', ')
const boardCode = extractBoardCode(recipients)

if (!boardCode) {
  Logger.log('No board code found in: ' + recipients)
  continue
}
```

5. Click **Save** (the disk icon). No need to re-run `setup()` — the existing
   1-minute trigger keeps running.

> Tip: Instead of editing just that block, you can copy the whole updated
> `google-apps-script.js` from the repo over the old code — BUT keep your real
> `WEBHOOK_SECRET` value (the repo file shows a `CHANGE_ME` placeholder).

---

## Step 2 — Recover the emails that already got stuck

The script tags every email it looks at with a **`processed`** label, even when
it found no board code. So Donna's and Cody's CC'd emails are already tagged
`processed` and won't be retried automatically.

To bring them in:

1. In **signstaskboard@gmail.com**, search: `label:processed`
   (or search `from:donna` / `from:cody`).
2. On the emails that should have become cards:
   - **Remove the `processed` label**
   - **Mark them as Unread**
3. Within about 1 minute, the script will pick them up and create the
   columns/cards on the right boards.

> Faster option for just a few: have them **forward those emails again**. This
> time it won't matter whether the board address is in To or CC.

---

## Why it happened

The script only checked the **To** field for `signstaskboard+<boardcode>@gmail.com`.
When someone put a person in **To** and CC'd the board address, the board code
was never seen → no card created, and the thread got marked `processed` so it
never retried. Checking the CC and BCC fields fixes it going forward.
