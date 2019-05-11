const http = require('http');
const port = 8734;
const fs = require('fs');

let indexJSContents;
try {
    indexJSContents = fs.readFileSync('../dist/index.js');
} catch (e) {
    console.error('Cannot start testing server as dist/index.js is not available (did you build though?)');
    process.exit(1);
}


const requestHandler = (request, response) => {
  if (request.url === '/index.js') {
      response.writeHead(200, {
        'Content-Length': Buffer.byteLength(indexJSContents),
        'Content-Type': 'text/javascript'
      });
      response.end(indexJSContents);
  } else if (/^.*\.html/.test(request.url)) {
    try {
        const html = fs.readFileSync('./tests/' + request.url.replace('..',''));

        response.writeHead(200, {
            'Content-Length': Buffer.byteLength(html),
            'Content-Type': 'text/html'
        });

        response.end(html);
    } catch(e) {
        response.writeHead(404);
        response.end('NOT FOUND');
    }
  }

  response.end('Invalid Request...')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})