create extension if not exists vector;

alter table ai_memories add column if not exists embedding vector(1536);

create index if not exists ai_memories_embedding_idx
  on ai_memories using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function match_ai_memories(
  target_workspace uuid,
  query_embedding vector(1536),
  match_count int default 8,
  min_similarity float default 0.12
)
returns table (
  id uuid,
  category text,
  content text,
  source text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
language sql
stable
security definer
as $$
  select
    ai_memories.id,
    ai_memories.category,
    ai_memories.content,
    ai_memories.source,
    ai_memories.created_at,
    ai_memories.updated_at,
    1 - (ai_memories.embedding <=> query_embedding) as similarity
  from ai_memories
  where
    ai_memories.workspace_id = target_workspace
    and ai_memories.embedding is not null
    and 1 - (ai_memories.embedding <=> query_embedding) >= min_similarity
  order by ai_memories.embedding <=> query_embedding
  limit match_count;
$$;
