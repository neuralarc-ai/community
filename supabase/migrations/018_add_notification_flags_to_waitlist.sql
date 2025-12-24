-- Add notified_15_min column
ALTER TABLE workshop_waitlist
ADD COLUMN notified_15_min BOOLEAN DEFAULT FALSE;

-- Add notified_5_min column
ALTER TABLE workshop_waitlist
ADD COLUMN notified_5_min BOOLEAN DEFAULT FALSE;
