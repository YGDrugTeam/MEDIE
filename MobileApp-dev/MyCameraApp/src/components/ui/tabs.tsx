import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewProps } from "react-native";
import { cn } from "../../lib/utils"; // 경로 확인!

// 1. 타입 정의 (className 에러 방지용)
interface TabsProps extends ViewProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

// 메인 Root 컨테이너
const Tabs = ({ defaultValue, value: controlledValue, onValueChange, children, style, ...props }: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (val: string) => {
    setInternalValue(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <View style={[styles.tabs, style]} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
};

// 탭 버튼 목록 (TabsList)
const TabsList = React.forwardRef<View, TabsProps>(({ className, style, ...props }, ref) => (
  <View ref={ref} style={[styles.tabsList, style]} {...props} />
));

// 탭 버튼 개별 (TabsTrigger)
const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TouchableOpacity>,
  TabsProps & { value: string }
>(({ 
  value, 
  children, 
  style, 
  className,    // 웹용 속성 분리
  defaultValue, // 웹용 속성 분리
  onValueChange, // 웹용 속성 분리 (에러의 핵심 원인)
  ...props 
}, ref) => {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

    return (
      <TouchableOpacity
        ref={ref as any}
        onPress={() => context.onValueChange?.(value)}
        activeOpacity={0.7} // 클릭 시 피드백 추가
        style={[
          styles.tabsTrigger,
          isActive && styles.activeTrigger,
          style
        ]}
        // 2. 중요: ...props에 섞여 들어갈 수 있는 웹 전용 속성들을 필터링하기 위해
        // TouchableOpacity가 인식하지 못하는 속성이 props에 남지 않도록 주의해야 합니다.
        {...(props as any)}
      >
        <Text style={[styles.triggerText, isActive && styles.activeText]}>
          {children}
        </Text>
      </TouchableOpacity>
    );
  }
);

// 탭 내용 (TabsContent)
const TabsContent = React.forwardRef<View, TabsProps & { value: string }>(
  ({ value, children, style, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (context.value !== value) return null;

    return (
      <View ref={ref} style={[styles.content, style]} {...props}>
        {children}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  tabs: {
    width: "100%",
  },
  tabsList: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9", // bg-muted
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  tabsTrigger: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTrigger: {
    backgroundColor: "#ffffff", // data-[state=active]:bg-background
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b", // text-muted-foreground
  },
  activeText: {
    color: "#0f172a", // text-foreground
  },
  content: {
    marginTop: 10,
    width: "100%",
  },
});

export { Tabs, TabsList, TabsTrigger, TabsContent };