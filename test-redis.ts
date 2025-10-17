import { redisService } from './src/services/redis.service';
import { config } from './src/config/env';

/**
 * Redis Test Suite
 * Tests connection, basic operations, and caching functionality
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(emoji: string, message: string, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function success(message: string) {
  log('✅', message, colors.green);
}

function error(message: string) {
  log('❌', message, colors.red);
}

function info(message: string) {
  log('ℹ️ ', message, colors.blue);
}

function warning(message: string) {
  log('⚠️ ', message, colors.yellow);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🧪', 'REDIS TEST SUITE', colors.blue);
  console.log('='.repeat(60) + '\n');

  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Check Redis URL
    testsRun++;
    info('Test 1: Checking Redis URL configuration...');
    if (config.redis.url) {
      const maskedUrl = config.redis.url.replace(/:[^:@]+@/, ':****@');
      success(`Redis URL configured: ${maskedUrl}`);
      testsPassed++;
    } else {
      error('Redis URL not configured!');
      testsFailed++;
      throw new Error('REDIS_URL environment variable not set');
    }

    // Test 2: Connect to Redis
    testsRun++;
    info('Test 2: Connecting to Redis...');
    await redisService.connect();
    await sleep(1000); // Give it a moment to connect
    
    if (redisService.isReady()) {
      success('Connected to Redis successfully!');
      testsPassed++;
    } else {
      error('Failed to connect to Redis');
      testsFailed++;
      throw new Error('Redis connection failed');
    }

    // Test 3: SET operation
    testsRun++;
    info('Test 3: Testing SET operation...');
    const testKey = 'test:connection';
    const testValue = 'Hello from Devion!';
    const setResult = await redisService.set(testKey, testValue, 60);
    if (setResult) {
      success(`SET operation successful: ${testKey} = "${testValue}"`);
      testsPassed++;
    } else {
      error('SET operation failed');
      testsFailed++;
    }

    // Test 4: GET operation
    testsRun++;
    info('Test 4: Testing GET operation...');
    const getValue = await redisService.get(testKey);
    if (getValue === testValue) {
      success(`GET operation successful: Retrieved "${getValue}"`);
      testsPassed++;
    } else {
      error(`GET operation failed: Expected "${testValue}", got "${getValue}"`);
      testsFailed++;
    }

    // Test 5: INCR operation (for rate limiting)
    testsRun++;
    info('Test 5: Testing INCR operation (rate limiting)...');
    const counterKey = 'test:counter';
    const count1 = await redisService.incr(counterKey);
    const count2 = await redisService.incr(counterKey);
    if (count1 === 1 && count2 === 2) {
      success(`INCR operation successful: ${count1} -> ${count2}`);
      testsPassed++;
    } else {
      error(`INCR operation failed: Got ${count1}, ${count2}`);
      testsFailed++;
    }

    // Test 6: EXPIRE operation
    testsRun++;
    info('Test 6: Testing EXPIRE operation...');
    const expireResult = await redisService.expire(counterKey, 5);
    const ttl = await redisService.ttl(counterKey);
    if (expireResult && ttl > 0 && ttl <= 5) {
      success(`EXPIRE operation successful: TTL = ${ttl} seconds`);
      testsPassed++;
    } else {
      error(`EXPIRE operation failed: TTL = ${ttl}`);
      testsFailed++;
    }

    // Test 7: EXISTS operation
    testsRun++;
    info('Test 7: Testing EXISTS operation...');
    const exists = await redisService.exists(testKey);
    const notExists = await redisService.exists('test:nonexistent');
    if (exists && !notExists) {
      success('EXISTS operation successful');
      testsPassed++;
    } else {
      error(`EXISTS operation failed: exists=${exists}, notExists=${notExists}`);
      testsFailed++;
    }

    // Test 8: DEL operation
    testsRun++;
    info('Test 8: Testing DEL operation...');
    const delResult = await redisService.del(testKey);
    const stillExists = await redisService.exists(testKey);
    if (delResult && !stillExists) {
      success('DEL operation successful');
      testsPassed++;
    } else {
      error('DEL operation failed');
      testsFailed++;
    }

    // Test 9: AI Cache Simulation
    testsRun++;
    info('Test 9: Testing AI cache pattern...');
    const cacheKey = 'ai:cache:test123';
    const aiResponse = JSON.stringify({
      answer: 'Bonds are debt instruments issued by governments or corporations.',
      tokensUsed: 45,
    });
    await redisService.set(cacheKey, aiResponse, 86400); // 24 hours
    const cachedResponse = await redisService.get(cacheKey);
    if (cachedResponse === aiResponse) {
      const parsed = JSON.parse(cachedResponse);
      success(`AI cache working: ${parsed.tokensUsed} tokens saved!`);
      testsPassed++;
    } else {
      error('AI cache pattern failed');
      testsFailed++;
    }

    // Test 10: Rate Limit Simulation
    testsRun++;
    info('Test 10: Testing rate limit pattern...');
    const rateLimitKey = 'ratelimit:ai:testuser';
    await redisService.del(rateLimitKey); // Clean slate
    
    const req1 = await redisService.incr(rateLimitKey);
    if (req1 === 1) await redisService.expire(rateLimitKey, 3600);
    const req2 = await redisService.incr(rateLimitKey);
    const req3 = await redisService.incr(rateLimitKey);
    
    const ttlRemaining = await redisService.ttl(rateLimitKey);
    
    if (req1 === 1 && req2 === 2 && req3 === 3 && ttlRemaining > 0) {
      success(`Rate limiting working: ${req3}/10 requests used, resets in ${Math.ceil(ttlRemaining/60)} min`);
      testsPassed++;
    } else {
      error('Rate limit pattern failed');
      testsFailed++;
    }

    // Cleanup
    info('Cleaning up test data...');
    await redisService.del('test:counter');
    await redisService.del(cacheKey);
    await redisService.del(rateLimitKey);
    success('Cleanup complete');

  } catch (err: any) {
    error(`Test suite failed: ${err.message}`);
    console.error(err);
  } finally {
    // Disconnect
    info('Disconnecting from Redis...');
    await redisService.disconnect();
    success('Disconnected');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  log('📊', 'TEST SUMMARY', colors.blue);
  console.log('='.repeat(60));
  console.log(`Total Tests:   ${testsRun}`);
  console.log(`${colors.green}✅ Passed:      ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed:      ${testsFailed}${colors.reset}`);
  console.log(`Success Rate:  ${((testsPassed/testsRun) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  if (testsFailed === 0) {
    success('🎉 ALL TESTS PASSED! Redis is working perfectly!');
    console.log('\n✨ Your Redis setup is production-ready!\n');
    process.exit(0);
  } else {
    error('❌ SOME TESTS FAILED! Check the errors above.');
    console.log('\n⚠️  Fix the issues and run the test again.\n');
    process.exit(1);
  }
}

// Run tests
console.log('\n🚀 Starting Redis test suite...\n');
runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});


