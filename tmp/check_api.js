
import http from 'http';

const checkApi = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Path: ${path}, Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`Data count: ${Array.isArray(json) ? json.length : 'not an array'}`);
        } catch (e) {
          console.log('Error parsing JSON');
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`Problem with request to ${path}: ${e.message}`);
      resolve();
    });
    req.end();
  });
};

async function run() {
  await checkApi('/api/categories');
  await checkApi('/api/sliders');
  await checkApi('/api/banners');
}

run();
