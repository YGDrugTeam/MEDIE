import React, { useState, createContext, useContext } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Pressable } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";

// 1. Context 생성: 상태 공유용
const SelectContext = createContext<any>(null);

// 2. Select Root
export const Select = ({ children, value, onValueChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <View style={styles.container}>{children}</View>
    </SelectContext.Provider>
  );
};

export const SelectValue = ({ placeholder }: { placeholder: string }) => {
  const { value } = useContext(SelectContext);
  return <Text style={styles.valueText}>{value || placeholder}</Text>;
};

// 3. SelectTrigger (클릭하는 영역)
export const SelectTrigger = ({ children, style }: any) => {
  const { setIsOpen } = useContext(SelectContext);
  return (
    <TouchableOpacity 
      style={[styles.trigger, style]} 
      onPress={() => setIsOpen(true)}
      activeOpacity={0.7}
    >
      {children}
      <ChevronDown size={18} color="#94a3b8" />
    </TouchableOpacity>
  );
};

// 4. SelectContent (나타나는 모달 리스트)
export const SelectContent = ({ children }: any) => {
  const { isOpen, setIsOpen } = useContext(SelectContext);
  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
        <View style={styles.content}>
          <View style={styles.handle} />
          {children}
        </View>
      </Pressable>
    </Modal>
  );
};

// 5. SelectItem (개별 항목)
export const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => {
  const { value: selectedValue, onValueChange, setIsOpen } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <TouchableOpacity 
      style={styles.item} 
      onPress={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
    >
      <Text style={[styles.itemText, isSelected && styles.selectedText]}>{children}</Text>
      {isSelected && <Check size={18} color="#0f172a" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  valueText: { fontSize: 16, color: "#0f172a" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end", // 화면 아래에서 위로 올라오는 방식 (Bottom Sheet 느낌)
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f1f5f9",
  },
  itemText: { fontSize: 16, color: "#475569" },
  selectedText: { color: "#0f172a", fontWeight: "600" },
});