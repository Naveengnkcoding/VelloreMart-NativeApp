import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const CATEGORIES = ['All', 'veg-fruits', 'greens', 'milk-dairy', 'meat'];

// Responsive dimensions
const isTablet = width >= 768;
const isLargeTablet = width >= 1024;
const columnCount = isLargeTablet ? 4 : isTablet ? 3 : 2;
const cardWidth = (width - (columnCount + 1) * 12) / columnCount;

export default function HomeScreen() {
  const { t, lang, toggleLang } = useLanguage();
  const { items, addItem, removeItem, updateQuantity } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    let q = supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('sort_order', { ascending: true });

    if (category !== 'All') q = q.eq('category', category);
    const { data } = await q;
    setProducts(data || []);
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name_en.toLowerCase().includes(q) || p.name_ta.toLowerCase().includes(q);
  });

  const categoryLabel = (c: string) => {
    if (c === 'All') return t.all;
    if (c === 'veg-fruits') return t.vegFruits;
    if (c === 'greens') return t.greens;
    if (c === 'milk-dairy') return t.milkDairy;
    return t.meat;
  };

  const handleAddProduct = (product: any) => {
    addItem(product);
    // updateQuantity(product.id, +1);
  };

  const handleIncrement = (productId: string, product: any) => {
    addItem(product);
  };

  const handleDecrement = (productId: string) => {
    const existing = items.find((i: any) => i.product.id === productId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, -1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Image source={require('../../assets/images/icon.png')} style={styles.logoImg} />
          </View>
          <Text style={styles.headerTitle}>{t.appName}</Text>
        </View>
        <TouchableOpacity onPress={toggleLang} style={styles.langBtn}>
          <Text style={styles.langText}>{t.langLabel}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroSub}>🌱 {t.freshMarket}</Text>
          <Text style={styles.heroTitle}>{t.appName}</Text>
          <Text style={styles.heroTag}>{t.tagline}</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder={t.searchPlaceholder}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#888"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                {categoryLabel(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{categoryLabel(category)}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length}</Text>
          </View>
        </View>

        {category !== 'All' && (
          <View style={styles.filterRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{categoryLabel(category)}</Text>
              <TouchableOpacity onPress={() => setCategory('All')}>
                <Ionicons name="close" size={14} color="#059669" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setCategory('All')}>
              <Text style={styles.clear}>{t.clearAll}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.grid}>
          {filtered.map((product) => {
            const cartItem = items.find((i: any) => i.product.id === product.id);
            return (
              <View key={product.id} style={[styles.card, { width: cardWidth }]}>
                <View style={styles.imgContainer}>
                  <Image source={{ uri: product.image_url }} style={styles.cardImg} />
                  {cartItem?.quantity > 0 && (
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {lang === 'ta' ? product.name_ta : product.name_en}
                  </Text>
                  <Text style={styles.cardUnit}>{product.weight}</Text>
                  <Text style={styles.cardPrice}>₹{product.price}</Text>
                  {cartItem?.quantity > 0 ? (
                    <View style={styles.quantitySelector}>
                      <TouchableOpacity
                        onPress={() => handleDecrement(product.id)}
                        style={styles.qtyRoundBtn}
                      >
                        <Text style={styles.qtyRoundBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyNumber}>{cartItem.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => handleIncrement(product.id, product)}
                        style={styles.qtyRoundBtn}
                      >
                        <Text style={styles.qtyRoundBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleAddProduct(product)} style={styles.addBtn}>
                      <Ionicons name="cart-outline" size={16} color="#fff" />
                      <Text style={styles.addText}>{t.add}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: '#008b1d',
    paddingTop: 50,
    paddingBottom: 12,  
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  langBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  langText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  hero: {
    backgroundColor: '#008b1d',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    gap: 4,
  },
  heroSub: { color: '#a7f3d0', fontSize: 12, letterSpacing: 1, fontWeight: '600' },
  heroTitle: { color: '#fff', fontSize: isTablet ? 28 : 24, fontWeight: '800' },
  heroTag: { color: '#d1fae5', fontSize: 13, marginBottom: 12 },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  catScroll: { marginTop: 4, marginBottom: 12 },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  catBtnActive: { backgroundColor: '#008b1d' },
  catText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  catTextActive: { color: '#fff' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: { fontSize: isTablet ? 20 : 18, fontWeight: '700', color: '#111' },
  countBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { color: '#008b1d', fontSize: 12, fontWeight: '700' },

  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: { color: '#008b1d', fontSize: 12, fontWeight: '600' },
  clear: { color: '#666', fontSize: 13, textDecorationLine: 'underline' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imgContainer: {
    position: 'relative',
    width: '100%',
    height: isTablet ? 180 : 120,
  },
  cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#008b1d',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  quantityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  cardBody: { padding: 12, gap: 2 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#111' },
  cardUnit: { fontSize: 12, color: '#666' },
  cardPrice: { fontSize: 16, fontWeight: '800', color: '#111', marginTop: 2 },
  addBtn: {
    marginTop: 8,
    backgroundColor: '#008b1d',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  quantitySelector: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    border: '1px solid #e5e7eb',
    borderRadius: 10,
  },
  qtyRoundBtn: {
    width: 32,
    height: 32,
    borderRadius: 20,
    // backgroundColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#008b1d',
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
    // elevation: 6,
  },
  qtyRoundBtnText: {
    color: 'grey',
    fontSize: 20,
    fontWeight: '600',
  },
  qtyNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    minWidth: 30,
    textAlign: 'center',
  },
});