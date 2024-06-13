const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const app = require('./feathers-client');

const pollingInterval = process.env.POLLING_INTERVAL
  ? (parseInt(process.env.POLLING_INTERVAL, 10) || 0)
  : 0;

const printerId = process.env.PRINTER_ID;
let printer = {
  model: 'QL-700',
  labelSize: '62',
};

const disablableModels = ['QL-700', 'QL-800'];
const disableSleep = async () => {
  if (!disablableModels.includes(printer.model)) return;
  await exec('echo -n -e \'\\x1b\\x69\\x55\\x41\\x00\\x00\' > /dev/usb/lp0');
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
  await (new Array(data.copies || 1)).fill(null).reduce(async (promise) => {
    await promise;
    // eslint-disable-next-line no-unused-vars
    const { stdout, stderr } = await exec(`brother_ql -m ${printer.model} -p file:///dev/usb/lp0 print -l ${printer.labelSize}  ${filepath}`);
    // if (stdout) console.log(stdout);
    // if (stderr) console.error(stderr);
  }, Promise.resolve());
  await fs.unlink(filepath);
  await app.service('labels').patch(data._id, { status: 'complete' });
  console.log(`📦 label ${data._id} printed`);
};

// queue labels for printing
const queue = [];
let active = null;
const printFromQueue = async () => {
  if (queue.length === 0) return setTimeout(printFromQueue, 100);
  active = queue.shift();
  await printLabel(active);
  active = null;
  setTimeout(printFromQueue, 100);
};

const heartbeat = async () => {
  if (app.isConnected()) {
    await app.service('label-printers').patch(printerId, { lastHeartbeat: new Date() });
  }
  setTimeout(heartbeat, 1000 * 60);
};

const poll = async (first = false) => {
  if (app.isConnected()) {
    const existingIds = queue.map((label) => label._id);
    if (active) existingIds.push(active._id);
    const { data: labels } = await app.service('labels').find({
      query: {
        ...(existingIds.length ? { _id: { $nin: existingIds } } : {}),
        status: 'pending',
        printerId,
        $limit: null,
      },
    });
    queue.push(...labels);
    if (labels.length || first) console.log(`📦 ${labels.length} labels queued`)
  }
  if (!pollingInterval) return;
  setTimeout(() => poll(), pollingInterval);
};

(async () => {
  await app.auth();

  // get printer info
  printer = await app.service('label-printers').get(printerId);
  await disableSleep();

  // get all existing labels that are not complete
  await poll(true);

  // listen for new labels
  const handleEvent = (label) => {
    if (label.status !== 'pending' || label.printerId !== printerId) return;
    queue.push(label);
  };
  app.service('labels').on('created', handleEvent);
  app.service('labels').on('patched', handleEvent);

  // start printing
  printFromQueue();
  // heartbeat();
})();