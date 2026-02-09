import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Camera, Search, Shield, Volume2 } from "lucide-react-native";
import { MedicLensLogo } from "./MedicLensLogo";
import { Button } from "./ui/button";

interface OnboardingScreenProps {
  onStart: () => void;
}

const features = [
  {
    icon: Camera,
    title: "스마트 촬영",
    description: "알약을 촬영하면 AI가 자동으로 분석합니다",
    color: "#3b82f6"
  },
  {
    icon: Search,
    title: "정확한 식별",
    description: "형태, 색상, 각인을 분석하여 약을 식별합니다",
    color: "#10b981"
  },
  {
    icon: Volume2,
    title: "음성 안내",
    description: "분석 결과를 음성으로 들을 수 있습니다",
    color: "#f59e0b"
  },
  {
    icon: Shield,
    title: "신뢰할 수 있는 정보",
    description: "공인된 약품 데이터베이스를 활용합니다",
    color: "#6366f1"
  },
];

export const OnboardingScreen = ({ onStart }: OnboardingScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <MedicLensLogo size="lg" />
          </View>
          <Text style={styles.mainTitle}>
            약을 사진으로{"\n"}간편하게 식별하세요
          </Text>
          <Text style={styles.subTitle}>
            AI 기반 이미지 분석으로 약의 정보를{"\n"}빠르고 정확하게 확인할 수 있습니다
          </Text>
        </View>

        {/* Features Grid (2x2) */}
        <View style={styles.grid}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <View key={feature.title} style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: feature.color }]}>
                  <Icon size={20} color="#ffffff" />
                </View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardDescription}>{feature.description}</Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Section */}
        <View style={styles.footer}>
          <Button
            onPress={onStart}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>시작하기</Text>
          </Button>
          <Text style={styles.legalText}>
            본 서비스는 참고용이며, 정확한 정보는{"\n"}전문가와 상담하세요
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  logoWrapper: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  subTitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: "48%", // 2열 구성을 위해 약 절반 너비 설정
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 16,
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  ctaButton: {
    height: 56,
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  legalText: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
});