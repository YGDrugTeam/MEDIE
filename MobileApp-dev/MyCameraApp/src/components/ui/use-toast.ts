import * as React from "react";

// --- 1. 타입 및 초기 설정 ---
type ToastVariant = "default" | "destructive";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 3000;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// --- 2. 전역 상태 관리 로직 ---
// (컴포넌트 외부에서도 toast()를 부를 수 있게 하기 위함)
const listeners: Array<(state: { toasts: Toast[] }) => void> = [];
let memoryState: { toasts: Toast[] } = { toasts: [] };

function dispatch(action: any) {
  if (action.type === "ADD_TOAST") {
    memoryState = {
      ...memoryState,
      toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
    };
  } else if (action.type === "REMOVE_TOAST") {
    memoryState = {
      ...memoryState,
      toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
    };
  }

  listeners.forEach((listener) => listener(memoryState));
}

// --- 3. 실제 내보낼 함수 (toast) ---
export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = genId();

  dispatch({
    type: "ADD_TOAST",
    toast: { id, title, description, variant },
  });

  setTimeout(() => {
    dispatch({ type: "REMOVE_TOAST", toastId: id });
  }, TOAST_REMOVE_DELAY);

  return id;
}

// --- 4. 실제 내보낼 훅 (useToast) ---
export function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
  };
}