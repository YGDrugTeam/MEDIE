// 1. 기존의 상대 경로 대신, 프로젝트 루트에 새로 만들 Supabase 설정 파일을 참조합니다.
import { supabase } from "../lib/supabase.ts"; 

interface DrugInfo {
  drugId: string;
  drugName: string;
  dosage: string;
  efficacy: string;
  summary: string;
  confidence: number;
}

interface AnalysisResult {
  success: boolean;
  drugInfo?: DrugInfo;
  error?: string;
  stage?: "quality" | "ocr" | "matching" | "summarizing";
  analysisData?: {
    imprint_text?: string;
    shape?: string;
    color?: string;
    description?: string;
  };
}

/**
 * 알약 이미지 분석 (Edge Function 호출)
 */
export const analyzeDrugImage = async (imageData: string): Promise<AnalysisResult> => {
  try {
    // React Native에서는 이미지 데이터가 매우 클 수 있으므로 base64 처리에 유의해야 합니다.
    const { data, error } = await supabase.functions.invoke("analyze-drug", {
      body: { imageData },
    });

    if (error) {
      console.error("Edge function error:", error);
      return {
        success: false,
        error: "서버 연결에 실패했습니다. 다시 시도해주세요.",
      };
    }

    return data as AnalysisResult;
  } catch (err) {
    console.error("Network error:", err);
    return {
      success: false,
      error: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
    };
  }
};

/**
 * 알약 텍스트 검색 (Edge Function 호출)
 */
export const searchDrug = async (query: string): Promise<AnalysisResult> => {
  try {
    const { data, error } = await supabase.functions.invoke("search-drug", {
      body: { query },
    });

    if (error) {
      console.error("Search error:", error);
      return {
        success: false,
        error: "검색에 실패했습니다. 다시 시도해주세요.",
      };
    }

    return data as AnalysisResult;
  } catch (err) {
    console.error("Network error:", err);
    return {
      success: false,
      error: "네트워크 오류가 발생했습니다.",
    };
  }
};