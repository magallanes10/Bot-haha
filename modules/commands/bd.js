const fs = require('fs');
const path = require('path');

let badWords = [];

const badWordsFilePath = path.join(__dirname, 'cache', 'badwords.json');
if (fs.existsSync(badWordsFilePath)) {
    badWords = JSON.parse(fs.readFileSync(badWordsFilePath));
} else {
    fs.writeFileSync(badWordsFilePath, JSON.stringify(badWords));
}

let warnedUsers = new Set();

module.exports.config = {
    name: "bd",
    version: "1.0.0",
    hasPermssion: 2,
    description: "Security Badwords detected",
    usePrefix: true,
    hide: true,
    commandCategory: "System",
    usages: "",
    cooldowns: 2,
    credits: "Jonell Magallanes"
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.body && event.isGroup) {
        const message = event.body.toLowerCase();

        const foundBadWord = badWords.some(word => 
            message.split(/\s+/).includes(word)
        );

        if (foundBadWord) {
            const userId = event.senderID.toString();

            if (!warnedUsers.has(userId)) {
                const userInfo = await api.getUserInfo(userId);
                const userName = userInfo[userId].name;

                api.sendMessage(`⚠️ 𝗪𝗮𝗿𝗻𝗶𝗻𝗴 𝗩𝗶𝗼𝗹𝗮𝘁𝗶𝗼𝗻 \n━━━━━━━━━━━━━━━━━━\nLast Warning: ${userName}, your message contained inappropriate content. Detected word "${getDetectedBadWords(message).join(', ')}"`, event.threadID);

                warnedUsers.add(userId);
            } else {
                api.removeUserFromGroup(userId, event.threadID);
                const userInfo = await api.getUserInfo(userId);
                const userName = userInfo[userId].name;

                api.sendMessage(`👤 𝗥𝗲𝗺𝗼𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗚𝗿𝗼𝘂𝗽\n━━━━━━━━━━━━━━━━━━\n${userName} has been removed from the group due to multiple violations of the group chat rules.`, event.threadID);
            }
        }
    }
};

module.exports.run = ({ api, event, args }) => {
    const command = args[0];

    if (command === 'add') {
        const newBadWord = args.slice(1).join(' ').toLowerCase();
        if (!badWords.includes(newBadWord)) {
            badWords.push(newBadWord);
            updateBadWordsFile();
            api.sendMessage(`✅ 𝗔𝗱𝗱𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 \n━━━━━━━━━━━━━━━━━━\nAdded "${newBadWord}" to the list of bad words.`, event.threadID);
        } else {
            api.sendMessage(`"${newBadWord}" is already in the list of bad words.`, event.threadID);
        }
    } else if (command === 'remove') {
        const wordToRemove = args.slice(1).join(' ').toLowerCase();
        const index = badWords.indexOf(wordToRemove);
        if (index !== -1) {
            badWords.splice(index, 1);
            updateBadWordsFile();
            api.sendMessage(`✅ 𝗥𝗲𝗺𝗼𝘃𝗲 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆\n━━━━━━━━━━━━━━━━━━\nRemoved "${wordToRemove}" from the list of bad words.`, event.threadID);
        } else {
            api.sendMessage(`📋 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲 \n━━━━━━━━━━━━━━━━━━\n"${wordToRemove}" is not in the list of bad words.`, event.threadID);
        }
    } else if (command === 'list') {
        api.sendMessage(`📝 𝗟𝗶𝘀𝘁 𝗕𝗮𝗻𝗻𝗲𝗱 𝗪𝗼𝗿𝗱𝘀\n━━━━━━━━━━━━━━━━━━\nCurrent list of bad words: ${badWords.join(', ')}`, event.threadID);
    } else {
        api.sendMessage(`Invalid Parameter command. Usage: ${global.config.PREFIX}badwords add/remove/list <word>`, event.threadID);
    }
};

function updateBadWordsFile() {
    fs.writeFileSync(badWordsFilePath, JSON.stringify(badWords, null, 2));
}

function getDetectedBadWords(message) {
    return badWords.filter(word => message.split(/\s+/).includes(word));
}
