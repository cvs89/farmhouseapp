-- 1. Add embedding vector column to properties table
-- OpenAI embeddings generate 1536-dimensional vectors
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 2. Create property matching similarity function
CREATE OR REPLACE FUNCTION public.match_properties (
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  address TEXT,
  base_price NUMERIC,
  capacity INT,
  images TEXT[],
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    slug,
    address,
    base_price,
    capacity,
    images,
    1 - (properties.embedding <=> query_embedding) AS similarity
  FROM public.properties
  WHERE properties.is_published = true
    AND 1 - (properties.embedding <=> query_embedding) > match_threshold
  ORDER BY properties.embedding <=> query_embedding
  LIMIT match_count;
$$;
