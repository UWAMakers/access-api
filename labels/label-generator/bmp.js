const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs').promises;
// const Jimp = require('jimp');

/**
* depth: 1 - monochrome
*        4 - 4-bit grayscale
*        8 - 8-bit grayscale
*       16 - 16-bit colour
*       32 - 32-bit colour
**/
// eslint-disable-next-line no-unused-vars
const toBmp = async (buff, width = 380) => {
  const key = Math.random().toString(36).substring(2);

  await fs.writeFile(path.join(__dirname, `${key}.png`), buff);
  // const image = await Jimp.read(buff);
  // image.resize(width, Jimp.AUTO);
  // console.log(width, image);
  // const bmp = await image.getBufferAsync(Jimp.MIME_BMP);
  // await image.writeAsync(path.join(__dirname, `${key}.png`));

  // await exec(`convert ${key}.png -resize ${width} ${key}.png`);
  // await exec(`convert ${key}.png -threshold 35% ${key}.png`);
  // await exec(`convert ${key}.png -fill black -fuzz 20% +opaque '#FFFFFF' ${key}.png`);
  await exec(`convert ${key}.png -depth 1 ppm:- | pnmdepth 1 | ppmtobmp -bpp 1 > ${key}.bmp`);
  // if (stdout) console.log(stdout);
  // if (stderr) console.error(stderr);

  const bmpBuffer = await fs.readFile(path.join(__dirname, `${key}.bmp`));

  await fs.unlink(path.join(__dirname, `${key}.png`));
  await fs.unlink(path.join(__dirname, `${key}.bmp`));

  return bmpBuffer;
};

module.exports = toBmp;
