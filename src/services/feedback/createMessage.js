const createMessage = (sender, msg, versions) => ({
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `
New bug report from *${sender}*
${versions ? `\`APP-${versions.frontend} --- API-${versions.backend}\`` : ''}
        `.trim(),
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'plain_text',
        text: msg,
        emoji: true,
      },
    },
  ],
});

module.exports = { createMessage };
