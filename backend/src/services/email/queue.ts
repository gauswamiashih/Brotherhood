import { db } from '../../config/db';
import { sendEmailImmediate } from './email.service';

let isProcessing = false;
let queueInterval: NodeJS.Timeout | null = null;

// Core queue polling logic
export const processEmailQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    // Fetch pending emails or retryable failed emails
    const res = await db.query(
      `SELECT id FROM email_logs 
       WHERE status = 'pending' 
          OR (status = 'failed' AND retry_count < max_retries)
       ORDER BY created_at ASC 
       LIMIT 10`
    );

    if (res.rows.length > 0) {
      console.log(`[Queue Worker] Processing ${res.rows.length} queued email tasks...`);
      for (const row of res.rows) {
        await sendEmailImmediate(row.id);
      }
    }
  } catch (error) {
    console.error('[Queue Worker] Error running queue batch:', error);
  } finally {
    isProcessing = false;
  }
};

// Initialize the background runner interval
export const startEmailQueueWorker = (intervalMs: number = 8000) => {
  if (queueInterval) return;
  console.log(`[Queue Worker] Starting background email processing thread (polling every ${intervalMs / 1000}s)...`);
  
  // Run immediate processing once on startup
  setTimeout(() => {
    processEmailQueue().catch(err => console.error('[Queue Worker] Startup process error:', err));
  }, 1000);

  queueInterval = setInterval(async () => {
    await processEmailQueue();
  }, intervalMs);
};

// Stop queue worker safely
export const stopEmailQueueWorker = () => {
  if (queueInterval) {
    clearInterval(queueInterval);
    queueInterval = null;
    console.log('[Queue Worker] Background email processing thread stopped.');
  }
};
