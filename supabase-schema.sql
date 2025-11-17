-- Evaluation-as-a-Service (EaaS) Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE evaluation_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE item_status AS ENUM ('pending', 'scored', 'error');
CREATE TYPE scoring_type AS ENUM ('llm', 'bleu', 'rouge', 'similarity', 'keyword', 'yes_no', 'rule_based');

-- Rubrics table (stores reusable evaluation criteria)
CREATE TABLE rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    scoring_type scoring_type NOT NULL,
    prompt_template TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations table (stores metadata for each evaluation job)
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status evaluation_status DEFAULT 'pending',
    rubric JSONB NOT NULL,
    rubric_id UUID REFERENCES rubrics(id),
    threshold FLOAT,
    average_score FLOAT,
    model_version TEXT,
    total_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    error_message TEXT
);

-- Evaluation items table (individual examples in a dataset)
CREATE TABLE evaluation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    expected_output TEXT,
    model_output TEXT NOT NULL,
    score FLOAT,
    explanation TEXT,
    status item_status DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluation results summary (precomputed statistics for fast dashboard rendering)
CREATE TABLE evaluation_results_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE UNIQUE,
    total_items INTEGER DEFAULT 0,
    scored_items INTEGER DEFAULT 0,
    error_items INTEGER DEFAULT 0,
    average_score FLOAT,
    median_score FLOAT,
    min_score FLOAT,
    max_score FLOAT,
    score_distribution JSONB,
    passed BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_evaluations_created_by ON evaluations(created_by);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);
CREATE INDEX idx_evaluation_items_evaluation_id ON evaluation_items(evaluation_id);
CREATE INDEX idx_evaluation_items_status ON evaluation_items(status);
CREATE INDEX idx_rubrics_created_by ON rubrics(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rubrics
CREATE POLICY "Users can view their own rubrics"
    ON rubrics FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can create rubrics"
    ON rubrics FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own rubrics"
    ON rubrics FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own rubrics"
    ON rubrics FOR DELETE
    USING (auth.uid() = created_by);

-- RLS Policies for evaluations
CREATE POLICY "Users can view their own evaluations"
    ON evaluations FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can create evaluations"
    ON evaluations FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own evaluations"
    ON evaluations FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own evaluations"
    ON evaluations FOR DELETE
    USING (auth.uid() = created_by);

-- RLS Policies for evaluation_items
CREATE POLICY "Users can view items from their evaluations"
    ON evaluation_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM evaluations
            WHERE evaluations.id = evaluation_items.evaluation_id
            AND evaluations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create items for their evaluations"
    ON evaluation_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM evaluations
            WHERE evaluations.id = evaluation_items.evaluation_id
            AND evaluations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update items from their evaluations"
    ON evaluation_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM evaluations
            WHERE evaluations.id = evaluation_items.evaluation_id
            AND evaluations.created_by = auth.uid()
        )
    );

-- RLS Policies for evaluation_results_summary
CREATE POLICY "Users can view summaries from their evaluations"
    ON evaluation_results_summary FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM evaluations
            WHERE evaluations.id = evaluation_results_summary.evaluation_id
            AND evaluations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create summaries for their evaluations"
    ON evaluation_results_summary FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM evaluations
            WHERE evaluations.id = evaluation_results_summary.evaluation_id
            AND evaluations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update summaries from their evaluations"
    ON evaluation_results_summary FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM evaluations
            WHERE evaluations.id = evaluation_results_summary.evaluation_id
            AND evaluations.created_by = auth.uid()
        )
    );

-- Function to update evaluation statistics
CREATE OR REPLACE FUNCTION update_evaluation_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE evaluations
    SET 
        completed_items = (
            SELECT COUNT(*) 
            FROM evaluation_items 
            WHERE evaluation_id = NEW.evaluation_id 
            AND status = 'scored'
        ),
        average_score = (
            SELECT AVG(score) 
            FROM evaluation_items 
            WHERE evaluation_id = NEW.evaluation_id 
            AND status = 'scored'
        ),
        updated_at = NOW()
    WHERE id = NEW.evaluation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update evaluation stats when items are scored
CREATE TRIGGER update_evaluation_stats_trigger
AFTER UPDATE OF status, score ON evaluation_items
FOR EACH ROW
WHEN (NEW.status = 'scored')
EXECUTE FUNCTION update_evaluation_stats();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_rubrics_updated_at BEFORE UPDATE ON rubrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_items_updated_at BEFORE UPDATE ON evaluation_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_results_summary_updated_at BEFORE UPDATE ON evaluation_results_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

