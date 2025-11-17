-- Add payment handles to profiles
-- These allow users to receive payments via different payment platforms
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS venmo_handle TEXT,
ADD COLUMN IF NOT EXISTS paypal_email TEXT,
ADD COLUMN IF NOT EXISTS cashapp_handle TEXT,
ADD COLUMN IF NOT EXISTS zelle_email TEXT,
ADD COLUMN IF NOT EXISTS preferred_payment_method TEXT CHECK (preferred_payment_method IN ('venmo', 'paypal', 'cashapp', 'zelle'));

-- Add payment URL and method to expense_splits
-- payment_url will contain the deep link to the payment app
-- payment_method tracks which method was used
ALTER TABLE public.expense_splits 
ADD COLUMN IF NOT EXISTS payment_url TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('venmo', 'paypal', 'cashapp', 'zelle', 'manual'));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_venmo ON public.profiles(venmo_handle) WHERE venmo_handle IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_paypal ON public.profiles(paypal_email) WHERE paypal_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_cashapp ON public.profiles(cashapp_handle) WHERE cashapp_handle IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_zelle ON public.profiles(zelle_email) WHERE zelle_email IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN public.profiles.venmo_handle IS 'Venmo username without @ symbol';
COMMENT ON COLUMN public.profiles.paypal_email IS 'PayPal email address';
COMMENT ON COLUMN public.profiles.cashapp_handle IS 'Cash App handle without $ symbol';
COMMENT ON COLUMN public.profiles.zelle_email IS 'Zelle email or phone number';
COMMENT ON COLUMN public.profiles.preferred_payment_method IS 'User preferred payment platform';
COMMENT ON COLUMN public.expense_splits.payment_url IS 'Deep link URL to payment app for this split';
COMMENT ON COLUMN public.expense_splits.payment_method IS 'Payment method used for this split';
