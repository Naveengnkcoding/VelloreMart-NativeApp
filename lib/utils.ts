import * as Linking from 'expo-linking';

export const WHATSAPP_NUMBER = '919876543210'; // 🔴 Replace with your store number

export function generateOrderId() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10);
  return `${day}${month}${hours}${minutes}-${random}`;
}

export function buildWhatsAppMessage(
  items: any[],
  customer: any,
  total: number,
  lang: 'en' | 'ta' = 'en'
) {
  const orderId = generateOrderId();
  let msg = `🛒 *Vellore Santhai - New Order*  - *${orderId}*\n\n`;
  msg += `👤 *Customer Details:*\n`;
  msg += `Name: ${customer.name}\n`;
  msg += `Phone: ${customer.phone}\n`;
  msg += `Address: ${customer.address}\n\n`;
  msg += `📦 *Order Details:*\n`;
  items.forEach((item) => {
    const name =
      lang === 'ta' && item.product.name_ta
        ? item.product.name_ta
        : item.product.name_en;
    const lineTotal = (item.product.price * item.quantity).toFixed(2);
    msg += `• ${name} (${item.product.weight}) x ${item.quantity} = ₹${lineTotal}\n`;
  });
  msg += `\n💰 *Total Amount: ₹${total.toFixed(2)}*\n\n`;
  msg += `Thank you! 🙏`;
  return msg;
}

export async function openWhatsApp(message: string) {
  const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    await Linking.openURL(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    );
  }
}