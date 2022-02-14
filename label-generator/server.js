const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const genLabel = require('./gen-label');
const toBmp = require('./bmp');

const dataCache = {};
let templates = {};
fs.readdir(path.join(__dirname, 'templates')).then((files) => {
  return Promise.all(files.map(async (file) => {
    const name = file.split('.')[0];
    templates[name] = await fs.readFile(path.join(__dirname, 'templates', file), 'utf8');
  }));
});

const host = process.env.host || 'localhost';
const port = process.env.port || 3000;
const url = `http://${host}:${port}`;

const app = express();

const makeRegex = (str) => new RegExp(`{{${str}}}`, 'g');
app.get('/render/:id', async (req, res) => {
  const id = req.params.id;
  const data = dataCache[id];
  // console.log(`📦 rendering label ${id}`, data);
  if (!data) {
    res.status(404).send('Not found');
    return;
  }
  let html = `${templates[data._template || 'default']}`;
  html = html.replace(makeRegex('iconSrc'), `${url}/icon.png`);
  Object.keys(data).forEach((key) => {
    html = html.replace(makeRegex(key), data[key] || '');
  });

  res.set('Content-Type', 'text/html');
  res.send(html);
});

app.get('/icon.png', (req, res) => res.sendFile(path.join(__dirname, 'icon.png')));

app.get('/label-gen/:id', async (req, res) => {
  const id = req.params.id;
  let label;
  if (id === 'example') {
    label = {
      data: {
        qrUri: 'mkrs.in/12345678',
        header: 'Example Label',
        subheader: 'This is an example label',
        body: 'For testing purposes only',
        footer: 'abcdef-12345678-abcdef',
      },
    };
  } else {
    try {
      const { data } = await axios.get(`${process.env.API_URL}/labels/${id}`, {
        headers: req.headers,
      });
      label = data;
    } catch (err) {
      console.error(err.message);
      res.status(404).send('Not found');
      return;
    }
  }
  dataCache[id] = label.data;
  dataCache[id]._template = label.template;
  const width = req.query?.width || (req.query?.format === 'bmp' ? 380 : 0);
  const labelBuffer = await genLabel(`${url}/render/${id}`, width);
  delete dataCache[id];
  if (req.query?.format === 'bmp') {
    res.set('Content-Type', 'image/bmp');
    return res.send(await toBmp(labelBuffer, req.query?.width || 380, 1));
  }

  res.set('Content-Type', 'image/png');
  res.send(labelBuffer);
});

console.log('🔌 Connecting to: ', process.env.API_URL);
app.listen(port, () => console.log(`🚀 listening on port ${port}`));
