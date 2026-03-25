import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { styles } from '../styles/commonStyles';
import { COLORS } from '../constants/colors';

const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const MONTH_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateKey = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateTitle = (dateKey) => {
  const [y, m, d] = dateKey.split('-');
  return `${Number(m)}월 ${Number(d)}일`;
};

const isSameDate = (a, b) => a === b;

const getToday = () => new Date();

const getWeekDates = (baseDate = new Date()) => {
  const date = new Date(baseDate);
  const day = date.getDay(); // 일0 월1 ...
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const getMonthMatrix = (baseDate = new Date()) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  const end = new Date(lastDay);
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const dates = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return weeks;
};

const getStatusFromRecords = (records) => {
  if (!records || records.length === 0) return 'none';

  const total = records.length;
  const taken = records.filter((r) => r.taken).length;

  if (taken === total) return 'done';
  if (taken === 0) return 'missed';
  return 'partial';
};

const getStatusMark = (status) => {
  if (status === 'done') return '✔';
  if (status === 'partial') return '▲';
  if (status === 'missed') return '✕';
  return '';
};

const getStatusColor = (status) => {
  if (status === 'done') return COLORS.SUCCESS;
  if (status === 'partial') return COLORS.WARNING;
  if (status === 'missed') return COLORS.DANGER;
  return COLORS.TEXT_MUTED;
};

const groupRecordsByDate = (pillHistory = []) => {
  return pillHistory.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
};

export default function HistoryScreen({ pillHistory = [], setAppMode }) {
  const todayDate = getToday();
  const todayKey = formatDateKey(todayDate);

  const [tab, setTab] = useState('today'); // today | week | all
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [currentMonth, setCurrentMonth] = useState(todayDate);

  const recordsByDate = useMemo(() => groupRecordsByDate(pillHistory), [pillHistory]);
  const selectedRecords = recordsByDate[selectedDate] || [];

  const weekDates = useMemo(() => getWeekDates(todayDate), []);
  const monthMatrix = useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);

  const monthTitle = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const goPrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const goNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const renderStatusDot = (dateKey) => {
    const status = getStatusFromRecords(recordsByDate[dateKey] || []);
    const mark = getStatusMark(status);
    const color = getStatusColor(status);

    if (!mark) return null;

    return (
      <Text
        style={{
          fontSize: status === 'partial' ? 10 : 11,
          fontWeight: '800',
          color,
          marginTop: 4,
        }}
      >
        {mark}
      </Text>
    );
  };

  const renderDetailCard = () => (
    <View
      style={{
        backgroundColor: COLORS.WHITE,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '800',
          color: COLORS.TEXT_MAIN,
          marginBottom: 6,
        }}
      >
        {formatDateTitle(selectedDate)}
      </Text>

      <Text
        style={{
          fontSize: 13,
          color: COLORS.TEXT_SUB,
          marginBottom: 14,
        }}
      >
        복용 상세 내역
      </Text>

      {selectedRecords.length === 0 ? (
        <Text
          style={{
            fontSize: 14,
            color: COLORS.TEXT_SUB,
            lineHeight: 20,
          }}
        >
          해당 날짜의 복용 기록이 없어요.
        </Text>
      ) : (
        selectedRecords.map((item, index) => (
          <View
            key={`${item.date}-${item.label}-${item.pillName}-${index}`}
            style={{
              paddingVertical: 12,
              borderTopWidth: index === 0 ? 1 : 1,
              borderTopColor: '#EEF2EC',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: COLORS.TEXT_MAIN,
                  marginBottom: 4,
                }}
              >
                {item.label} · {item.pillName}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.TEXT_SUB,
                }}
              >
                {item.time || '--:--'}
              </Text>
            </View>

            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: item.taken ? '#DDF1E2' : '#FDE7E5',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: item.taken ? COLORS.SUCCESS : COLORS.DANGER,
                }}
              >
                {item.taken ? '✔' : '✕'}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={{ marginBottom: 18 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: COLORS.TEXT_MAIN,
              marginBottom: 8,
            }}
          >
            내 복용 내역
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.TEXT_SUB,
              lineHeight: 20,
            }}
          >
            오늘, 이번 주, 전체 기록을 확인해보세요.
          </Text>
        </View>

        {/* 탭 */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: COLORS.SURFACE_SOFT,
            borderRadius: 18,
            padding: 4,
            marginBottom: 18,
          }}
        >
          {[
            { key: 'today', label: '오늘' },
            { key: 'week', label: '이번 주' },
            { key: 'all', label: '전체' },
          ].map((item) => {
            const isActive = tab === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.9}
                onPress={() => {
                  setTab(item.key);
                  if (item.key === 'today') setSelectedDate(todayKey);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: isActive ? COLORS.WHITE : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: isActive ? COLORS.TEXT_MAIN : COLORS.TEXT_SUB,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 오늘 */}
        {tab === 'today' && (
          <>
            {renderDetailCard()}
          </>
        )}

        {/* 이번 주 */}
        {tab === 'week' && (
          <>
            <View
              style={{
                backgroundColor: COLORS.WHITE,
                borderRadius: 24,
                padding: 18,
                borderWidth: 1,
                borderColor: COLORS.BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: COLORS.TEXT_MAIN,
                  marginBottom: 14,
                }}
              >
                이번 주 기록
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                {weekDates.map((date, idx) => {
                  const dateKey = formatDateKey(date);
                  const isSelected = isSameDate(selectedDate, dateKey);
                  const isToday = isSameDate(todayKey, dateKey);

                  return (
                    <TouchableOpacity
                      key={dateKey}
                      activeOpacity={0.9}
                      onPress={() => setSelectedDate(dateKey)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 10,
                        marginHorizontal: 2,
                        borderRadius: 16,
                        backgroundColor: isSelected ? COLORS.SURFACE_SOFT : 'transparent',
                        borderWidth: isToday ? 1 : 0,
                        borderColor: isToday ? COLORS.PRIMARY : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.TEXT_SUB,
                          fontWeight: '600',
                          marginBottom: 6,
                        }}
                      >
                        {WEEK_LABELS[idx]}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '800',
                          color: COLORS.TEXT_MAIN,
                        }}
                      >
                        {date.getDate()}
                      </Text>
                      {renderStatusDot(dateKey)}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {renderDetailCard()}
          </>
        )}

        {/* 전체 */}
        {tab === 'all' && (
          <>
            <View
              style={{
                backgroundColor: COLORS.WHITE,
                borderRadius: 24,
                padding: 18,
                borderWidth: 1,
                borderColor: COLORS.BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <TouchableOpacity onPress={goPrevMonth} activeOpacity={0.8}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: COLORS.TEXT_MAIN,
                    }}
                  >
                    ‹
                  </Text>
                </TouchableOpacity>

                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '800',
                    color: COLORS.TEXT_MAIN,
                  }}
                >
                  {monthTitle}
                </Text>

                <TouchableOpacity onPress={goNextMonth} activeOpacity={0.8}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: COLORS.TEXT_MAIN,
                    }}
                  >
                    ›
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 8,
                }}
              >
                {MONTH_LABELS.map((label) => (
                  <View
                    key={label}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: COLORS.TEXT_SUB,
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>

              {monthMatrix.map((week, weekIdx) => (
                <View
                  key={`week-${weekIdx}`}
                  style={{
                    flexDirection: 'row',
                    marginBottom: 8,
                  }}
                >
                  {week.map((date) => {
                    const dateKey = formatDateKey(date);
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isSelected = isSameDate(selectedDate, dateKey);
                    const isToday = isSameDate(todayKey, dateKey);

                    return (
                      <TouchableOpacity
                        key={dateKey}
                        activeOpacity={0.9}
                        onPress={() => setSelectedDate(dateKey)}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 10,
                          borderRadius: 14,
                          backgroundColor: isSelected ? COLORS.SURFACE_SOFT : 'transparent',
                          borderWidth: isToday ? 1 : 0,
                          borderColor: isToday ? COLORS.PRIMARY : 'transparent',
                          opacity: isCurrentMonth ? 1 : 0.35,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: COLORS.TEXT_MAIN,
                          }}
                        >
                          {date.getDate()}
                        </Text>
                        {renderStatusDot(dateKey)}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              {/* 상태 범례 */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: '#EEF2EC',
                }}
              >
                {[
                  { label: '완료', mark: '✔', color: COLORS.SUCCESS },
                  { label: '부분', mark: '▲', color: COLORS.WARNING },
                  { label: '미복용', mark: '✕', color: COLORS.DANGER },
                ].map((item) => (
                  <View
                    key={item.label}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '800',
                        color: item.color,
                        marginRight: 4,
                      }}
                    >
                      {item.mark}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.TEXT_SUB,
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {renderDetailCard()}
          </>
        )}

        {/* 하단 이동 */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setAppMode('HOME')}
          style={{
            marginTop: 16,
            backgroundColor: COLORS.PRIMARY,
            borderRadius: 20,
            paddingVertical: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '800',
              color: COLORS.WHITE,
            }}
          >
            홈으로 돌아가기
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}