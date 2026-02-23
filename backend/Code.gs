
/**
 * IJTIHAD AI - BACKEND LOGIC
 * --------------------------
 * This script runs on Google Apps Script servers attached to your Google Sheet.
 * It acts as the API Gateway, Database Controller, and Active Learning Filter.
 */

const SHEET_LOGS = 'Logs';
const SHEET_MEMORY = 'Memory';

/**
 * Handle Incoming Search Requests (Retrieval)
 * Usage: GET <SCRIPT_URL>?topic=search_term
 */
function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); 

  try {
    const topic = e.parameter.topic;
    if (!topic) {
      return createJSONOutput({ error: 'No topic provided' });
    }

    const memorySheet = getOrCreateSheet(SHEET_MEMORY);
    const data = memorySheet.getDataRange().getValues();
    
    // Headers: [Timestamp, Category, Question, Answer, Keywords, Score]
    const rows = data.slice(1);

    const queryTokens = topic.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    
    const matches = rows.map(row => {
      // Handle legacy rows without category by checking length
      // New schema: [Timestamp, Category, Question, Answer, Keywords, Weight]
      // Old schema: [Timestamp, Question, Answer, Keywords, Weight]
      const hasCategory = row.length >= 6;
      
      const q = String(hasCategory ? row[2] : row[1]).toLowerCase();
      const keywords = String(hasCategory ? row[4] : row[3]).toLowerCase();
      const cat = hasCategory ? String(row[1]) : 'QA';
      
      let score = 0;
      queryTokens.forEach(token => {
        if (q.includes(token)) score += 3;
        if (keywords.includes(token)) score += 1;
        if (cat.toLowerCase().includes(token)) score += 2;
      });

      return {
        question: hasCategory ? row[2] : row[1],
        answer: hasCategory ? row[3] : row[2],
        score: score,
        category: cat
      };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score) 
    .slice(0, 3); 

    return createJSONOutput(matches);

  } catch (error) {
    return createJSONOutput({ error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle Incoming Logs & Feedback (Active Learning)
 * Usage: POST <SCRIPT_URL> payload={...}
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    const timestamp = new Date();
    const category = data.category || 'QA'; // Default to QA if missing
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = getOrCreateSheet(SHEET_LOGS);
    const memorySheet = getOrCreateSheet(SHEET_MEMORY);

    // 1. Log the Interaction (Audit Trail)
    // Schema: [Timestamp, Category, Question, Answer, Score, Correction]
    logSheet.appendRow([
      timestamp, 
      category,
      data.question, 
      data.answer, 
      data.score, 
      data.correction || ''
    ]);

    // 2. Active Learning Logic
    if (data.score === 1 || (data.score === -1 && data.correction)) {
      
      const finalAnswer = data.correction ? data.correction : data.answer;
      const keywords = extractKeywords(data.question);

      // Schema: [Timestamp, Category, Question, Answer, Keywords, Weight]
      memorySheet.appendRow([
        timestamp,
        category,
        data.question,
        finalAnswer, 
        keywords,
        data.score === -1 ? 2 : 1 
      ]);
    }

    return createJSONOutput({ status: 'success', message: 'Interaction Logged & Learned' });

  } catch (error) {
    return createJSONOutput({ status: 'error', message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// --- HELPER FUNCTIONS ---

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Initialize Headers
    if (name === SHEET_LOGS) {
      sheet.appendRow(['Timestamp', 'Category', 'Question', 'Answer', 'Score', 'Correction']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f3f4f6');
    } else if (name === SHEET_MEMORY) {
      sheet.appendRow(['Timestamp', 'Category', 'Question', 'Answer', 'Keywords', 'Weight']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#d1fae5');
    }
  }
  return sheet;
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function extractKeywords(text) {
  const stopWords = ['is', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'what', 'how', 'can', 'i'];
  return text.toLowerCase()
    .split(/\s+/)
    .filter(w => !stopWords.includes(w) && w.length > 3)
    .join(', ');
}
