import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Entry = {
  id: string;
  date: Date;
  mood: string;
  title: string;
  body: string;
};

const ENTRIES: Entry[] = [
  {
    id: '1',
    date: new Date(2026, 4, 29),
    mood: '☀️',
    title: '鴨川沿いを散歩した',
    body: '夕方から鴨川沿いを歩いた。風がぬるくて、もう初夏という感じ。等間隔カップルも健在で、見ているだけで少し笑ってしまった。',
  },
  {
    id: '2',
    date: new Date(2026, 4, 27),
    mood: '☕️',
    title: '新しい喫茶店',
    body: '河原町二条の小さな喫茶店に入った。深煎りの豆と、店主の選曲がとても良かった。次は本を持って行きたい。',
  },
  {
    id: '3',
    date: new Date(2026, 4, 24),
    mood: '🌧',
    title: '雨の日の作業',
    body: '一日中雨。家でコードを書いて過ごす。集中はできたけれど、夜になって少しだけ気分が落ちた。明日は外に出よう。',
  },
  {
    id: '4',
    date: new Date(2026, 4, 21),
    mood: '🍜',
    title: '友人と夕食',
    body: '久しぶりに学生時代の友人とラーメン。お互い違う方向に進んだけれど、話しているとあの頃の距離感に戻る。',
  },
  {
    id: '5',
    date: new Date(2026, 4, 18),
    mood: '📚',
    title: '読了',
    body: '積んでいた本をやっと読み終えた。後半の展開がとても良くて、読後しばらく動けなかった。',
  },
];

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatHeader(date: Date) {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}

function formatDay(date: Date) {
  return {
    day: String(date.getDate()).padStart(2, '0'),
    weekday: WEEKDAYS[date.getDay()],
  };
}

export default function Index() {
  const today = useMemo(() => new Date(), []);
  const { day: todayDay, weekday: todayWeekday } = formatDay(today);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerMonth}>{formatHeader(today)}</Text>
          <Text style={styles.headerTitle}>日記</Text>
        </View>

        <Pressable style={styles.todayCard}>
          <View style={styles.todayDateColumn}>
            <Text style={styles.todayWeekday}>{todayWeekday}</Text>
            <Text style={styles.todayDay}>{todayDay}</Text>
          </View>
          <View style={styles.todayBody}>
            <Text style={styles.todayLabel}>今日の記録</Text>
            <Text style={styles.todayPrompt}>
              タップして、今日のことを書きとめよう。
            </Text>
          </View>
          <Text style={styles.todayChevron}>＋</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>これまでの日記</Text>

        <View style={styles.list}>
          {ENTRIES.map((entry) => {
            const { day, weekday } = formatDay(entry.date);
            return (
              <Pressable key={entry.id} style={styles.entry}>
                <View style={styles.entryDateColumn}>
                  <Text style={styles.entryWeekday}>{weekday}</Text>
                  <Text style={styles.entryDay}>{day}</Text>
                </View>
                <View style={styles.entryBody}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryMood}>{entry.mood}</Text>
                    <Text style={styles.entryTitle} numberOfLines={1}>
                      {entry.title}
                    </Text>
                  </View>
                  <Text style={styles.entryExcerpt} numberOfLines={2}>
                    {entry.body}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Pressable style={styles.fab}>
        <Text style={styles.fabIcon}>✎</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const PAPER = '#FAF6EE';
const INK = '#2B2A28';
const SUB = '#8A8278';
const ACCENT = '#8B5E3C';
const CARD = '#FFFFFF';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAPER,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerMonth: {
    fontSize: 13,
    color: SUB,
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: INK,
    marginTop: 4,
    letterSpacing: 4,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  todayDateColumn: {
    alignItems: 'center',
    width: 44,
  },
  todayWeekday: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: '600',
  },
  todayDay: {
    fontSize: 26,
    fontWeight: '700',
    color: INK,
    marginTop: 2,
  },
  todayBody: {
    flex: 1,
  },
  todayLabel: {
    fontSize: 12,
    color: SUB,
    letterSpacing: 1,
  },
  todayPrompt: {
    fontSize: 15,
    color: INK,
    marginTop: 4,
    lineHeight: 22,
  },
  todayChevron: {
    fontSize: 24,
    color: ACCENT,
    fontWeight: '300',
  },
  sectionLabel: {
    fontSize: 12,
    color: SUB,
    letterSpacing: 2,
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  list: {
    gap: 14,
  },
  entry: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
  },
  entryDateColumn: {
    alignItems: 'center',
    width: 44,
    paddingTop: 2,
  },
  entryWeekday: {
    fontSize: 11,
    color: SUB,
  },
  entryDay: {
    fontSize: 22,
    fontWeight: '600',
    color: INK,
    marginTop: 2,
  },
  entryBody: {
    flex: 1,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryMood: {
    fontSize: 16,
  },
  entryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
  },
  entryExcerpt: {
    fontSize: 13,
    color: SUB,
    marginTop: 6,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 26,
  },
});
