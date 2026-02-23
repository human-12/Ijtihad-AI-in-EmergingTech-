
# Ijtihad AI - Backend Setup Guide

Since this application runs entirely in the browser, we use **Google Sheets + Google Apps Script** as a serverless database and API.

### Step 1: Create the Database
1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name it `Ijtihad AI Database`.

### Step 2: Add the Backend Code
1. In the Google Sheet, go to **Extensions > Apps Script**.
2. Clear the default `myFunction`.
3. Copy the contents of `backend/Code.gs` (included in this project) and paste it into the editor.
4. Name the project `Ijtihad API`.
5. Click the **Save** icon (floppy disk).

### Step 3: Deploy as Web App
1. Click the **Deploy** button (top right) > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. **Configuration**:
   - **Description**: `v1`
   - **Execute as**: `Me` (your email)
   - **Who has access**: `Anyone` (Important: This allows the React app to access it without OAuth login prompts).
4. Click **Deploy**.
5. You will likely be asked to **Authorize Access**. Click "Review permissions", select your account, click "Advanced" > "Go to Ijtihad API (unsafe)" (it is safe, it's your own code) > "Allow".

### Step 4: Connect Frontend
1. Copy the **Web App URL** provided after deployment (starts with `https://script.google.com/macros/s/...`).
2. Open `services/sheetsService.ts` in your codebase.
3. Replace the `SHEETS_ENDPOINT` constant with your new URL.

```typescript
// services/sheetsService.ts
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

### Done!
Your application now has:
- **Persistent Memory**: Questions and answers are saved.
- **Active Learning**: Thumbs-up/Corrections are saved to a separate "Memory" sheet.
- **Retrieval**: The "The Archivist" agent will automatically search this memory before generating new answers.
