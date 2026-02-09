import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from "react-native";
import { PanelLeft, ChevronRight, Search } from "lucide-react-native";
import { cn } from "../../lib/utils";

// 우리가 앞서 만든 컴포넌트들 (경로에 맞춰 수정하세요)
import { Sheet, SheetContent } from "./sheet";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";

const SCREEN_WIDTH = Dimensions.get("window").width;

// --- Context & Hooks ---
type SidebarContext = {
  state: "expanded" | "collapsed";
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}

// --- Main Components ---

export const SidebarProvider = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ children, style, ...props }, ref) => {
    const [openMobile, setOpenMobile] = React.useState(false);
    const [state, setState] = React.useState<"expanded" | "collapsed">("expanded");

    const toggleSidebar = React.useCallback(() => {
      setOpenMobile((prev) => !prev);
    }, []);

    const contextValue = React.useMemo(
      () => ({ state, openMobile, setOpenMobile, toggleSidebar }),
      [state, openMobile, toggleSidebar]
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <View ref={ref} style={[styles.provider, style]} {...props}>
          {children}
        </View>
      </SidebarContext.Provider>
    );
  }
);

export const Sidebar = ({ children, side = "left" }: any) => {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent side={side} open={openMobile} onOpenChange={setOpenMobile} style={styles.sidebarSheet}>
        <View style={styles.sidebarInner}>{children}</View>
      </SheetContent>
    </Sheet>
  );
};

// --- Sub Components (누락 없이 모두 포함) ---

export const SidebarTrigger = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <TouchableOpacity onPress={toggleSidebar} style={styles.trigger}>
      <PanelLeft size={20} color="#0f172a" />
    </TouchableOpacity>
  );
};

export const SidebarContent = ({ children }: any) => (
  <ScrollView style={styles.flex1} contentContainerStyle={styles.contentPadding}>
    {children}
  </ScrollView>
);

export const SidebarHeader = ({ children }: any) => <View style={styles.header}>{children}</View>;
export const SidebarFooter = ({ children }: any) => <View style={styles.footer}>{children}</View>;

export const SidebarGroup = ({ children }: any) => <View style={styles.group}>{children}</View>;
export const SidebarGroupLabel = ({ children }: any) => <Text style={styles.groupLabel}>{children}</Text>;
export const SidebarGroupContent = ({ children }: any) => <View>{children}</View>;

export const SidebarMenu = ({ children }: any) => <View style={styles.menuContainer}>{children}</View>;
export const SidebarMenuItem = ({ children }: any) => <View style={styles.menuItem}>{children}</View>;

export const SidebarMenuButton = ({ label, icon: Icon, isActive, onPress }: any) => (
  <TouchableOpacity
    style={[styles.menuButton, isActive && styles.menuButtonActive]}
    onPress={onPress}
  >
    {Icon && <Icon size={18} color={isActive ? "#0f172a" : "#64748b"} />}
    <Text style={[styles.menuButtonText, isActive && styles.menuButtonTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export const SidebarMenuSub = ({ children }: any) => <View style={styles.subMenu}>{children}</View>;
export const SidebarMenuSubItem = ({ children }: any) => <View>{children}</View>;
export const SidebarMenuSubButton = ({ label, isActive, onPress }: any) => (
  <TouchableOpacity style={styles.subMenuButton} onPress={onPress}>
    <Text style={[styles.subMenuText, isActive && styles.menuButtonTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export const SidebarInput = (props: any) => (
  <View style={styles.inputWrapper}>
    <Search size={16} color="#94a3b8" style={styles.inputIcon} />
    <Input {...props} style={styles.sidebarInput} />
  </View>
);

export const SidebarSeparator = () => <Separator style={styles.separator} />;

// --- Styles ---
const styles = StyleSheet.create({
  provider: { flex: 1 },
  flex1: { flex: 1 },
  sidebarSheet: { padding: 0 },
  sidebarInner: { flex: 1, backgroundColor: "#ffffff" },
  trigger: { padding: 8 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  contentPadding: { padding: 8 },
  group: { marginBottom: 16 },
  groupLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    paddingHorizontal: 12,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  menuContainer: { gap: 4 },
  menuItem: { width: "100%" },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 8,
  },
  menuButtonActive: { backgroundColor: "#f1f5f9" },
  menuButtonText: { fontSize: 14, color: "#475569" },
  menuButtonTextActive: { color: "#0f172a", fontWeight: "600" },
  subMenu: {
    paddingLeft: 32,
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
    marginLeft: 20,
    marginTop: 4,
    gap: 4,
  },
  subMenuButton: { paddingVertical: 6 },
  subMenuText: { fontSize: 14, color: "#64748b" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 8 },
  sidebarInput: {
    flex: 1,
    height: 36,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  separator: { marginVertical: 8, backgroundColor: "#f1f5f9" },
});