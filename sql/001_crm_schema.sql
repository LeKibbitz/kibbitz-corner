-- Kibbitz Corner CRM Schema
-- Database: supabase_tsb_db (port 5433)

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    source VARCHAR(50) DEFAULT 'website',
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- RSS Sources Catalog
CREATE TABLE IF NOT EXISTS rss_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'general',
    language VARCHAR(10) DEFAULT 'en',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMPTZ,
    fetch_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSS Playlists (collections per subscriber)
CREATE TABLE IF NOT EXISTS rss_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist-Sources N-N
CREATE TABLE IF NOT EXISTS playlist_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES rss_playlists(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES rss_sources(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    UNIQUE(playlist_id, source_id)
);

-- Generated Newsletters
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    content_html TEXT,
    content_text TEXT,
    summary TEXT,
    sources_used JSONB,
    articles_count INTEGER DEFAULT 0,
    tokens_input INTEGER,
    tokens_output INTEGER,
    model_used VARCHAR(50),
    generation_time_ms INTEGER,
    playlist_id UUID REFERENCES rss_playlists(id),
    status VARCHAR(20) DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    sent_to_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Logs
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(100),
    workflow_name VARCHAR(255),
    execution_id VARCHAR(100),
    node_name VARCHAR(100),
    node_type VARCHAR(100),
    api_provider VARCHAR(50),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    request_payload JSONB,
    response_status INTEGER,
    response_payload JSONB,
    tokens_input INTEGER,
    tokens_output INTEGER,
    cost_estimate DECIMAL(10,6),
    duration_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Requests with Voting
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    submitted_by VARCHAR(100),
    is_public BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'pending',
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    vote_score INTEGER GENERATED ALWAYS AS (votes_up - votes_down) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    voter_id VARCHAR(100) NOT NULL,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(request_id, voter_id)
);

-- Ideas Backlog
CREATE TABLE IF NOT EXISTS ideas_backlog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'idea',
    source VARCHAR(100),
    related_project VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_logs_workflow ON api_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_created ON newsletters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_score ON feature_requests(vote_score DESC);
