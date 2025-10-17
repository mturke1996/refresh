import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8209898561:AAEk7XWHqfMSR-Y0n1dwaLngGzSqr8FRR_w';

/**
 * Send order notification to Telegram
 * This function is called when a new order is placed
 */
export const sendOrderToTelegram = functions.https.onCall(async (data, context) => {
  try {
    const { orderId } = data;

    if (!orderId) {
      throw new functions.https.HttpsError('invalid-argument', 'Order ID is required');
    }

    // Get order from Firestore
    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    const order = orderDoc.data();
    if (!order) {
      throw new functions.https.HttpsError('not-found', 'Order data is empty');
    }

    // Get Telegram settings from Firestore
    const settingsDoc = await db.collection('settings').doc('general').get();
    const settings = settingsDoc.data();

    if (!settings || !settings.telegramChatIds || settings.telegramChatIds.length === 0) {
      functions.logger.warn('No Telegram chat IDs configured');
      return { success: false, message: 'No Telegram recipients configured' };
    }

    // Get bot token from functions config
    const telegramToken = functions.config().telegram?.token;

    if (!telegramToken) {
      functions.logger.error('Telegram bot token not configured');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Telegram bot token not configured'
      );
    }

    // Format order message
    const message = formatOrderMessage(order, orderId);

    // Send to all configured chat IDs
    const sendPromises = settings.telegramChatIds.map((chatId: string) =>
      sendTelegramMessage(telegramToken, chatId, message)
    );

    await Promise.all(sendPromises);

    // Log successful notification
    await db.collection('admin_logs').add({
      action: 'telegram_notification_sent',
      details: `Order ${orderId} sent to ${settings.telegramChatIds.length} recipients`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    functions.logger.error('Error sending Telegram notification:', error);

    // Log error
    await db.collection('admin_logs').add({
      action: 'telegram_notification_failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

/**
 * Format order data into a readable Telegram message
 */
function formatOrderMessage(order: any, orderId: string): string {
  const orderTypeLabels: { [key: string]: string } = {
    'dine-in': 'داخل المقهى',
    pickup: 'استلام',
    delivery: 'توصيل',
  };

  const statusLabels: { [key: string]: string } = {
    pending: '⏳ قيد الانتظار',
    confirmed: '✅ مؤكد',
    preparing: '👨‍🍳 قيد التحضير',
    ready: '🎉 جاهز',
    delivered: '🚚 تم التوصيل',
    cancelled: '❌ ملغي',
  };

  let message = `🔔 *طلب جديد - Refresh Cafe*\n\n`;
  message += `📝 رقم الطلب: \`${orderId.slice(-8)}\`\n`;
  message += `📊 الحالة: ${statusLabels[order.status] || order.status}\n`;
  message += `📦 نوع الطلب: ${orderTypeLabels[order.type] || order.type}\n`;
  message += `⏰ الوقت: ${new Date(order.createdAt._seconds * 1000).toLocaleString('ar-SA')}\n\n`;

  message += `👤 *بيانات العميل:*\n`;
  message += `الاسم: ${order.customer.name}\n`;
  message += `الهاتف: ${order.customer.phone}\n`;

  if (order.customer.address) {
    message += `العنوان: ${order.customer.address}\n`;
  }

  if (order.customer.notes) {
    message += `ملاحظات: ${order.customer.notes}\n`;
  }

  message += `\n🛒 *المنتجات:*\n`;
  order.items.forEach((item: any) => {
    message += `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} ر.س\n`;
  });

  message += `\n💰 *الإجمالي: ${order.total} ر.س*`;

  return message;
}

/**
 * Send message to Telegram using Bot API
 */
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    functions.logger.error(`Telegram API error for chat ${chatId}:`, error);
    throw new Error(`Failed to send message to chat ${chatId}`);
  }
}

/**
 * Rate limiting for order creation
 * Prevents spam orders from the same IP/user
 */
export const checkOrderRateLimit = functions.https.onCall(async (data, context) => {
  // This is a placeholder for rate limiting logic
  // You can implement IP-based or user-based rate limiting here

  // For now, we'll allow all requests
  return { allowed: true };
});

/**
 * Scheduled function to clean up old logs (runs daily)
 */
export const cleanupOldLogs = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Asia/Riyadh')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldLogsQuery = db
      .collection('admin_logs')
      .where('timestamp', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo));

    const snapshot = await oldLogsQuery.get();

    if (snapshot.empty) {
      functions.logger.info('No old logs to delete');
      return null;
    }

    // Batch delete
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    functions.logger.info(`Deleted ${snapshot.size} old log entries`);

    return null;
  });

// ==================== AUTOMATIC TELEGRAM NOTIFICATIONS ====================

/**
 * 🛒 Automatically send notification when a new order is created
 */
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    try {
      const order = snap.data();
      const orderId = context.params.orderId;

      // Get all chat IDs from settings
      const chatIds = await getTelegramChatIds();
      if (chatIds.length === 0) {
        functions.logger.warn('No Telegram chat IDs configured');
        return;
      }

      // Format and send message to all chat IDs
      const message = formatOrderMessage(order, orderId);
      const sendPromises = chatIds.map((chatId) =>
        sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message)
      );
      await Promise.all(sendPromises);

      functions.logger.info(`Order notification sent to ${chatIds.length} recipients for: ${orderId}`);
    } catch (error) {
      functions.logger.error('Error sending order notification:', error);
    }
  });

/**
 * ⭐ Automatically send notification when a new review/comment is created
 */
export const onReviewCreated = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (snap, context) => {
    try {
      const review = snap.data();
      const commentId = context.params.commentId;

      // Get all chat IDs from settings
      const chatIds = await getTelegramChatIds();
      if (chatIds.length === 0) {
        functions.logger.warn('No Telegram chat IDs configured');
        return;
      }

      // Format and send message to all chat IDs
      const message = formatReviewMessage(review, commentId);
      const sendPromises = chatIds.map((chatId) =>
        sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message)
      );
      await Promise.all(sendPromises);

      functions.logger.info(`Review notification sent to ${chatIds.length} recipients for: ${commentId}`);
    } catch (error) {
      functions.logger.error('Error sending review notification:', error);
    }
  });

/**
 * 💬 Automatically send notification when a new contact message is created
 */
export const onMessageCreated = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    try {
      const message = snap.data();
      const messageId = context.params.messageId;

      // Get all chat IDs from settings
      const chatIds = await getTelegramChatIds();
      if (chatIds.length === 0) {
        functions.logger.warn('No Telegram chat IDs configured');
        return;
      }

      // Format and send message to all chat IDs
      const telegramMessage = formatContactMessage(message, messageId);
      const sendPromises = chatIds.map((chatId) =>
        sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, telegramMessage)
      );
      await Promise.all(sendPromises);

      functions.logger.info(`Contact message notification sent to ${chatIds.length} recipients for: ${messageId}`);
    } catch (error) {
      functions.logger.error('Error sending contact message notification:', error);
    }
  });

// ==================== HELPER FUNCTIONS ====================

/**
 * Get Telegram Chat IDs from Firestore settings
 */
async function getTelegramChatIds(): Promise<string[]> {
  try {
    const settingsDoc = await db.collection('settings').doc('general').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return data?.telegramChatIds || [];
    }
    return [];
  } catch (error) {
    functions.logger.error('Error getting chat IDs:', error);
    return [];
  }
}

/**
 * Get first Telegram Chat ID (for backward compatibility)
 */
async function getTelegramChatId(): Promise<string | null> {
  const chatIds = await getTelegramChatIds();
  return chatIds.length > 0 ? chatIds[0] : null;
}

/**
 * Format review/comment message for Telegram
 */
function formatReviewMessage(review: any, commentId: string): string {
  const stars = '⭐'.repeat(review.rating);

  let message = `⭐ *تقييم جديد - Refresh Cafe*\n\n`;
  message += `📝 رقم التقييم: \`${commentId.slice(-8)}\`\n`;
  message += `التقييم: ${stars} (${review.rating}/5)\n`;
  message += `👤 الاسم: ${review.userName}\n`;

  if (review.userEmail) {
    message += `📧 البريد: ${review.userEmail}\n`;
  }

  message += `⏰ الوقت: ${new Date().toLocaleString('ar-SA')}\n\n`;
  message += `💬 *التعليق:*\n${review.text}\n\n`;
  message += `📊 الحالة: ${review.approved ? '✅ معتمد' : '⏳ قيد المراجعة'}`;

  return message;
}

/**
 * Format contact message for Telegram
 */
function formatContactMessage(contactMsg: any, messageId: string): string {
  let message = `💬 *رسالة تواصل جديدة - Refresh Cafe*\n\n`;
  message += `📝 رقم الرسالة: \`${messageId.slice(-8)}\`\n`;
  message += `👤 الاسم: ${contactMsg.name}\n`;

  if (contactMsg.email) {
    message += `📧 البريد: ${contactMsg.email}\n`;
  }

  if (contactMsg.phone) {
    message += `📱 الهاتف: ${contactMsg.phone}\n`;
  }

  message += `⏰ الوقت: ${new Date().toLocaleString('ar-SA')}\n\n`;
  message += `💬 *الرسالة:*\n${contactMsg.message}\n\n`;
  message += `📊 الحالة: ${contactMsg.read ? '✅ مقروءة' : '🆕 جديدة'}`;

  return message;
}

/**
 * 🤖 Webhook to receive messages from Telegram Bot
 * This allows users to send their Chat ID by starting the bot
 */
export const telegramWebhook = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const update = req.body;

    // Handle /start command
    if (update.message && update.message.text === '/start') {
      const chatId = update.message.chat.id.toString();
      const firstName = update.message.from.first_name || 'صاحب المقهى';

      // Save chat ID to Firestore
      await db
        .collection('settings')
        .doc('telegram')
        .set(
          {
            chatId: chatId,
            firstName: firstName,
            username: update.message.from.username || '',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      // Send welcome message
      const welcomeMsg =
        `مرحباً ${firstName}! 👋\n\n` +
        `تم تفعيل الإشعارات بنجاح ✅\n\n` +
        `ستصلك الآن إشعارات فورية عن:\n` +
        `🛒 الطلبات الجديدة\n` +
        `⭐ التقييمات\n` +
        `💬 رسائل التواصل\n\n` +
        `Chat ID: \`${chatId}\``;

      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, welcomeMsg);

      functions.logger.info(`Bot started for chat: ${chatId}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    functions.logger.error('Telegram webhook error:', error);
    res.status(500).send('Error');
  }
});
