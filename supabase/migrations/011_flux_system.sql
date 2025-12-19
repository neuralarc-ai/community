-- Create the ENUM type for action_type if it doesn't already exist
DO $$ BEGIN
    CREATE TYPE public.flux_action_type AS ENUM ('POST_CREATE', 'COMMENT_CREATE', 'CONCLAVE_JOIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN total_flux BIGINT DEFAULT 0,
ADD COLUMN posts_count INT DEFAULT 0,
ADD COLUMN comments_count INT DEFAULT 0,
ADD COLUMN conclaves_attended INT DEFAULT 0;

-- Create index for total_flux for efficient sorting
CREATE INDEX IF NOT EXISTS idx_profiles_total_flux ON public.profiles (total_flux DESC);

-- Create the flux_logs table
CREATE TABLE public.flux_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    action_type public.flux_action_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the handle_new_flux_log function
CREATE OR REPLACE FUNCTION public.handle_new_flux_log()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET
        total_flux = total_flux + NEW.amount,
        posts_count = CASE WHEN NEW.action_type = 'POST_CREATE' THEN posts_count + 1 ELSE posts_count END,
        comments_count = CASE WHEN NEW.action_type = 'COMMENT_CREATE' THEN comments_count + 1 ELSE comments_count END,
        conclaves_attended = CASE WHEN NEW.action_type = 'CONCLAVE_JOIN' THEN conclaves_attended + 1 ELSE conclaves_attended END
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for flux_logs table
CREATE OR REPLACE TRIGGER tr_handle_new_flux_log
AFTER INSERT ON public.flux_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_new_flux_log();

-- Set up Row Level Security (RLS) for flux_logs (adjust as needed)
ALTER TABLE public.flux_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flux logs." ON public.flux_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flux logs." ON public.flux_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);
