export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RunningGoal = '5k' | '10k' | 'half_marathon' | 'marathon' | 'custom'
export type WorkoutType = 'easy_run' | 'long_run' | 'tempo' | 'intervals' | 'recovery' | 'rest'
export type EffortLevel = 'easy' | 'moderate' | 'hard' | 'very_hard'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
        }
      }
      training_plans: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          plan_name: string
          goal: RunningGoal
          training_frequency: number
          race_date: string | null
          goal_time: string | null
          personal_best_time: string | null
          notes: string | null
          special_events: string | null
          injury_history: string | null
          start_date: string
          end_date: string
          weekly_schedule: Json
          ai_recommendations: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          plan_name: string
          goal: RunningGoal
          training_frequency: number
          race_date?: string | null
          goal_time?: string | null
          personal_best_time?: string | null
          notes?: string | null
          special_events?: string | null
          injury_history?: string | null
          start_date: string
          end_date: string
          weekly_schedule: Json
          ai_recommendations?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          plan_name?: string
          goal?: RunningGoal
          training_frequency?: number
          race_date?: string | null
          goal_time?: string | null
          personal_best_time?: string | null
          notes?: string | null
          special_events?: string | null
          injury_history?: string | null
          start_date?: string
          end_date?: string
          weekly_schedule?: Json
          ai_recommendations?: string | null
          is_active?: boolean
        }
      }
      workout_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          training_plan_id: string | null
          date: string
          workout_type: WorkoutType
          planned_distance: number | null
          actual_distance: number | null
          planned_duration: number | null
          actual_duration: number | null
          effort_level: EffortLevel | null
          notes: string | null
          completed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          training_plan_id?: string | null
          date: string
          workout_type: WorkoutType
          planned_distance?: number | null
          actual_distance?: number | null
          planned_duration?: number | null
          actual_duration?: number | null
          effort_level?: EffortLevel | null
          notes?: string | null
          completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          training_plan_id?: string | null
          date?: string
          workout_type?: WorkoutType
          planned_distance?: number | null
          actual_distance?: number | null
          planned_duration?: number | null
          actual_duration?: number | null
          effort_level?: EffortLevel | null
          notes?: string | null
          completed?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
