// ─── Shared TypeScript types ──────────────────────────────────────────────────

export interface StoryboardScene {
  id: string;
  time_offset: number;
  action_type: ActionType;
  payload: Record<string, unknown>;
}

export type ExplanationMode =
  | "full_lesson"    // Teacher-style lesson with narration and rich visuals
  | "visual_first"   // Heavy whiteboard focus, emphasis on diagrams
  | "step_by_step"   // Slow step-by-step walkthrough of each concept
  | "qa_mode"        // Quiz/Q&A format, tests understanding throughout
  | "text_focus";    // Dense text explanation with supporting visuals

export type ActionType =
  | "draw_text"
  | "draw_arrow"
  | "draw_circle"
  | "draw_rect"
  | "draw_object"
  | "draw_graph"
  | "draw_path"
  | "draw_badge"
  | "draw_callout"
  | "draw_line"
  | "highlight"
  | "underline"
  | "clear"
  | "show_equation"
  | "draw_coordinate_system"
  | "draw_physics_shape"
  | "draw_table"
  | "draw_highlight"
  | "draw_caption"
  | "camera"
  | "sandbox_question"
  // ── Programming-specific action types ──
  | "draw_code_block"
  | "draw_linked_list"
  | "draw_tree_struct"
  | "draw_graph_struct"
  | "draw_sorting"
  | "draw_flowchart"
  | "draw_uml"
  | "draw_big_o"
  | "draw_network"
  | "draw_datastream"
  | "write_text"
  // ── Advanced CS domains ──
  | "draw_cpu"
  | "draw_os_memory"
  | "draw_compiler"
  | "draw_network_packet"
  | "draw_db_schema"
  | "draw_state_machine"
  | "draw_turing"
  | "draw_blockchain"
  | "draw_security_shield"
  | "draw_quantum"
  | "draw_design_pattern"
  | "draw_testing_pyramid"
  | "draw_regex"
  | "draw_api"
  | "draw_math_formula"
  | "draw_language_showcase"
  | "draw_algorithm_complex"
  | "draw_code_diff"
  | "draw_architecture_diagram";

export interface LessonPart {
  id: string;
  order_index: number;
  title: string;
  narration: string | null;
  duration_seconds: number;
  audio_url: string | null;
  part_type: "content" | "quiz" | "final_quiz" | "exercise";
  scenes: StoryboardScene[];
  exercise_block_id?: string;
}

export interface LessonExerciseBlock {
  _id: string;
  lessonId: string;
  title: string;
  instructions: string;
  language: string;
  starterCode: string;
  hints: { order: number; text: string }[];
  difficulty: string;
  order: number;
  isRequired: boolean;
  xpReward: number;
  testCases: { id: string; input: string; expectedOutput: string; isHidden: boolean; description: string }[];
}

export interface Lesson {
  id: string;
  title: string;
  subject: string | null;
  source_filename: string;
  summary: string | null;
  status: "processing" | "ready" | "error";
  created_at: string;
  series_id: string | null;
  lesson_index: number;
  total_lessons: number;
  parts: LessonPart[];
}

export interface LessonStatus {
  id: string;
  status: string;
  title: string | null;
  parts_count: number;
  processing_step?: string;
  error_message?: string | null;
  series_id?: string | null;
  lesson_index?: number;
  total_lessons?: number;
}

// A lightweight lesson summary returned by the series endpoint
export interface SeriesLesson {
  id: string;
  status: "processing" | "ready" | "error";
  title: string | null;
  lesson_index: number;
  total_lessons: number;
  processing_step: string;
  error_message: string | null;
}

// ─── Quiz types ───────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  order_index: number;
  question_type: "mcq" | "fill_blank" | "short_answer" | "graph_interpretation";
  question_text: string;
  options: {
    choices: string[];
    correct: string;
  } | null;
  difficulty: "easy" | "medium" | "hard";
}

export interface Quiz {
  id: string;
  part_id: string;
  questions: QuizQuestion[];
}

export interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  score: number | null;
  passed: boolean;
  feedback: Record<
    string,
    { correct: boolean; correct_answer: string; explanation: string }
  > | null;
}

// ─── Animation ────────────────────────────────────────────────────────────────

export interface DrawTextPayload {
  content: string;
  position: [number, number];
  style?: {
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    textAnchor?: "start" | "middle" | "end";
    fontStyle?: string;
  };
}

export interface DrawArrowPayload {
  from: [number, number];
  to: [number, number];
  label?: string;
  style?: { color?: string; strokeWidth?: number };
}

export interface DrawCirclePayload {
  center: [number, number];
  radius: number;
  label?: string;
  style?: { fill?: string; stroke?: string; strokeWidth?: number };
}

export interface DrawRectPayload {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  style?: { fill?: string; stroke?: string; strokeWidth?: number };
}

export interface DrawGraphPayload {
  graph_type: "bar" | "line" | "scatter";
  data: {
    labels?: string[];
    values: number[];
    x_values?: number[];
  };
  position: [number, number];
  size: [number, number];
  title?: string;
}

export interface SandboxQuestionPayload {
  title?: string;
  instructions?: string;
  language?: string;
  starterCode?: string;
  testCases?: {
    id: string;
    input: string;
    expectedOutput: string;
    description: string;
  }[];
}

export interface ShowEquationPayload {
  latex: string;
  position: [number, number];
  style?: { fontSize?: number; color?: string };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  ready: number;
  processing: number;
  error: number;
  totalAttempts: number;
  avgScore: number | null;
  passRate: number | null;
}

export interface DashboardLesson {
  id: string;
  title: string;
  subject: string | null;
  source_filename: string;
  summary: string | null;
  status: "processing" | "ready" | "error";
  processing_step: string;
  error_message: string | null;
  parts_count: number;
  series_id: string | null;
  lesson_index: number;
  total_lessons: number;
  created_at: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  lessons: DashboardLesson[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
