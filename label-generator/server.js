const express = require('express');
const axios = require('axios');
const genLabel = require('./gen-label');
const toBmp = require('./bmp');

const dataCache = {};

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const url = `http://${host}:${port}`;

const app = express();

app.get('/render/:id', async (req, res) => {
  const id = req.params.id;
  const data = dataCache[id];
  // console.log(`📦 rendering label ${id}`, data);
  if (!data) {
    res.status(404).send('Not found');
    return;
  }

  res.set('Content-Type', 'text/html');
  res.send(data);
});

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
        headers: {
          authorization: req.headers.authorization,
        }
      });
      label = data;
      if (!label?.html) throw new Error('No html provided');
    } catch (err) {
      console.error(err.message, err.response);
      res.status(404).send('Not found');
      return;
    }
  }
  dataCache[id] = label.html;
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
