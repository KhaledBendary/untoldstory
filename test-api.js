
async function testAPI() {
  try {
    console.log('=== Services ===');
    const servicesRes = await fetch('https://api.globaluntoldstory.com/api/v1/services?locale=en');
    const servicesData = await servicesRes.json();
    console.log(JSON.stringify(servicesData, null, 2));

    console.log('\n=== Portfolio ===');
    const portfolioRes = await fetch('https://api.globaluntoldstory.com/api/v1/portfolio?locale=en');
    const portfolioData = await portfolioRes.json();
    console.log(JSON.stringify(portfolioData, null, 2));

    console.log('\n=== Home ===');
    const homeRes = await fetch('https://api.globaluntoldstory.com/api/v1/home?locale=en');
    const homeData = await homeRes.json();
    console.log('Home data keys:', Object.keys(homeData.data));

    console.log('\n=== Blog ===');
    const blogRes = await fetch('https://api.globaluntoldstory.com/api/v1/blog?locale=en');
    const blogData = await blogRes.json();
    console.log(JSON.stringify(blogData, null, 2));
  } catch (err) {
    console.error('Error testing API:', err);
  }
}

testAPI();

