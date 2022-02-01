const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const app = require('./feathers-client');

const printerId = process.env.PRINTER_ID;
let printer = {
  model: 'QL-700',
  labelSize: '62',
};

// generate random label path
const genPath = () => path.join(__dirname, `label-${Math.random().toString(16).substring(2)}.png`);

//download png from url and save to filepath
const download = async (id, filepath) => {
  const response = await axios.get(`${process.env.LABEL_GEN_URL}/${id}`, {
    headers: {
      'authorization': `Bearer ${await app.authentication.getAccessToken()}`,
    },
    responseType: 'arraybuffer',
  });
  await fs.writeFile(filepath, response.data, 'base64');
};

// print label from data
const printLabel = async (data) => {
  const filepath = genPath();
  await download(data._id, filepath);
  const { stdout, stderr } = await exec(`brother_ql -m ${printer.model} -p file:///dev/usb/lp0 print -l ${printer.labelSize}  ${filepath}`);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  await fs.unlink(filepath);
  await app.service('labels').patch(data._id, { status: 'complete' });
  console.log(`📦 label ${data._id} printed`);
};

// queue labels for printing
const queue = [];
const printFromQueue = async () => {
  if (queue.length === 0) return setTimeout(printFromQueue, 100);
  const data = queue.shift();
  await printLabel(data);
  setTimeout(printFromQueue, 100);
};

const heartbeat = async () => {
  await app.service('label-printers').patch(printerId, { lastHeartbeat: new Date() });
  setTimeout(heartbeat, 1000 * 60);
};

(async () => {
  await app.auth();

  // get printer info
  printer = await app.service('label-printers').get(printerId);

  // get all existiing labels that are not complete
  const { data: labels } = await app.service('labels').find({
    query: {
      status: 'pending',
      printerId,
      $limit: null,
    },
  });
  queue.push(...labels);
  console.log(`📦 ${labels.length} labels queued`);

  // listen for new labels
  const handleEvent = (label) => {
    if (label.status !== 'pending' || label.printerId !== printerId) return;
    queue.push(label);
  };
  app.service('labels').on('created', handleEvent);
  app.service('labels').on('patched', handleEvent);

  // start printing
  printFromQueue();
  heartbeat();
})();