import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useMarket } from '@/hooks/useMarket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * API Integration Test Component
 * Use this component to verify backend connectivity
 * Remove from production
 */
export default function ApiTestComponent() {
  const { login, signup, user, isAuthenticated } = useAuth();
  const { portfolio, buyStock, holdings } = usePortfolio();
  const { featuredStocks } = useMarket();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSignup = async () => {
    try {
      await signup({
        email: `test${Date.now()}@devion.in`,
        password: 'Test123',
        name: 'API Test User',
        age: 16,
        initial_budget: 25000
      });
      addResult('✅ Signup successful');
    } catch (error: any) {
      addResult(`❌ Signup failed: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      await login({
        email: 'test@devion.in',
        password: 'Test123'
      });
      addResult('✅ Login successful');
    } catch (error: any) {
      addResult(`❌ Login failed: ${error.message}`);
    }
  };

  const testPortfolio = () => {
    if (portfolio) {
      addResult(`✅ Portfolio loaded: ₹${portfolio.total_value.toLocaleString()}`);
    } else {
      addResult('❌ Portfolio not loaded');
    }
  };

  const testBuyStock = async () => {
    try {
      await buyStock({
        symbol: 'YESBANK',
        quantity: 10
      });
      addResult('✅ Buy stock successful');
    } catch (error: any) {
      addResult(`❌ Buy stock failed: ${error.message}`);
    }
  };

  const testMarketData = () => {
    if (featuredStocks.length > 0) {
      addResult(`✅ Market data loaded: ${featuredStocks.length} stocks`);
    } else {
      addResult('❌ Market data not loaded');
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('🚀 Starting API Integration Tests...');
    
    // Test 1: Market Data (no auth required)
    testMarketData();
    
    // Test 2: Authentication
    if (!isAuthenticated) {
      await testSignup();
    } else {
      addResult('✅ Already authenticated');
    }
    
    // Test 3: Portfolio
    testPortfolio();
    
    // Test 4: Holdings
    if (holdings.length > 0) {
      addResult(`✅ Holdings loaded: ${holdings.length} positions`);
    } else {
      addResult('ℹ️ No holdings yet');
    }
    
    addResult('✅ All tests complete!');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 API Integration Test Dashboard</CardTitle>
        <CardDescription>
          Test frontend-backend connectivity. Remove this component in production.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-center">
                {isAuthenticated ? '✅' : '❌'}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Authentication</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-center">
                {portfolio ? '✅' : '❌'}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Portfolio API</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-center">
                {featuredStocks.length > 0 ? '✅' : '❌'}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Market API</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-center">
                {holdings.length > 0 ? '✅' : 'ℹ️'}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Holdings</p>
            </CardContent>
          </Card>
        </div>

        {/* Current State */}
        {isAuthenticated && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm"><strong>User:</strong> {user?.name}</p>
            <p className="text-sm"><strong>Email:</strong> {user?.email}</p>
            <p className="text-sm"><strong>Portfolio Value:</strong> ₹{portfolio?.total_value.toLocaleString()}</p>
            <p className="text-sm"><strong>Cash:</strong> ₹{portfolio?.current_cash.toLocaleString()}</p>
            <p className="text-sm"><strong>Holdings:</strong> {holdings.length} positions</p>
          </div>
        )}

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={runAllTests} variant="default">
            Run All Tests
          </Button>
          <Button onClick={testSignup} variant="outline" disabled={isAuthenticated}>
            Test Signup
          </Button>
          <Button onClick={testLogin} variant="outline" disabled={isAuthenticated}>
            Test Login
          </Button>
          <Button onClick={testPortfolio} variant="outline">
            Test Portfolio
          </Button>
          <Button onClick={testBuyStock} variant="outline" disabled={!isAuthenticated}>
            Test Buy Stock
          </Button>
          <Button onClick={testMarketData} variant="outline">
            Test Market Data
          </Button>
          <Button onClick={() => setTestResults([])} variant="ghost">
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </div>
        )}

        {/* API Endpoints Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Backend URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          <p><strong>Token Stored:</strong> {localStorage.getItem('devion_token') ? 'Yes' : 'No'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

