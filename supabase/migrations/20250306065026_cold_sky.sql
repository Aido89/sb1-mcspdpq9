/*
  # Create participants table

  1. New Tables
    - `participants`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `phone` (text, not null)
      - `email` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `participants` table
    - Add policies for:
      - Authenticated users can insert new participants
      - Authenticated users can read all participants (for admin panel)
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

-- Create policies
CREATE POLICY "Anyone can insert participants"
  ON participants
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view participants"
  ON participants
  FOR SELECT
  TO authenticated
  USING (true);