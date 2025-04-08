/*
  # Create participants table for Bays Game

  1. New Tables
    - `participants`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `phone` (text, not null)
      - `email` (text, not null)
      - `created_at` (timestamp with time zone, default: now())
  2. Security
    - Enable RLS on `participants` table
    - Add policy for authenticated users to read all participants
    - Add policy for anonymous users to insert participants
*/

-- Create the participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading participants for authenticated users
CREATE POLICY "Allow authenticated users to read all participants"
  ON participants
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow inserting participants for anonymous users
CREATE POLICY "Allow anonymous users to insert participants"
  ON participants
  FOR INSERT
  TO anon
  WITH CHECK (true);