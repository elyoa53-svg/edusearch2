'use client';

import { supabase } from './supabase';
import {
  User, Student, Professor, Case, Assignment, Evaluation,
  BibliographyItem, AuditLog, HedgeRule, ChatMessage,
  UserRole, Competency, RubricItem
} from './types';
import { getChatResponse, simulateVerification, formatAPA, formatVancouver } from './repository';

// Re-export formatting helpers
export { getChatResponse, simulateVerification, formatAPA, formatVancouver };

// ── helpers ──────────────────────────────────────────────────────────────────

function profileToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as UserRole,
    avatar: row.avatar as string | undefined,
    active: row.active as boolean,
    createdAt: row.created_at as string,
    lastLogin: row.last_login as string | undefined,
  };
}

function profileToStudent(row: Record<string, unknown>, competencies: Competency[]): Student {
  return {
    ...profileToUser(row),
    role: 'student',
    group: row.student_group as string | undefined,
    progress: (row.progress as number) ?? 0,
    casesCompleted: (row.cases_completed as number) ?? 0,
    casesAssigned: (row.cases_assigned as number) ?? 0,
    competencies,
  };
}

function profileToProfessor(row: Record<string, unknown>): Professor {
  return {
    ...profileToUser(row),
    role: 'professor',
    department: row.department as string | undefined,
    totalStudents: (row.total_students as number) ?? 0,
    totalCases: (row.total_cases as number) ?? 0,
  };
}

function caseFromRow(row: Record<string, unknown>): Case {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    objectives: (row.objectives as string[]) ?? [],
    instructions: row.instructions as string,
    difficulty: row.difficulty as Case['difficulty'],
    category: row.category as string,
    deadline: row.deadline as string | undefined,
    evaluationCriteria: (row.evaluation_criteria as string[]) ?? [],
    suggestedResources: (row.suggested_resources as string[]) ?? [],
    status: row.status as Case['status'],
    professorId: row.professor_id as string,
    professorName: row.professor_name as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    assignedTo: (row.assignedTo as string[]) ?? [],
  };
}

function assignmentFromRow(row: Record<string, unknown>): Assignment {
  return {
    id: row.id as string,
    caseId: row.case_id as string,
    studentId: row.student_id as string,
    studentName: row.student_name as string,
    status: row.status as Assignment['status'],
    response: row.response as string | undefined,
    submittedAt: row.submitted_at as string | undefined,
    feedback: row.feedback as string | undefined,
    score: row.score as number | undefined,
    maxScore: row.max_score as number,
    progress: row.progress as number,
  };
}

function evaluationFromRow(row: Record<string, unknown>, rubric: RubricItem[]): Evaluation {
  return {
    id: row.id as string,
    assignmentId: row.assignment_id as string,
    caseId: row.case_id as string,
    caseTitle: row.case_title as string,
    studentId: row.student_id as string,
    studentName: row.student_name as string,
    response: row.response as string,
    score: row.score as number | undefined,
    maxScore: row.max_score as number,
    feedback: row.feedback as string | undefined,
    status: row.status as Evaluation['status'],
    reviewedAt: row.reviewed_at as string | undefined,
    reviewedBy: row.reviewed_by as string | undefined,
    rubric,
  };
}

// ── userRepo ─────────────────────────────────────────────────────────────────

export const sbUserRepo = {
  async getAll(): Promise<User[]> {
    const { data } = await supabase.from('profiles').select('*');
    if (!data) return [];
    return data.map(r => {
      if (r.role === 'student') return profileToStudent(r as unknown as Record<string, unknown>, []);
      if (r.role === 'professor') return profileToProfessor(r as unknown as Record<string, unknown>);
      return profileToUser(r as unknown as Record<string, unknown>);
    });
  },

  async getById(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (!data) return undefined;
    if (data.role === 'professor') return profileToProfessor(data as unknown as Record<string, unknown>);
    if (data.role === 'student') {
      const { data: comps } = await supabase.from('competencies').select('*').eq('user_id', id);
      const competencies: Competency[] = (comps ?? []).map(c => ({ name: c.name, level: c.level }));
      return profileToStudent(data as unknown as Record<string, unknown>, competencies);
    }
    return profileToUser(data as unknown as Record<string, unknown>);
  },

  async getByEmail(email: string): Promise<User | undefined> {
    const { data } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
    if (!data) return undefined;
    if (data.role === 'professor') return profileToProfessor(data as unknown as Record<string, unknown>);
    if (data.role === 'student') {
      const { data: comps } = await supabase.from('competencies').select('*').eq('user_id', data.id);
      const competencies: Competency[] = (comps ?? []).map(c => ({ name: c.name, level: c.level }));
      return profileToStudent(data as unknown as Record<string, unknown>, competencies);
    }
    return profileToUser(data as unknown as Record<string, unknown>);
  },

  async getByRole(role: UserRole): Promise<User[]> {
    const { data } = await supabase.from('profiles').select('*').eq('role', role);
    if (!data) return [];
    return data.map(r => {
      if (r.role === 'student') return profileToStudent(r as unknown as Record<string, unknown>, []);
      if (r.role === 'professor') return profileToProfessor(r as unknown as Record<string, unknown>);
      return profileToUser(r as unknown as Record<string, unknown>);
    });
  },

  async update(id: string, data: Partial<User>): Promise<User | undefined> {
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.avatar !== undefined) update.avatar = data.avatar;
    if (data.active !== undefined) update.active = data.active;
    if (data.lastLogin !== undefined) update.last_login = data.lastLogin;
    if ('group' in data) update.student_group = (data as Partial<Student>).group;
    if ('progress' in data) update.progress = (data as Partial<Student>).progress;
    if ('casesCompleted' in data) update.cases_completed = (data as Partial<Student>).casesCompleted;
    if ('casesAssigned' in data) update.cases_assigned = (data as Partial<Student>).casesAssigned;
    if ('department' in data) update.department = (data as Partial<Professor>).department;
    if ('totalStudents' in data) update.total_students = (data as Partial<Professor>).totalStudents;
    if ('totalCases' in data) update.total_cases = (data as Partial<Professor>).totalCases;

    const { data: updated } = await supabase.from('profiles').update(update).eq('id', id).select().maybeSingle();
    if (!updated) return undefined;
    return profileToUser(updated as unknown as Record<string, unknown>);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    return !error;
  },
};

// ── caseRepo ─────────────────────────────────────────────────────────────────

export const sbCaseRepo = {
  async getAll(): Promise<Case[]> {
    const { data: cases } = await supabase.from('cases').select('*');
    if (!cases) return [];
    const caseIds = cases.map(c => c.id);
    const { data: assignments } = caseIds.length
      ? await supabase.from('assignments').select('case_id, student_id').in('case_id', caseIds)
      : { data: [] };
    const assignedMap: Record<string, string[]> = {};
    for (const a of assignments ?? []) {
      if (!assignedMap[a.case_id]) assignedMap[a.case_id] = [];
      assignedMap[a.case_id].push(a.student_id);
    }
    return cases.map(c => caseFromRow({ ...c, assignedTo: assignedMap[c.id] ?? [] } as unknown as Record<string, unknown>));
  },

  async getById(id: string): Promise<Case | undefined> {
    const { data } = await supabase.from('cases').select('*').eq('id', id).maybeSingle();
    if (!data) return undefined;
    const { data: assignments } = await supabase.from('assignments').select('student_id').eq('case_id', id);
    return caseFromRow({ ...data, assignedTo: (assignments ?? []).map(a => a.student_id) } as unknown as Record<string, unknown>);
  },

  async getByProfessor(professorId: string): Promise<Case[]> {
    const { data: cases } = await supabase.from('cases').select('*').eq('professor_id', professorId);
    if (!cases) return [];
    const caseIds = cases.map(c => c.id);
    const { data: assignments } = caseIds.length
      ? await supabase.from('assignments').select('case_id, student_id').in('case_id', caseIds)
      : { data: [] };
    const assignedMap: Record<string, string[]> = {};
    for (const a of assignments ?? []) {
      if (!assignedMap[a.case_id]) assignedMap[a.case_id] = [];
      assignedMap[a.case_id].push(a.student_id);
    }
    return cases.map(c => caseFromRow({ ...c, assignedTo: assignedMap[c.id] ?? [] } as unknown as Record<string, unknown>));
  },

  async getByStudent(studentId: string): Promise<Case[]> {
    const { data: assignments } = await supabase.from('assignments').select('case_id').eq('student_id', studentId);
    if (!assignments?.length) return [];
    const caseIds = assignments.map(a => a.case_id);
    const { data: cases } = await supabase.from('cases').select('*').in('id', caseIds);
    return (cases ?? []).map(c => caseFromRow({ ...c, assignedTo: [studentId] } as unknown as Record<string, unknown>));
  },

  async create(c: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    const { assignedTo, ...rest } = c;
    const { data } = await supabase.from('cases').insert({
      title: rest.title,
      description: rest.description,
      objectives: rest.objectives,
      instructions: rest.instructions,
      difficulty: rest.difficulty,
      category: rest.category,
      deadline: rest.deadline ?? null,
      evaluation_criteria: rest.evaluationCriteria,
      suggested_resources: rest.suggestedResources,
      status: rest.status,
      professor_id: rest.professorId,
      professor_name: rest.professorName,
    }).select().single();
    if (!data) throw new Error('Failed to create case');
    return caseFromRow({ ...data, assignedTo: assignedTo ?? [] } as unknown as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Case>): Promise<Case | undefined> {
    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.objectives !== undefined) update.objectives = data.objectives;
    if (data.instructions !== undefined) update.instructions = data.instructions;
    if (data.difficulty !== undefined) update.difficulty = data.difficulty;
    if (data.category !== undefined) update.category = data.category;
    if (data.deadline !== undefined) update.deadline = data.deadline;
    if (data.evaluationCriteria !== undefined) update.evaluation_criteria = data.evaluationCriteria;
    if (data.suggestedResources !== undefined) update.suggested_resources = data.suggestedResources;
    if (data.status !== undefined) update.status = data.status;

    const { data: updated } = await supabase.from('cases').update(update).eq('id', id).select().maybeSingle();
    if (!updated) return undefined;
    const { data: assignments } = await supabase.from('assignments').select('student_id').eq('case_id', id);
    return caseFromRow({ ...updated, assignedTo: (assignments ?? []).map(a => a.student_id) } as unknown as Record<string, unknown>);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('cases').delete().eq('id', id);
    return !error;
  },
};

// ── assignmentRepo ────────────────────────────────────────────────────────────

export const sbAssignmentRepo = {
  async getAll(): Promise<Assignment[]> {
    const { data } = await supabase.from('assignments').select('*');
    return (data ?? []).map(r => assignmentFromRow(r as unknown as Record<string, unknown>));
  },

  async getByStudent(studentId: string): Promise<Assignment[]> {
    const { data } = await supabase.from('assignments').select('*').eq('student_id', studentId);
    return (data ?? []).map(r => assignmentFromRow(r as unknown as Record<string, unknown>));
  },

  async getByCase(caseId: string): Promise<Assignment[]> {
    const { data } = await supabase.from('assignments').select('*').eq('case_id', caseId);
    return (data ?? []).map(r => assignmentFromRow(r as unknown as Record<string, unknown>));
  },

  async getById(id: string): Promise<Assignment | undefined> {
    const { data } = await supabase.from('assignments').select('*').eq('id', id).maybeSingle();
    if (!data) return undefined;
    return assignmentFromRow(data as unknown as Record<string, unknown>);
  },

  async create(a: Omit<Assignment, 'id'>): Promise<Assignment> {
    const { data } = await supabase.from('assignments').insert({
      case_id: a.caseId,
      student_id: a.studentId,
      student_name: a.studentName,
      status: a.status,
      response: a.response ?? null,
      submitted_at: a.submittedAt ?? null,
      feedback: a.feedback ?? null,
      score: a.score ?? null,
      max_score: a.maxScore,
      progress: a.progress,
    }).select().single();
    if (!data) throw new Error('Failed to create assignment');
    return assignmentFromRow(data as unknown as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Assignment>): Promise<Assignment | undefined> {
    const update: Record<string, unknown> = {};
    if (data.status !== undefined) update.status = data.status;
    if (data.response !== undefined) update.response = data.response;
    if (data.submittedAt !== undefined) update.submitted_at = data.submittedAt;
    if (data.feedback !== undefined) update.feedback = data.feedback;
    if (data.score !== undefined) update.score = data.score;
    if (data.progress !== undefined) update.progress = data.progress;

    const { data: updated } = await supabase.from('assignments').update(update).eq('id', id).select().maybeSingle();
    if (!updated) return undefined;
    return assignmentFromRow(updated as unknown as Record<string, unknown>);
  },
};

// ── evaluationRepo ────────────────────────────────────────────────────────────

export const sbEvaluationRepo = {
  async getAll(): Promise<Evaluation[]> {
    const { data } = await supabase.from('evaluations').select('*, rubric_items(*)');
    return (data ?? []).map(r => {
      const items: RubricItem[] = ((r as unknown as Record<string, unknown>).rubric_items as Array<Record<string, unknown>> ?? []).map(ri => ({
        criterion: ri.criterion as string,
        maxScore: ri.max_score as number,
        score: ri.score as number | undefined,
        comment: ri.comment as string | undefined,
      }));
      return evaluationFromRow(r as unknown as Record<string, unknown>, items);
    });
  },

  async getById(id: string): Promise<Evaluation | undefined> {
    const { data } = await supabase.from('evaluations').select('*, rubric_items(*)').eq('id', id).maybeSingle();
    if (!data) return undefined;
    const items: RubricItem[] = ((data as unknown as Record<string, unknown>).rubric_items as Array<Record<string, unknown>> ?? []).map(ri => ({
      criterion: ri.criterion as string,
      maxScore: ri.max_score as number,
      score: ri.score as number | undefined,
      comment: ri.comment as string | undefined,
    }));
    return evaluationFromRow(data as unknown as Record<string, unknown>, items);
  },

  async getByStudent(studentId: string): Promise<Evaluation[]> {
    const { data } = await supabase.from('evaluations').select('*, rubric_items(*)').eq('student_id', studentId);
    return (data ?? []).map(r => {
      const items: RubricItem[] = ((r as unknown as Record<string, unknown>).rubric_items as Array<Record<string, unknown>> ?? []).map(ri => ({
        criterion: ri.criterion as string,
        maxScore: ri.max_score as number,
        score: ri.score as number | undefined,
        comment: ri.comment as string | undefined,
      }));
      return evaluationFromRow(r as unknown as Record<string, unknown>, items);
    });
  },

  async getByProfessor(professorId: string): Promise<Evaluation[]> {
    const { data: cases } = await supabase.from('cases').select('id').eq('professor_id', professorId);
    if (!cases?.length) return [];
    const caseIds = cases.map(c => c.id);
    const { data } = await supabase.from('evaluations').select('*, rubric_items(*)').in('case_id', caseIds);
    return (data ?? []).map(r => {
      const items: RubricItem[] = ((r as unknown as Record<string, unknown>).rubric_items as Array<Record<string, unknown>> ?? []).map(ri => ({
        criterion: ri.criterion as string,
        maxScore: ri.max_score as number,
        score: ri.score as number | undefined,
        comment: ri.comment as string | undefined,
      }));
      return evaluationFromRow(r as unknown as Record<string, unknown>, items);
    });
  },

  async create(e: Omit<Evaluation, 'id'>): Promise<Evaluation> {
    const { rubric, ...rest } = e;
    const { data } = await supabase.from('evaluations').insert({
      assignment_id: rest.assignmentId,
      case_id: rest.caseId,
      case_title: rest.caseTitle,
      student_id: rest.studentId,
      student_name: rest.studentName,
      response: rest.response,
      score: rest.score ?? null,
      max_score: rest.maxScore,
      feedback: rest.feedback ?? null,
      status: rest.status,
      reviewed_at: rest.reviewedAt ?? null,
      reviewed_by: rest.reviewedBy ?? null,
    }).select().single();
    if (!data) throw new Error('Failed to create evaluation');

    if (rubric?.length) {
      await supabase.from('rubric_items').insert(
        rubric.map((ri, i) => ({
          evaluation_id: data.id,
          criterion: ri.criterion,
          max_score: ri.maxScore,
          score: ri.score ?? null,
          comment: ri.comment ?? null,
          sort_order: i,
        }))
      );
    }
    return evaluationFromRow(data as unknown as Record<string, unknown>, rubric ?? []);
  },

  async update(id: string, data: Partial<Evaluation>): Promise<Evaluation | undefined> {
    const update: Record<string, unknown> = {};
    if (data.score !== undefined) update.score = data.score;
    if (data.feedback !== undefined) update.feedback = data.feedback;
    if (data.status !== undefined) update.status = data.status;
    if (data.reviewedAt !== undefined) update.reviewed_at = data.reviewedAt;
    if (data.reviewedBy !== undefined) update.reviewed_by = data.reviewedBy;

    await supabase.from('evaluations').update(update).eq('id', id);

    if (data.rubric?.length) {
      await supabase.from('rubric_items').delete().eq('evaluation_id', id);
      await supabase.from('rubric_items').insert(
        data.rubric.map((ri, i) => ({
          evaluation_id: id,
          criterion: ri.criterion,
          max_score: ri.maxScore,
          score: ri.score ?? null,
          comment: ri.comment ?? null,
          sort_order: i,
        }))
      );
    }

    return this.getById(id);
  },
};

// ── bibliographyRepo ──────────────────────────────────────────────────────────

export const sbBibliographyRepo = {
  async getByUser(userId: string): Promise<BibliographyItem[]> {
    const { data } = await supabase.from('bibliography_items').select('*').eq('user_id', userId);
    return (data ?? []).map(r => ({
      id: r.id,
      type: r.type as BibliographyItem['type'],
      author: r.author,
      title: r.title,
      year: r.year,
      publisher: r.publisher ?? undefined,
      journal: r.journal ?? undefined,
      url: r.url ?? undefined,
      doi: r.doi ?? undefined,
      userId: r.user_id,
      createdAt: r.created_at,
    }));
  },

  async create(b: Omit<BibliographyItem, 'id' | 'createdAt'>): Promise<BibliographyItem> {
    const { data } = await supabase.from('bibliography_items').insert({
      user_id: b.userId,
      type: b.type,
      author: b.author,
      title: b.title,
      year: b.year,
      publisher: b.publisher ?? null,
      journal: b.journal ?? null,
      url: b.url ?? null,
      doi: b.doi ?? null,
    }).select().single();
    if (!data) throw new Error('Failed to create bibliography item');
    return { ...b, id: data.id, createdAt: data.created_at };
  },

  async update(id: string, data: Partial<BibliographyItem>): Promise<BibliographyItem | undefined> {
    const update: Record<string, unknown> = {};
    if (data.author !== undefined) update.author = data.author;
    if (data.title !== undefined) update.title = data.title;
    if (data.year !== undefined) update.year = data.year;
    if (data.publisher !== undefined) update.publisher = data.publisher;
    if (data.journal !== undefined) update.journal = data.journal;
    if (data.url !== undefined) update.url = data.url;
    if (data.doi !== undefined) update.doi = data.doi;
    const { data: updated } = await supabase.from('bibliography_items').update(update).eq('id', id).select().maybeSingle();
    if (!updated) return undefined;
    return {
      id: updated.id, type: updated.type as BibliographyItem['type'],
      author: updated.author, title: updated.title, year: updated.year,
      publisher: updated.publisher ?? undefined, journal: updated.journal ?? undefined,
      url: updated.url ?? undefined, doi: updated.doi ?? undefined,
      userId: updated.user_id, createdAt: updated.created_at,
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('bibliography_items').delete().eq('id', id);
    return !error;
  },
};

// ── hedgeRepo ─────────────────────────────────────────────────────────────────

export const sbHedgeRepo = {
  async getAll(): Promise<HedgeRule[]> {
    const { data } = await supabase.from('hedge_rules').select('*');
    return (data ?? []).map(r => ({
      id: r.id, name: r.name, description: r.description,
      category: r.category as HedgeRule['category'], active: r.active,
      examples: r.examples, professorId: r.professor_id, createdAt: r.created_at,
    }));
  },

  async getByProfessor(professorId: string): Promise<HedgeRule[]> {
    const { data } = await supabase.from('hedge_rules').select('*').eq('professor_id', professorId);
    return (data ?? []).map(r => ({
      id: r.id, name: r.name, description: r.description,
      category: r.category as HedgeRule['category'], active: r.active,
      examples: r.examples, professorId: r.professor_id, createdAt: r.created_at,
    }));
  },

  async create(h: Omit<HedgeRule, 'id' | 'createdAt'>): Promise<HedgeRule> {
    const { data } = await supabase.from('hedge_rules').insert({
      name: h.name, description: h.description, category: h.category,
      active: h.active, examples: h.examples, professor_id: h.professorId,
    }).select().single();
    if (!data) throw new Error('Failed to create hedge rule');
    return { ...h, id: data.id, createdAt: data.created_at };
  },

  async update(id: string, data: Partial<HedgeRule>): Promise<HedgeRule | undefined> {
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.category !== undefined) update.category = data.category;
    if (data.active !== undefined) update.active = data.active;
    if (data.examples !== undefined) update.examples = data.examples;
    const { data: updated } = await supabase.from('hedge_rules').update(update).eq('id', id).select().maybeSingle();
    if (!updated) return undefined;
    return {
      id: updated.id, name: updated.name, description: updated.description,
      category: updated.category as HedgeRule['category'], active: updated.active,
      examples: updated.examples, professorId: updated.professor_id, createdAt: updated.created_at,
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('hedge_rules').delete().eq('id', id);
    return !error;
  },
};

// ── auditRepo ─────────────────────────────────────────────────────────────────

export const sbAuditRepo = {
  async getAll(): Promise<AuditLog[]> {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    return (data ?? []).map(r => ({
      id: r.id, userId: r.user_id ?? '', userName: r.user_name,
      action: r.action, resource: r.resource, resourceId: r.resource_id ?? undefined,
      ip: r.ip, timestamp: r.created_at, details: r.details ?? undefined,
    }));
  },

  async create(log: Omit<AuditLog, 'id'>): Promise<AuditLog> {
    const { data } = await supabase.from('audit_logs').insert({
      user_id: log.userId || null,
      user_name: log.userName,
      action: log.action,
      resource: log.resource,
      resource_id: log.resourceId ?? null,
      ip: log.ip,
      details: log.details ?? null,
    }).select().single();
    if (!data) throw new Error('Failed to create audit log');
    return { ...log, id: data.id, timestamp: data.created_at };
  },

  async clear(): Promise<void> {
    await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  },
};

// ── chatRepo ──────────────────────────────────────────────────────────────────

export const sbChatRepo = {
  async getByUser(userId: string, context: string): Promise<ChatMessage[]> {
    const { data } = await supabase.from('chat_messages').select('*')
      .eq('user_id', userId).eq('context', context).order('created_at', { ascending: true });
    return (data ?? []).map(r => ({
      id: r.id, role: r.role as ChatMessage['role'], content: r.content,
      timestamp: r.created_at, userId: r.user_id,
      context: r.context as ChatMessage['context'],
    }));
  },

  async create(msg: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const { data } = await supabase.from('chat_messages').insert({
      user_id: msg.userId, role: msg.role, content: msg.content, context: msg.context,
    }).select().single();
    if (!data) throw new Error('Failed to create chat message');
    return { ...msg, id: data.id, timestamp: data.created_at };
  },

  async clear(userId: string, context: string): Promise<void> {
    await supabase.from('chat_messages').delete().eq('user_id', userId).eq('context', context);
  },
};
