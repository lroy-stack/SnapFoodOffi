/*
  # Grant admin privileges to user

  1. Changes:
    - Updates the specified user's role to 'admin' in the benutzer_profil table
    - Uses user's auth_id for exact identification
    - Includes a safety check to make sure the user exists
  
  2. Security:
    - Only updates the single specified user
    - Operation is idempotent (safe to run multiple times)
*/

-- Update the user's role to admin
DO $$ 
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if the user exists before attempting update
  SELECT EXISTS (
    SELECT 1 FROM benutzer_profil WHERE auth_id = '744b3fec-4cbd-4da2-8c62-51158ac2b738'
  ) INTO user_exists;

  -- Only attempt update if user exists
  IF user_exists THEN
    UPDATE benutzer_profil
    SET 
      rolle = 'admin',
      aktualisiert_am = now()
    WHERE 
      auth_id = '744b3fec-4cbd-4da2-8c62-51158ac2b738';
    
    RAISE NOTICE 'Admin privileges granted to user with auth_id 744b3fec-4cbd-4da2-8c62-51158ac2b738 (simpalori@gmail.com)';
  ELSE
    RAISE NOTICE 'User with auth_id 744b3fec-4cbd-4da2-8c62-51158ac2b738 not found. No changes made.';
  END IF;
END $$;

-- Insert a record in admin_protokoll to log this change
DO $$ 
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user's benutzer_profil id
  SELECT id INTO admin_user_id FROM benutzer_profil 
  WHERE auth_id = '744b3fec-4cbd-4da2-8c62-51158ac2b738';
  
  -- Only log if we found the user
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO admin_protokoll (
      admin_id,
      aktion,
      details
    ) VALUES (
      admin_user_id,
      'Role change to admin',
      jsonb_build_object(
        'method', 'Migration',
        'timestamp', now(),
        'email', 'simpalori@gmail.com'
      )
    );
  END IF;
END $$;