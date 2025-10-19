/**
 * Cohort Entry Code Generator
 * Generates unique, readable 8-character codes for cohorts
 * Excludes ambiguous characters: O, 0, I, 1, L, l
 */

import { supabase } from '../config/database';

// Characters used in code generation (excluding ambiguous ones)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

/**
 * Generate a random entry code
 */
export function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    code += CODE_CHARS[randomIndex];
  }
  return code;
}

/**
 * Generate a unique entry code that doesn't exist in the database
 * @param maxAttempts Maximum number of attempts to generate a unique code
 */
export async function generateUniqueCode(maxAttempts: number = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCode();
    
    // Check if code already exists
    const { data, error } = await supabase
      .from('cohorts')
      .select('id')
      .eq('entry_code', code)
      .single();
    
    // If no data found (and no error except for PGRST116 which means no rows), code is unique
    if (!data && (!error || error.code === 'PGRST116')) {
      return code;
    }
  }
  
  throw new Error('Failed to generate unique cohort code after maximum attempts');
}

/**
 * Validate an entry code format
 */
export function isValidCodeFormat(code: string): boolean {
  if (code.length !== CODE_LENGTH) {
    return false;
  }
  
  // Check if all characters are valid
  for (const char of code.toUpperCase()) {
    if (!CODE_CHARS.includes(char)) {
      return false;
    }
  }
  
  return true;
}

