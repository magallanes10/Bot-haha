const axios = require('axios');

module.exports.config = {
    name: "ai2",
    hasPermssion: 0,
    version: "1.0.0",
    credits: "Jonell Magallanes",
    description: "EDUCATIONAL",
    usePrefix: false,
    commandCategory: "AI",
    usages: "[question]",
    cooldowns: 5,
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { messageID, threadID } = event;

    try {
        const lad = await api.sendMessage("🔎 Searching for an answer. Please wait...", threadID, messageID);
        const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/gpt4?text=${encodeURIComponent(event.body)}`);

        if (response.data.status && response.data.result && response.data.result.status && response.data.result.result) {
            const responseMessage = `𝗖𝗛𝗔𝗧𝗚𝗣𝗧 𝟰\n━━━━━━━━━━━━━━━━━━\n${response.data.result.result}\n━━━━━━━━━━━━━━━━━━`;
            api.editMessage(responseMessage, lad.messageID, threadID, messageID);
        } else {
            api.sendMessage("An error occurred while processing your request.", threadID, messageID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { messageID, threadID } = event;

    if (!args[0]) return api.sendMessage("Please provide your question.\n\nExample: ai2 how are you?", threadID, messageID);

    try {
        const lad = await api.sendMessage("🔎 Searching for an answer. Please wait...", threadID, messageID);
        const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/gpt4?text=${encodeURIComponent(args.join(" "))}`);

        if (response.data.status && response.data.result && response.data.result.status && response.data.result.result) {
            const responseMessage = `𝗖𝗛𝗔𝗧𝗚𝗣𝗧 𝟰\n━━━━━━━━━━━━━━━━━━\n${response.data.result.result}\n━━━━━━━━━━━━━━━━━━`;
            api.editMessage(responseMessage, lad.messageID, threadID, messageID);
        } else {
            api.sendMessage("An error occurred while processing your request.", threadID, messageID);
        }

        global.client.handleReply.push({
            name: this.config.name,
            messageID: lad.messageID,
            author: event.senderID
        });
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
};
