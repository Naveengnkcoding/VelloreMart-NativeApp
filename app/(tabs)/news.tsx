import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

export default function NewsScreen() {
  const { t } = useLanguage();
  const [news, setNews] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('blog_news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNews(data || []);
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
           <Image source={require('../../assets/images/icon.png')} style={styles.logoImg} />
          </View>
          <Text style={styles.headerTitle}>{t.appName}</Text>
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {news.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image_url }} style={styles.img} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.category === 'Market' ? t.market : t.agriculturalNews}
                </Text>
              </View>
              <View style={styles.body}>
                <View style={styles.meta}>
                  <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.cat}>{item.category}</Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.excerpt} numberOfLines={isExpanded ? undefined : 3}>
                  {item.content}
                </Text>
                <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item.id)}>
                  <Text style={styles.readMore}>
                    {isExpanded ? t.showLess : t.readMore} {isExpanded ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: '#008b1d',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  logoImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  list: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  img: { width: '100%', height: 180 },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: '#92400e', fontSize: 11, fontWeight: '700' },
  body: { padding: 14, gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { color: '#9ca3af', fontSize: 12 },
  cat: { color: '#9ca3af', fontSize: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#111', lineHeight: 22 },
  excerpt: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  readMore: { color: '#059669', fontSize: 14, fontWeight: '700', marginTop: 4 },
});