export interface AppProviderType {
    login: (email: string, password: string) => Promise<void>,
    register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>,
    isLoading: boolean,
    authToken: string | null,
    setIsLoading: (loading: boolean) => void,
    logout: () => void
}

export interface ProductType {
    id?: number,
    title?: string,
    description?: string,
    cost?: number,
    image_Url?: string | null,
    banner_image?: File | null
}

export interface RegisterData {
    name?: string;
    email: string;
    password: string;
    password_confirmation?: string;
}

export type Option = {
  id: number;
  text: string;
  is_right?: boolean; // is_right bisa jadi undefined jika tidak selalu ada
  option_code?: string; // Tambahkan ini jika API questions mengembalikan option_code
};

export type Question = {
  id: number;
  text: string;
  options: Option[];
};

// --- Definisi Tipe untuk Hasil Analisis (sesuai output Backend) ---
export type OptionAnalysis = {
  is_correct: boolean;
  total_prop: number;
  upper_prop: number;
  lower_prop: number;
  effectiveness_score: number | null;
  quality_rating: string;
};

export type QuestionDistractorAnalysis = {
  [optionCode: string]: OptionAnalysis;
};

export type AnalysisResults = {
  validitas_soal: { [key: number]: number | null };
  reliabilitas_tes: number | null;
  tingkat_kesukaran: { [key: number]: number | null };
  daya_beda: { [key: number]: number | null };
  kualitas_pengecoh: {
    [questionId: number]: {
      options: QuestionDistractorAnalysis;
      summary_message: string;
    } | { summary_message: string; options: [] };
  };
  // Tambahan dari backend jika perlu ditampilkan
  k_items?: number;
  sum_of_item_variances?: number;
  total_score_variance?: number;
};