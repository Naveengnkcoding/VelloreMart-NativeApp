import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoginModal from '../../components/LoginModal';
import RegisterModal from '../../components/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { buildWhatsAppMessage, openWhatsApp } from '../../lib/utils';

export default function CartScreen() {
  const { t, lang } = useLanguage();
  const { items, totalAmount, removeItem, updateQuantity } = useCart();
  const { user, profile } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleOrder = async () => {
    if (!user || !profile) {
      setShowLogin(true);
      return;
    }
    const msg = buildWhatsAppMessage(items, profile, totalAmount, lang);
    await openWhatsApp(msg);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.shoppingCart}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {items.length} {t.items}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.list}>
        {items.map((item: any) => (
          <View key={item.product.id} style={styles.card}>
            <Image source={{ uri: item.product.image_url }} style={styles.img} />
            <View style={styles.info}>
              <Text style={styles.name}>
                {lang === 'ta' ? item.product.name_ta : item.product.name_en}
              </Text>
              <Text style={styles.meta}>{item.quantity} x {item.product.weight}</Text>
              <Text style={styles.price}>₹{item.product.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.product.id)} style={styles.trash}>
              <Ionicons name="trash" size={20} color="#b91c1c" />
            </TouchableOpacity>

            <View style={styles.qtyRow}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.product.id, -1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(item.product.id, 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t.totalAmount}</Text>
          <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity onPress={handleOrder} style={styles.orderBtn}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.orderText}>
            {!user ? t.loginOrderWhatsApp : t.orderViaWhatsApp}
          </Text>
        </TouchableOpacity>
      </View>

      <LoginModal
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      <RegisterModal
        visible={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f3f4f6',
    gap: 10,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  badge: { backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#059669', fontSize: 12, fontWeight: '700' },

  list: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff',
    height: 100,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  img: { width: 70, height: 70, borderRadius: 12 },
  info: { flex: 1, gap: 2, },
  name: { fontSize: 15, fontWeight: '700', color: '#111' },
  meta: { fontSize: 13, color: '#666' },
  trash: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 999,
  },

  qtyRow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, color: '#374151', fontWeight: '600' },
  qty: { fontSize: 16, fontWeight: '700', color: '#111', minWidth: 20, textAlign: 'center' },

  footer: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 16, color: '#666' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#059669' },
  orderBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  orderText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});