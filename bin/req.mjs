#!/usr/bin/env node

import fetch from 'node-fetch';

const url = 'http://public-web:3000/';
const event = {
  type: 'PingRequest',
  data: { sentAt: new Date().getTime() }
}
const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(event),
});
const roundTrip = new Date().getTime() - event.data.sentAt
const result = await res.json();

console.log(result);
console.log('Response received at', result.data.receivedAt - event.data.sentAt, 'ms');
console.log('Roundtrip time', roundTrip, 'ms');
