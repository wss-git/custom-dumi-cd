'use strict';

exports.handler = async (event, context, callback) => {
  const body = JSON.parse(event.toString());
  await require('./engine').handler(body || '{}', callback);
}