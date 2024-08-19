const fs = require('fs');
const path = require('path');

const EVERYONE_FILE = path.join(__dirname, 'everyone.txt');

const warnings = {};

function loadEveryoneStatus() {
  try {
    if (fs.existsSync(EVERYONE_FILE)) {
      return fs.readFileSync(EVERYONE_FILE, 'utf8') === 'on';
    } else {
      fs.writeFileSync(EVERYONE_FILE, 'on');
      return true;
    }
  } catch (error) {
    console.error('Error reading everyone status file:', error);
    return true;
  }
}

function saveEveryoneStatus(status) {
  try {
    fs.writeFileSync(EVERYONE_FILE, status);
  } catch (error) {
    console.error('Error saving everyone status file:', error);
  }
}

module.exports.config = {
  name: "everyone",
  version: "1.0",
  hasPermission: 0,
  credits: "Jonell Magallanes",
  description: "Automatically manage @everyone mentions in Messenger groups",
  usePrefix: false,
  hide: true,
  commandCategory: "Group",
  usage: "",
  cooldowns: 3,
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.isGroup && loadEveryoneStatus()) {
    const { threadID, info, senderID } = event;

    if (!info || !info.participantIDs) {
      console.error('Error: info or info.participantIDs is undefined.');
      return;
    }

    const currentUserID = api.getCurrentUserID();
    const mentions = info.participantIDs
      .filter(id => id !== currentUserID);

    if (mentions.length > 0) {
      if (!warnings[senderID]) {
        warnings[senderID] = 0;
      }

      if (warnings[senderID] === 0) {
        const userInfo = await api.getUserInfo(senderID);
        const senderName = userInfo[senderID]?.name || 'User';
        api.sendMessage(`Warning: ${senderName}, avoid mentioning @everyone.`, threadID);
        warnings[senderID] += 1;
      } else if (warnings[senderID] === 1) {
        const userInfo = await api.getUserInfo(senderID);
        const senderName = userInfo[senderID]?.name || 'User';
        api.sendMessage(`Second Warning: ${senderName}, @everyone mentions are now blocked.`, threadID);
        warnings[senderID] += 1;
        api.removeUserFromGroup(senderID, threadID);
        setTimeout(() => {
          api.addUserToGroup(senderID, threadID);
        }, 180000);
      }
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  if (args[0] === 'on') {
    saveEveryoneStatus('on');
    api.sendMessage('Anti-@everyone feature enabled.', event.threadID);
  } else if (args[0] === 'off') {
    saveEveryoneStatus('off');
    api.sendMessage('Anti-@everyone feature disabled.', event.threadID);
  } else {
    api.sendMessage('Invalid argument. Use "on" or "off" to toggle the feature.', event.threadID);
  }
};