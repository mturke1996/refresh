import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

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
      throw new functions.https.HttpsError('failed-precondition', 'Telegram bot token not configured');
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
    'pickup': 'استلام',
    'delivery': 'توصيل',
  };

  const statusLabels: { [key: string]: string } = {
    'pending': '⏳ قيد الانتظار',
    'confirmed': '✅ مؤكد',
    'preparing': '👨‍🍳 قيد التحضير',
    'ready': '🎉 جاهز',
    'delivered': '🚚 تم التوصيل',
    'cancelled': '❌ ملغي',
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

