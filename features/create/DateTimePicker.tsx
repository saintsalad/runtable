import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { PixelButton } from '@/components/ui/PixelButton';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function formatLabel(date: Date): string {
  const day = DAYS[date.getDay()] ?? 'MON';
  const mon = MONTHS[date.getMonth()] ?? 'JAN';
  const d = date.getDate();
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${day} · ${mon} ${d} · ${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function calendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let i = 1; i <= last; i += 1) cells.push(i);
  return cells;
}

type DateTimePickerProps = {
  value: Date;
  onChange: (d: Date) => void;
};

export const DateTimePicker = memo(function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const t = useThemeTokens();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const [viewYear, setViewYear] = useState(value.getFullYear());

  const cells = calendarDays(viewYear, viewMonth);

  const prevMonth = useCallback(() => {
    void Haptics.selectionAsync();
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    void Haptics.selectionAsync();
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }, [viewMonth]);

  const selectDay = useCallback((day: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft((prev) => new Date(viewYear, viewMonth, day, prev.getHours(), prev.getMinutes()));
  }, [viewMonth, viewYear]);

  const selectHour = useCallback((h: number) => {
    void Haptics.selectionAsync();
    setDraft((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), h, prev.getMinutes()));
  }, []);

  const selectMinute = useCallback((m: number) => {
    void Haptics.selectionAsync();
    setDraft((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), m));
  }, []);

  const confirm = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onChange(draft);
    setOpen(false);
  }, [draft, onChange]);

  const today = new Date();

  return (
    <>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setDraft(value);
          setViewMonth(value.getMonth());
          setViewYear(value.getFullYear());
          setOpen(true);
        }}
        style={{
          borderWidth: 1,
          borderColor: t.border,
          backgroundColor: t.card,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderRadius: 4,
        }}
        className="active:opacity-70">
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.text, fontSize: 13, textTransform: 'uppercase' }}>
          {formatLabel(value)}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setOpen(false)}>
          <Pressable
            style={{ backgroundColor: t.card, borderTopWidth: 1, borderTopColor: t.border, paddingBottom: 32 }}
            onPress={(e) => e.stopPropagation()}>

            {/* Month header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
              <Pressable onPress={prevMonth} hitSlop={12}>
                <ChevronLeft color={t.muted} size={18} strokeWidth={1.4} />
              </Pressable>
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 11, textTransform: 'uppercase', letterSpacing: 3 }}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <Pressable onPress={nextMonth} hitSlop={12}>
                <ChevronRight color={t.muted} size={18} strokeWidth={1.4} />
              </Pressable>
            </View>

            {/* Day headers */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
              {DAYS.map((d) => (
                <Text key={d} style={{ flex: 1, fontFamily: 'IBMPlexMono_600SemiBold', color: t.faint, fontSize: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 6 }}>
              {cells.map((cell, idx) => {
                if (!cell) return <View key={`e-${idx}`} style={{ width: '14.28%', height: 36 }} />;
                const selected = draft.getDate() === cell && draft.getMonth() === viewMonth && draft.getFullYear() === viewYear;
                const isToday = today.getDate() === cell && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
                return (
                  <Pressable
                    key={`d-${cell}`}
                    onPress={() => selectDay(cell)}
                    style={{
                      width: '14.28%',
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <View style={{
                      width: 28,
                      height: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                      borderWidth: selected ? 1 : isToday ? 1 : 0,
                      borderColor: selected ? t.text : t.border,
                      backgroundColor: selected ? t.text : 'transparent',
                    }}>
                      <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: selected ? t.background : isToday ? t.muted : t.faint, fontSize: 11 }}>
                        {cell}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <DottedDivider className="mx-4 my-4" />

            {/* Hour picker */}
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.faint, fontSize: 8, textTransform: 'uppercase', letterSpacing: 3, paddingHorizontal: 20, marginBottom: 8 }}>
              HOUR
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 4, marginBottom: 12 }}>
              {HOURS.map((h) => {
                const selected = draft.getHours() === h;
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 === 0 ? 12 : h % 12;
                return (
                  <Pressable
                    key={h}
                    onPress={() => selectHour(h)}
                    style={{
                      width: '11%',
                      alignItems: 'center',
                      paddingVertical: 6,
                      borderWidth: 1,
                      borderColor: selected ? t.text : t.border,
                      backgroundColor: selected ? t.text : t.surface,
                      borderRadius: 3,
                    }}>
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: selected ? t.background : t.faint, fontSize: 8 }}>
                      {h12}{ampm[0]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Minute picker */}
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.faint, fontSize: 8, textTransform: 'uppercase', letterSpacing: 3, paddingHorizontal: 20, marginBottom: 8 }}>
              MINUTE
            </Text>
            <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 16 }}>
              {MINUTES.map((m) => {
                const selected = draft.getMinutes() === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => selectMinute(m)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: selected ? t.text : t.border,
                      backgroundColor: selected ? t.text : t.surface,
                      borderRadius: 3,
                    }}>
                    <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: selected ? t.background : t.faint, fontSize: 12 }}>
                      :{String(m).padStart(2, '0')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              <PixelButton variant="solid" label={`CONFIRM · ${formatLabel(draft)}`} onPress={confirm} />
              <PixelButton variant="outline" label="CANCEL" onPress={() => setOpen(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});
