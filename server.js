const http = require('http');
const querystring = require('querystring');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const port = process.env.PORT || 7070;

const tickets = [];
const descriptions = [];
let ticketId = 0;

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

// => Body Parsers
app.use(koaBody({
   text: true,
   urlencoded: true,
   multipart: true,
   json: true,
}));

app.use(async ctx => {
    const qs = querystring.parse(ctx.request.querystring);
    const { name, description, status } = ctx.request.body;
    console.log(qs.method, ctx.request.body)

    switch (qs.method) {
        case 'allTickets':
          ctx.response.body = tickets;
          return;

        case 'ticketById':
          if (qs.id && tickets[qs.id]) {
            const ticket = tickets[qs.id];
            ticket.description = descriptions[qs.id];
            ctx.response.body = ticket;
          } else {
            ctx.response.status = 404;
          }
          return;

        case 'createTicket':
          if (name) {
            tickets[ticketId] = {
              'id': ticketId,
              'name': name,
              'status': Boolean(status),
              'created': new Date()
            }
            descriptions[ticketId] = description || '';
            ctx.response.body = tickets[ticketId++]
            ctx.response.status = 201;
          } else {
            ctx.response.status = 400;
          }
          return;

        case 'patchTicket':
          if (qs.id && tickets[qs.id]) {
            tickets[qs.id].name = name || tickets[qs.id].name;
            if (status !== undefined) {
              tickets[qs.id].status = (status == 'false') ? false : true; 
            }
            if (description !== undefined) {
              descriptions[qs.id] = description;
            }
            ctx.response.body = tickets[qs.id];
            ctx.response.status = 200;
          } else {
            ctx.response.status = 404;
          }
          return;

        case 'deleteTicket':
          if (qs.id && tickets[qs.id]) {
            tickets[qs.id] = undefined;
            descriptions[qs.id] = undefined;
            ctx.response.body = qs.id
            ctx.response.status = 200;
          } else {
            ctx.response.status = 404;
          }
          return;

        default:
          ctx.response.status = 404;
          return;
    }
});

http.createServer(app.callback()).listen(port)
