const axios = require('axios');

// Test different domain origins
async function testDomainDetection() {
  console.log('🔍 Testing Domain Detection...\n');
  
  const testCases = [
    {
      name: 'localhost',
      origin: 'http://localhost:8080',
      expected: true
    },
    {
      name: 'IP Address',
      origin: 'http://192.168.1.100:8080',
      expected: true
    },
    {
      name: 'HTTPS Domain',
      origin: 'https://example.com',
      expected: false // Unless added to the allow list
    },
    {
      name: 'HTTP Domain',
      origin: 'http://test.local',
      expected: false // Unless added to the allow list
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Origin: ${testCase.origin}`);
      
      // Test CORS preflight
      const response = await axios({
        method: 'OPTIONS',
        url: 'http://localhost:3000/api/cors/test-domain',
        headers: {
          'Origin': testCase.origin,
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('---\n');
  }
  
  // Test adding a new domain
  console.log('🔧 Testing Add Domain...\n');
  
  try {
    const addResponse = await axios.post('http://localhost:3000/api/cors/allowed-domains', {
      domain: 'https://newdomain.com'
    });
    
    console.log('✅ Domain Added Successfully:', addResponse.data);
    
  } catch (error) {
    console.log('❌ Failed to Add Domain:', error.message);
  }
  
  // Test fetching allowed domains
  console.log('\n📋 Fetching Allowed Domains...\n');
  
  try {
    const listResponse = await axios.get('http://localhost:3000/api/cors/allowed-domains');
    
    console.log('✅ Allowed Domains:', listResponse.data);
    
  } catch (error) {
    console.log('❌ Failed to Fetch Domains:', error.message);
  }
}

// Run tests
testDomainDetection().catch(console.error);
