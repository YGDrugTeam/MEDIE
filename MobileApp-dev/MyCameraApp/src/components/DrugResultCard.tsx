import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Volume2, VolumeX, AlertTriangle, Pill, Clock, Activity, ChevronDown, ChevronUp } from "lucide-react-native";
import * as Speech from 'expo-speech'; // Expo 음성 엔진

// 우리가 앞서 만든 Expo용 UI 컴포넌트들
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface DrugInfo {
  drugId: string;
  drugName: string;
  dosage: string;
  efficacy: string;
  summary: string;
  confidence: number;
}

interface DrugResultCardProps {
  drugInfo: DrugInfo;
  onRetry: () => void;
}

export const DrugResultCard = ({ drugInfo, onRetry }: DrugResultCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Expo 음성 안내 (TTS) 구현
  const handleTTS = async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    Speech.speak(drugInfo.summary, {
      language: "ko-KR",
      rate: 0.9,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const confidenceLevel = drugInfo.confidence >= 0.9 ? "high" : drugInfo.confidence >= 0.7 ? "medium" : "low";
  
  // Badge 변리에 따른 색상 스타일 매핑
  const badgeVariant = drugInfo.confidence >= 0.9 ? "default" : drugInfo.confidence >= 0.7 ? "secondary" : "destructive";

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 메인 결과 카드 */}
      <Card style={styles.mainCard}>
        <View style={styles.gradientHeader}>
          <View style={styles.headerTop}>
            <View style={styles.pillIconWrapper}>
              <View style={styles.pillIconContainer}>
                <Pill color="#ffffff" size={32} />
              </View>
              <View>
                <Text style={styles.drugName}>{drugInfo.drugName}</Text>
                <Text style={styles.drugId}>ID: {drugInfo.drugId}</Text>
              </View>
            </View>
            <Badge variant={badgeVariant}>
              <Text>{Math.round(drugInfo.confidence * 100)}% 일치</Text>
            </Badge>
          </View>
        </View>
        
        <CardContent style={styles.content}>
          {/* 퀵 정보 (그리드 레이아웃) */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Clock size={20} color="#3b82f6" />
              <View style={styles.gridText}>
                <Text style={styles.gridLabel}>복용횟수</Text>
                <Text style={styles.gridValue}>{drugInfo.dosage}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Activity size={20} color="#10b981" />
              <View style={styles.gridText}>
                <Text style={styles.gridLabel}>효능</Text>
                <Text style={styles.gridValue}>{drugInfo.efficacy}</Text>
              </View>
            </View>
          </View>

          {/* AI 요약 섹션 */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>AI 요약</Text>
              <Button variant="ghost" size="sm" onPress={handleTTS} style={styles.ttsButton}>
                {isPlaying ? <VolumeX size={16} color="#64748b" /> : <Volume2 size={16} color="#64748b" />}
                <Text style={styles.ttsText}>{isPlaying ? " 중지" : " 듣기"}</Text>
              </Button>
            </View>
            <Text style={styles.summaryContent}>{drugInfo.summary}</Text>
          </View>

          {/* 상세정보 토글 */}
          <TouchableOpacity 
            onPress={() => setShowDetails(!showDetails)} 
            style={styles.detailToggle}
          >
            <Text style={styles.detailToggleText}>
              {showDetails ? "상세정보 접기 " : "상세정보 보기 "}
            </Text>
            {showDetails ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
          </TouchableOpacity>

          {showDetails && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View>
                  <Text style={styles.detailLabel}>약품 ID</Text>
                  <Text style={styles.detailValue}>{drugInfo.drugId}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>인식 신뢰도</Text>
                  <Text style={styles.detailValue}>{Math.round(drugInfo.confidence * 100)}%</Text>
                </View>
              </View>
            </View>
          )}
        </CardContent>
      </Card>

      {/* 경고 배너 */}
      <View style={styles.warningBanner}>
        <AlertTriangle size={20} color="#eab308" />
        <View style={styles.warningTextWrapper}>
          <Text style={styles.warningTitle}>약사 또는 의사 상담 권장</Text>
          <Text style={styles.warningDescription}>
            본 서비스는 참고용이며, 정확한 복용 정보는 전문가와 상담하세요.
          </Text>
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttonGroup}>
        <Button variant="outline" onPress={onRetry} style={styles.actionButton}>
          <Text>다른 약 검색</Text>
        </Button>
        <Button onPress={() => {}} style={[styles.actionButton, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>처음으로</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  mainCard: { borderRadius: 16, overflow: "hidden", elevation: 4 },
  gradientHeader: { backgroundColor: "#3b82f6", padding: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  pillIconWrapper: { flexDirection: "row", alignItems: "center", gap: 12 },
  pillIconContainer: { width: 56, height: 56, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  drugName: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  drugId: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  content: { padding: 20 },
  grid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  gridItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, backgroundColor: "#f8fafc", borderRadius: 12 },
  gridText: { flex: 1 },
  gridLabel: { fontSize: 10, color: "#64748b" },
  gridValue: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  summaryBox: { padding: 16, backgroundColor: "#f1f5f9", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  summaryTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  ttsButton: { flexDirection: "row", alignItems: "center" },
  ttsText: { fontSize: 12, color: "#64748b" },
  summaryContent: { fontSize: 14, color: "#475569", lineHeight: 22 },
  detailToggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  detailToggleText: { fontSize: 14, color: "#64748b" },
  detailsContainer: { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 12, color: "#64748b" },
  detailValue: { fontSize: 14, fontWeight: "500" },
  warningBanner: { flexDirection: "row", gap: 12, padding: 16, backgroundColor: "#fffbeb", borderRadius: 12, borderWidth: 1, borderColor: "#fef3c7", marginTop: 16 },
  warningTextWrapper: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: "600", color: "#92400e" },
  warningDescription: { fontSize: 12, color: "#b45309", marginTop: 2 },
  buttonGroup: { flexDirection: "row", gap: 12, marginTop: 20 },
  actionButton: { flex: 1, height: 48 },
  primaryButton: { backgroundColor: "#3b82f6" },
  primaryButtonText: { color: "#ffffff", fontWeight: "bold" }
});