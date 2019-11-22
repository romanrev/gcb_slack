const { IncomingWebhook } = require('@slack/webhook');
const url = process.env.SLACK_WEBHOOK;

const webhook = new IncomingWebhook(url);

// subscribe is the main function called by Cloud Functions.
module.exports.subscribe = (pubSubEvent, context) => {
  const build = eventToBuild(pubSubEvent.data);

  // Skip if the current status is not in the status list.
  // Add additional statuses to list if you'd like:
  // QUEUED, WORKING, SUCCESS, FAILURE,
  // INTERNAL_ERROR, TIMEOUT, CANCELLED
  const status = ['QUEUED', 'WORKING', 'SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
  if (status.indexOf(build.status) === -1) {
    return;
  }

  // Send message to Slack.
  const message = createSlackMessage(build);
  webhook.send(message);
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
  return JSON.parse(Buffer.from(data, 'base64').toString());
}

// createSlackMessage creates a message from a build object.
const createSlackMessage = (build) => {
  var build_id = build.projectId
  if (build.source.hasOwnProperty('repoSource')) {
      build_id = build_id + ': ' + build.source.repoSource.repoName + ' (' +
          build.source.repoSource.branchName + ')'
  } else if (build.source.hasOwnProperty('storageSource')) {
      build_id = build_id + ': ' + build.source.storageSource.bucket + '/' +
          build.source.storageSource.object
  }
  var build_status = build.status
  var time_taken = -1
  if (build.status !== 'QUEUED' && build.status !== 'WORKING') {
      time_taken = ( new Date(build.finishTime) - new Date(build.startTime) )/1
000/60
  }
  if (build.status === 'FAILURE') {
      build_status = `\`${build_status}\``
  }

  const message = {
    text: `Build \`${build_id}\``,
    mrkdwn: true,
    attachments: [
      {
        title: 'Build logs',
        title_link: build.logUrl,
        fields: [{
          title: 'Status',
          value: build_status
        }]
      }
    ]
  };
  if ( time_taken > 0 ) {
      message.attachments[0].fields.push(
          {
            title: 'Time taken',
            value: time_taken
          }
      )
  };
  return message;
}
