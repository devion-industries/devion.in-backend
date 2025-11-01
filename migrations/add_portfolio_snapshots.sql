-- Portfolio Snapshots Table
-- Stores daily snapshots of portfolio values for historical charting

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Snapshot data
    snapshot_date DATE NOT NULL,
    snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Portfolio values at snapshot time
    total_value DECIMAL(15, 2) NOT NULL,
    holdings_value DECIMAL(15, 2) NOT NULL,
    cash_value DECIMAL(15, 2) NOT NULL,
    total_invested DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_gain_loss DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_gain_loss_percent DECIMAL(8, 4) NOT NULL DEFAULT 0,
    
    -- Metadata
    holdings_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one snapshot per user per day
    UNIQUE(user_id, snapshot_date)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date 
    ON portfolio_snapshots(user_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_portfolio 
    ON portfolio_snapshots(portfolio_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date 
    ON portfolio_snapshots(snapshot_date DESC);

-- Function to automatically take a snapshot
CREATE OR REPLACE FUNCTION take_portfolio_snapshot(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_portfolio_id UUID;
    v_total_value DECIMAL(15, 2);
    v_holdings_value DECIMAL(15, 2);
    v_cash_value DECIMAL(15, 2);
    v_total_invested DECIMAL(15, 2);
    v_total_gain_loss DECIMAL(15, 2);
    v_total_gain_loss_percent DECIMAL(8, 4);
    v_holdings_count INTEGER;
BEGIN
    -- Get portfolio data
    SELECT 
        id,
        total_value,
        holdings_value,
        current_cash,
        total_invested,
        total_gain_loss,
        total_gain_loss_percent,
        holdings_count
    INTO 
        v_portfolio_id,
        v_total_value,
        v_holdings_value,
        v_cash_value,
        v_total_invested,
        v_total_gain_loss,
        v_total_gain_loss_percent,
        v_holdings_count
    FROM portfolios
    WHERE user_id = p_user_id;
    
    -- Only create snapshot if portfolio exists
    IF v_portfolio_id IS NOT NULL THEN
        -- Insert or update snapshot for today
        INSERT INTO portfolio_snapshots (
            user_id,
            portfolio_id,
            snapshot_date,
            snapshot_time,
            total_value,
            holdings_value,
            cash_value,
            total_invested,
            total_gain_loss,
            total_gain_loss_percent,
            holdings_count
        ) VALUES (
            p_user_id,
            v_portfolio_id,
            CURRENT_DATE,
            NOW(),
            v_total_value,
            v_holdings_value,
            v_cash_value,
            v_total_invested,
            v_total_gain_loss,
            v_total_gain_loss_percent,
            v_holdings_count
        )
        ON CONFLICT (user_id, snapshot_date)
        DO UPDATE SET
            snapshot_time = NOW(),
            total_value = v_total_value,
            holdings_value = v_holdings_value,
            cash_value = v_cash_value,
            total_invested = v_total_invested,
            total_gain_loss = v_total_gain_loss,
            total_gain_loss_percent = v_total_gain_loss_percent,
            holdings_count = v_holdings_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE portfolio_snapshots IS 'Daily snapshots of portfolio values for historical performance tracking';
COMMENT ON FUNCTION take_portfolio_snapshot IS 'Takes a snapshot of a user portfolio (upserts for current day)';

