'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'professor' | 'student';
          avatar: string | null;
          active: boolean;
          created_at: string;
          last_login: string | null;
          student_group: string | null;
          progress: number | null;
          cases_completed: number | null;
          cases_assigned: number | null;
          department: string | null;
          total_students: number | null;
          total_cases: number | null;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'> & { created_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      cases: {
        Row: {
          id: string;
          title: string;
          description: string;
          objectives: string[];
          instructions: string;
          difficulty: 'basic' | 'intermediate' | 'advanced';
          category: string;
          deadline: string | null;
          evaluation_criteria: string[];
          suggested_resources: string[];
          status: 'draft' | 'published' | 'archived';
          professor_id: string;
          professor_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['cases']['Row']>;
      };
      assignments: {
        Row: {
          id: string;
          case_id: string;
          student_id: string;
          student_name: string;
          status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
          response: string | null;
          submitted_at: string | null;
          feedback: string | null;
          score: number | null;
          max_score: number;
          progress: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assignments']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['assignments']['Row']>;
      };
      evaluations: {
        Row: {
          id: string;
          assignment_id: string;
          case_id: string;
          case_title: string;
          student_id: string;
          student_name: string;
          response: string;
          score: number | null;
          max_score: number;
          feedback: string | null;
          status: 'pending' | 'reviewed';
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['evaluations']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['evaluations']['Row']>;
      };
      rubric_items: {
        Row: {
          id: string;
          evaluation_id: string;
          criterion: string;
          max_score: number;
          score: number | null;
          comment: string | null;
          sort_order: number;
        };
        Insert: Omit<Database['public']['Tables']['rubric_items']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['rubric_items']['Row']>;
      };
      bibliography_items: {
        Row: {
          id: string;
          user_id: string;
          type: 'book' | 'article' | 'web' | 'journal' | 'doi';
          author: string;
          title: string;
          year: string;
          publisher: string | null;
          journal: string | null;
          url: string | null;
          doi: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bibliography_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['bibliography_items']['Row']>;
      };
      hedge_rules: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: 'search' | 'verification' | 'evaluation';
          active: boolean;
          examples: string[];
          professor_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hedge_rules']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['hedge_rules']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_name: string;
          action: string;
          resource: string;
          resource_id: string | null;
          ip: string;
          details: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          context: 'student' | 'professor' | 'admin';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['chat_messages']['Row']>;
      };
      competencies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          level: number;
        };
        Insert: Omit<Database['public']['Tables']['competencies']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['competencies']['Row']>;
      };
    };
  };
};
