const webPush = require('web-push');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const vapidKeys = {
  publicKey: 'BPS-8Z2AI_3OL-bBv0Grwbu9rSO67lI0aT6G5gybLtmW4ygsfUST7BBPCTk7d2FxwwvhOjzzAzkP4C8crq5Gj1A',
  privateKey: 'y5YeIbYGRqqX7aUxA-uI_dQ4JtmuQxtM07t8f5K45-c'
};

webPush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  const payload = JSON.stringify({
    title: 'Push Notification',
    body: subscription.message || 'Default message'
  });

  webPush.sendNotification(subscription, payload).catch(error => {
    console.error('Error sending notification:', error);
  });

  res.status(201).json({});
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
