import { supabase } from "@/integrations/supabase/client";

/**
 * Gets available grades from existing classes in database
 */
export const getAvailableGrades = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('grade')
    .order('grade', { ascending: true });
  
  if (error) {
    console.error('Error fetching grades:', error);
    return [];
  }

  const uniqueGrades = [...new Set(data.map(c => c.grade))];
  return uniqueGrades.sort();
};

/**
 * Gets available sections for a specific grade from existing classes in database
 */
export const getAvailableSections = async (grade: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('section')
    .eq('grade', grade)
    .order('section', { ascending: true });
  
  if (error) {
    console.error('Error fetching sections:', error);
    return [];
  }

  const uniqueSections = [...new Set(data.map(c => c.section))];
  return uniqueSections.sort();
};

/**
 * Gets available subjects for a specific grade-section combination from database
 */
export const getAvailableSubjects = async (grade: string, section: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('subject')
    .eq('grade', grade)
    .eq('section', section);
  
  if (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }

  return data.map(c => c.subject);
};

/**
 * All possible grades for creating new classes
 */
export const ALL_GRADES = [
  "KG1", "KG2", 
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", 
  "Grade 5", "Grade 6", "Grade 7", "Grade 8", 
  "Grade 9", "Grade 10", "Grade 11", "Grade 12"
];

/**
 * All possible sections for creating new classes
 */
export const ALL_SECTIONS = ["A", "B", "C", "D", "E", "F"];
