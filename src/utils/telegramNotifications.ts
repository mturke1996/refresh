/**
 * Telegram Notifications - Free Plan Version
 * إرسال إشعارات التيليجرام مباشرة من الموقع بدون Cloud Functions
 */

// Telegram Bot Token - يقرأ من Environment Variable أو يستخدم القيمة الاحتياطية
const TELEGRAM_BOT_TOKEN =
  import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8209898561:AAEk7XWHqfMSR-Y0n1dwaLngGzSqr8FRR_w';

/**
 * Get Chat IDs from Firestore settings
 */
async function getChatIds(): Promise<string[]> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');

    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return data?.telegramChatIds || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting chat IDs:', error);
    return [];
  }
}

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

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

    return response.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

/**
 * Format order message
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
  message += `⏰ الوقت: ${new Date().toLocaleString('ar-SA')}\n\n`;

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
    message += `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} د.ل\n`;
  });

  message += `\n💰 *الإجمالي: ${order.total} د.ل*`;

  return message;
}

/**
 * Format review message
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
 * Format contact message
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
 * Send notification for new order
 */
export async function notifyNewOrder(order: any, orderId: string): Promise<void> {
  try {
    const chatIds = await getChatIds();
    if (chatIds.length === 0) {
      console.warn('No Telegram chat IDs configured');
      return;
    }

    const message = formatOrderMessage(order, orderId);

    // Send to all chat IDs
    const sendPromises = chatIds.map((chatId) => sendTelegramMessage(chatId, message));
    await Promise.all(sendPromises);

    console.log(`Order notification sent to ${chatIds.length} recipients`);
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
}

/**
 * Send notification for new review
 */
export async function notifyNewReview(review: any, commentId: string): Promise<void> {
  try {
    const chatIds = await getChatIds();
    if (chatIds.length === 0) {
      console.warn('No Telegram chat IDs configured');
      return;
    }

    const message = formatReviewMessage(review, commentId);

    // Send to all chat IDs
    const sendPromises = chatIds.map((chatId) => sendTelegramMessage(chatId, message));
    await Promise.all(sendPromises);

    console.log(`Review notification sent to ${chatIds.length} recipients`);
  } catch (error) {
    console.error('Error sending review notification:', error);
  }
}

/**
 * Send notification for new contact message
 */
export async function notifyNewMessage(contactMsg: any, messageId: string): Promise<void> {
  try {
    const chatIds = await getChatIds();
    if (chatIds.length === 0) {
      console.warn('No Telegram chat IDs configured');
      return;
    }

    const message = formatContactMessage(contactMsg, messageId);

    // Send to all chat IDs
    const sendPromises = chatIds.map((chatId) => sendTelegramMessage(chatId, message));
    await Promise.all(sendPromises);

    console.log(`Contact message notification sent to ${chatIds.length} recipients`);
  } catch (error) {
    console.error('Error sending contact message notification:', error);
  }
}

/**
 * Send notification for order status update
 */
export async function notifyOrderStatusUpdate(
  order: any,
  orderId: string,
  newStatus: string
): Promise<void> {
  try {
    const chatIds = await getChatIds();
    if (chatIds.length === 0) {
      console.warn('No Telegram chat IDs configured');
      return;
    }

    const statusLabels: { [key: string]: string } = {
      pending: '⏳ قيد الانتظار',
      confirmed: '✅ مؤكد',
      preparing: '👨‍🍳 قيد التحضير',
      ready: '🎉 جاهز',
      delivered: '🚚 تم التوصيل',
      cancelled: '❌ ملغي',
    };

    let message = `🔔 *تحديث حالة الطلب - Refresh Cafe*\n\n`;
    message += `📝 رقم الطلب: \`${orderId.slice(-8)}\`\n`;
    message += `📊 الحالة الجديدة: ${statusLabels[newStatus] || newStatus}\n`;
    message += `⏰ وقت التحديث: ${new Date().toLocaleString('ar-LY')}\n\n`;
    message += `👤 العميل: ${order.customer?.name || 'غير محدد'}\n`;
    message += `📱 الهاتف: ${order.customer?.phone || 'غير محدد'}\n`;
    message += `💰 الإجمالي: ${order.total} د.ل`;

    // Send to all chat IDs
    const sendPromises = chatIds.map((chatId) => sendTelegramMessage(chatId, message));
    await Promise.all(sendPromises);

    console.log(`Order status update notification sent to ${chatIds.length} recipients`);
  } catch (error) {
    console.error('Error sending order status update notification:', error);
  }
}

/**
 * Format job application message
 */
function formatJobApplicationMessage(application: any, applicationId: string): string {
  let message = `💼 *طلب توظيف جديد - Refresh Cafe*\n\n`;
  message += `📝 رقم الطلب: \`${applicationId.slice(-8)}\`\n`;
  message += `💼 الوظيفة: ${application.jobTitle}\n`;
  message += `⏰ الوقت: ${new Date().toLocaleString('ar-SA')}\n\n`;

  message += `👤 *بيانات المتقدم:*\n`;
  message += `الاسم: ${application.applicantName}\n`;
  message += `📱 الهاتف: ${application.applicantPhone}\n`;

  if (application.applicantEmail) {
    message += `📧 البريد: ${application.applicantEmail}\n`;
  }

  if (application.cvUrl) {
    message += `📄 السيرة الذاتية: [عرض الملف](${application.cvUrl})\n`;
  }

  message += `\n💬 *رسالة المتقدم:*\n${application.message}\n\n`;
  message += `📊 الحالة: 🆕 جديد`;

  return message;
}

/**
 * Send notification for new job application
 */
export async function notifyNewJobApplication(
  application: any,
  applicationId: string
): Promise<void> {
  try {
    const chatIds = await getChatIds();
    if (chatIds.length === 0) {
      console.warn('No Telegram chat IDs configured');
      return;
    }

    const message = formatJobApplicationMessage(application, applicationId);

    // Send to all chat IDs
    const sendPromises = chatIds.map((chatId) => sendTelegramMessage(chatId, message));
    await Promise.all(sendPromises);

    console.log(`Job application notification sent to ${chatIds.length} recipients`);
  } catch (error) {
    console.error('Error sending job application notification:', error);
  }
}
