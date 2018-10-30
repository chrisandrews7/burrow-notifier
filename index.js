const notifier = require('node-notifier');
const request = require('request-promise-native');
const {
  MAX_LAG_THRESHOLD,
  PROBE_INTERVAL,
  PROBE_BASE_URL,
  CONSUMERS_TO_PROBE
} = require('./config');

const probeKafka = async () => {
  try {
    const probeResults = await Promise.all(
      CONSUMERS_TO_PROBE.map(app => 
        request({
          uri: `${PROBE_BASE_URL}/consumer/${app}/status`, 
          json: true 
        })
      )
    );

    probeResults.forEach(({ status }) => {
      if (status.totallag >= MAX_LAG_THRESHOLD) {
        notifier.notify({
          title: `${status.group} lag problem`,
          message: `Total lag ${status.totallag}`,
          sound: true,
        });
      }
    });
  } catch (err) {
    notifier.notify({
      title: 'Probe communication problem',
      message: err.message
    });
  }
}

setInterval(probeKafka, PROBE_INTERVAL);