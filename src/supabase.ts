import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables
const supabaseUrl = "https://gzksxtpevqlemztherjr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6a3N4dHBldnFsZW16dGhlcmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzc3NDEsImV4cCI6MjA1NjgxMzc0MX0.l7M_pwoojjVvU09FeUiiPkDLOKNJY_0F6dz8v-s4BT8";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // This can help with CORS issues
  }
});

// Define types for our database tables
export type Participant = {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
};

// Functions to interact with the database
export async function getParticipantsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error getting participants count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting participants count:', error);
    return 0;
  }
}

export async function addParticipant(participant: Omit<Participant, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('participants')
      .insert([{
        ...participant,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error adding participant:', error.message);
      throw new Error(`Failed to add participant: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error; // Re-throw to handle in the component
  }
}

export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getParticipantsList(): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error getting participants:', error);
    return [];
  }
  
  return data || [];
}