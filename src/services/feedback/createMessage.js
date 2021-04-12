
const createMessage = (sender, msg) => ({
  'blocks': [
    {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': `New bug report from *${sender}*`
      }
    },
    {
      'type': 'divider'
    },
    {
      'type': 'section',
      'text': {
        'type': 'plain_text',
        'text': msg,
        'emoji': true
      }
    }
  ]
});

module.exports = { createMessage };