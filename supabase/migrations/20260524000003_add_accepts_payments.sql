-- Add accepts_payments column to properties table
ALTER TABLE public.properties 
ADD COLUMN accepts_payments BOOLEAN NOT NULL DEFAULT true;
