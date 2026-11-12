const express = require('express');
const serverless = require('serverless-http');
const { app } = require('../../server');
const { connectDatabase } = require('../../services/database');
const gateway = express();
// Support both the public rewrite URL and direct Netlify Function URLs.
gateway.use('/api', app);
gateway.use('/.netlify/functions/api', app);
gateway.use(app);
const handle = serverless(gateway, { binary:['image/png','image/jpeg','application/pdf','application/octet-stream'] });
function createHandler(initialize = connectDatabase) {
  return async (event, context = {}) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
      await initialize();
    } catch (err) {
      console.error('API initialization failed:', err.name);
      return { statusCode:503, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}, body:JSON.stringify({message:'The database is temporarily unavailable. Please try again shortly.'}) };
    }
    return handle(event, context);
  };
}
exports.handler = createHandler();
exports.createHandler = createHandler;
