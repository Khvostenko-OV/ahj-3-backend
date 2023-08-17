const http = require('http');
const Koa = require('koa');
const app = new Koa();

const tickets = [];

// => CORS
app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({...headers});
    try {
      return await next();
    } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

app.use(async ctx => {
    console.log(ctx.request.querystring)
    const { method } = ctx.request.querystring;

    switch (method) {
        case 'allTickets':
            ctx.response.body = tickets;
            return;
        // TODO: обработка остальных методов
        default:
            ctx.response.status = 404;
            return;
    }
});

const port = process.env.PORT || 7070;
http.createServer(app.callback()).listen(port)

//const server = http.createServer((req, res) => {
//  console.log(req.headers);
//  res.end('server response');
//});

//const port = 7070;
// слушаем определённый порт
//server.listen(port, (err) => {
//    if (err) {
//      return console.log('Error occured:', error)
//    }
//    console.log(`server is listening on ${port}`)
//});
