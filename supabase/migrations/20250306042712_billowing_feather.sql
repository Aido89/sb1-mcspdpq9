/*
  # Initial Schema Setup

  1. New Tables
    - `participants`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `participants` table
    - Add policies for:
      - Authenticated admins can read all participants
      - Anyone can insert new participants
*/

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable insert access for all users" ON participants
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users only" ON participants
  FOR SELECT
  TO authenticated
  USING (true);