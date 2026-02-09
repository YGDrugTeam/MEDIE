import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { 
  Controller, 
  ControllerProps, 
  FieldPath, 
  FieldValues, 
  FormProvider, 
  useFormContext 
} from "react-hook-form";

// 1. Form Provider (웹과 동일)
export const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

// 2. FormField (데이터 흐름 관리)
export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// 3. 상태 추출 Hook
export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField는 FormField 내부에서 사용해야 합니다.");
  }

  return {
    name: fieldContext.name,
    ...fieldState,
  };
};

// 4. FormItem (입력 그룹 컨테이너)
export const FormItem = ({ children, style }: any) => {
  return <View style={[styles.formItem, style]}>{children}</View>;
};

// 5. FormLabel (제목)
export const FormLabel = ({ children, style }: any) => {
  const { error } = useFormField();
  return (
    <Text style={[styles.label, error && styles.errorText, style]}>
      {children}
    </Text>
  );
};

// 6. FormControl (입력창 래퍼)
export const FormControl = ({ children }: any) => {
  return <View style={styles.control}>{children}</View>;
};

// 7. FormMessage (에러 메시지)
export const FormMessage = ({ children }: any) => {
  const { error } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) return null;

  return <Text style={styles.errorTextSmall}>{body}</Text>;
};

const styles = StyleSheet.create({
  formItem: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  control: {
    marginTop: 4,
  },
  errorText: {
    color: '#ef4444',
  },
  errorTextSmall: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: '500',
  },
});