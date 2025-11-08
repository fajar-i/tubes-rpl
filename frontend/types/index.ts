export interface UserType {
  id: number;
  name: string;
  email: string;
  role: string; // Assuming a 'role' field for the user
}

export interface AppProviderType {
  login: (email: string, password: string) => Promise<void>,
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>,
  isLoading: boolean,
  authToken: string | null,
  setIsLoading: (loading: boolean) => void,
  logout: () => void,
  user: UserType | null; // Added user to AppProviderType
}

export interface RegisterData {
  name?: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

export type OptionForm = {
  id: number;
  text: string;
  is_right?: boolean;
};

export type QuestionForm = {
  id: number;
  text: string;
  options: OptionForm[];
};

export type OptionResult = {
  id: number;
  text: string;
  is_right?: boolean; // is_right bisa jadi undefined jika tidak selalu ada
  option_code?: string; // Tambahkan ini jika API questions mengembalikan option_code
};

export type QuestionResult = {
  id: number;
  text: string;
  options: OptionResult[];
};

export type QuestionJawaban = {
    id: number;
};

export type Project = {
  nama_ujian: string,
  mata_pelajaran?: string,
  kelas?: string,
  semester?: string,
  capaian_pembelajaran?: string,
  indikator_ketercapaian_pembelajaran?: string,
  public_id: string,
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

export type MaterialType = {
  id: number;
  project_id: number;
  content: string;
  gemini_file_uri: string;
  created_at: string;
};

export type AIOptionSuggestion = {
  option_code: string;
  text: string;
  is_right: boolean;
};

type SkorAnalyze = {
  kesesuaian_tujuan: {
    skor: number,
    penjelasan: string,
  }; 
  kesesuaian_indikator: {
    skor: number,
    penjelasan: string,
  };
  kedalaman_kognitif: {
    skor: number,
    penjelasan: string,
  };
  kejelasan_perumusan: {
    skor: number,
    penjelasan: string,
  };
  kesesuaian_bentuk: {
    skor: number,
    penjelasan: string,
  };
  kesesuaian_materi: {
    skor: number,
    penjelasan: string,
  };
}

export type AIResultType = {
  id: number;
  text: string;
  options?: { id?: number; text: string; option_code?: string }[];
  ai_suggestion_question?: string | null;
  ai_suggestion_options?: AIOptionSuggestion[] | null;
  is_valid?: boolean;
  note?: string | null;
  skor: SkorAnalyze;
  kesimpulan_validitas: "Valid" | "Sebagian Valid" | "Tidak Valid";
  rata_rata_skor: number | null;
  bloom_taxonomy?: string | null;
  showSuggestion?: boolean;
};