// https://discord.com/developers/docs/resources/webhook
// send a message to a discord webhook
const { NotImplemented } = require('@feathersjs/errors');

const sendMessage = async (data) => {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    throw new NotImplemented('DISCORD_WEBHOOK_URL is not set');
  }
  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), 
  });
  if (!response.ok) {
    console.error(response);
  }
  return response.ok;
};

module.exports = {
  sendMessage,
};
