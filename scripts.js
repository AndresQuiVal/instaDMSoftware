// Required variables
let windowMessagesId = null;
let stopMessages = false;
let messageSent = false;
let isPrivateAccount = false;
let lines = []; // Array of users to send messages to
let linesToUse = [];
let indexMessagesSent = 0;
let usersMessageSentSet = new Set();
let isSending = false;
let isInspectingAndSending = false;
let currentTanda = 1;
let selectedTandaTimes = {};
let tandaMessagesSent = 0;
let LIMIT_MESSAGES_UNTIL_BAN = 8;
let counterMessagesWasNotSent = 0;
let messageLimit = 20;
let usernameIndex = 1;
let fullNameIndex = 0;

// Helper functions
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentDateTime() {
  return new Date().toLocaleString();
}

function unfocusWindow(windowId) {
  chrome.windows.update(windowId, { focused: false });
}

// CSV handling function
function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const text = e.target.result;
        lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line) // Remove empty lines
            .slice(1); // Skip the first line (header)
        
        linesToUse = lines; // Set the lines to use
        console.log(`Loaded ${lines.length} lines from CSV`);
    };
    
    reader.readAsText(file);
}

// Main function
async function sendInstagramDMMessages() {
  document.getElementById('message').disabled = true;

  if (isSending) {
    filenameMessagesSent = document.getElementById('emailPrepared').value;
  }

  counterMessagesWasNotSent = 0;
  counterMessagesNotFollowAllowed = 0;
  counterMessagesMessageButtonBan = 0;

  windowMessagesId = null;
  messageCounter = 0;

  if (lines.length === 0 && !isInspectingAndSending && !isSending) {
    alert("Carga un archivo antes de empezar a enviar mensajes!");
    return;a
  }

  const newWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: 'popup',
    width: 800,
    height: 600,
    focused: false
  });

  windowMessagesId = newWindow.id;
  let instaTab = newWindow;
  
  if (newWindow.tabs && newWindow.tabs.length > 0) {
    instaTab = newWindow.tabs[0];
  }

  messageSent = false;

  if (isInspectingAndSending || isSending) {
    console.error("[HOWER] - Start Delay -> (1000 * 60) / 2");
    let countCorrectLeadsFound = false;

    while (true) {
      for (let user of lines) {
        let username = user.split(/[,;]/)[usernameIndex];
        if (!usersMessageSentSet.has(username) && !usersMessageSentSet.has(username + "_NOTSENT")) {
          countCorrectLeadsFound++;
        }
      }

      if (countCorrectLeadsFound >= 3) {
        break;
      }

      await delay((1000 * 60) / 2);
      console.error("[HOWER] - Still searching leads...");
    }
  } else {
    indexMessagesSent = 0;
  }

  while (indexMessagesSent < linesToUse.length) {
    try {
      const windowCheck = await chrome.windows.get(windowMessagesId);
      if (!windowCheck) {
        throw new Error("Window closed");
      }
      unfocusWindow(windowMessagesId);
    } catch (error) {
      if (stopMessages) {
        await delay(1000);
        return;
      }
      const newWindow = await chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 800,
        height: 600,
      });
      windowMessagesId = newWindow.id;
      instaTab = newWindow;
      continue;
    }

    const tableBodyValidation = document.getElementById("sentMessagesTableBody");
    const rows = tableBodyValidation.getElementsByTagName("tr");

    if (stopMessages === true) {
      try {
        chrome.windows.remove(windowMessagesId);
      } catch (e) {
        console.error("Error closing window:", e);
      }
      return;
    } else if (rows.length >= Math.floor(messageLimit / parseInt(document.getElementById('numTandas').value))) {
      currentTanda++;
      if (currentTanda > parseInt(document.getElementById('numTandas').value)) {
        currentTanda = 1;
      }

      if (!selectedTandaTimes[`tanda${currentTanda}`]) {
        continue;
      }

      tandaMessagesSent = 0;

      const nextTandaTime = selectedTandaTimes[`tanda${currentTanda}`];
      const currentTime = new Date();
      const targetTime = new Date();
      const [hours, minutes] = nextTandaTime.split(':').map(Number);
      targetTime.setHours(hours, minutes, 0, 0);

      if (targetTime <= currentTime || nextTandaTime.includes('(al día siguiente)')) {
        continue;
      }

      const waitTime = targetTime - currentTime;
      await delay(waitTime);

      stopMessages = false;
      while (rows.length > 0) {
        tableBodyValidation.deleteRow(0);
      }
      continue;
    }

    let user = linesToUse[indexMessagesSent];
    let username = user.split(/[,;]/)[usernameIndex].replaceAll('"', '');
    let user_name = user.split(/[,;]/)[fullNameIndex].replace(/"/g, "").split(" ")[0];

    console.error("USERNAME: " + username);
    console.error("USER_NAME: " + user_name);

    indexMessagesSent += 1;

    if (!username || usersMessageSentSet.has(username) || usersMessageSentSet.has(username + "_NOTSENT")) {
        continue;
      }

    await chrome.tabs.update(instaTab.id, {
      url: `https://www.instagram.com/${username}/`,
    });

    await new Promise((resolve) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (info.status === "complete" && tabId === instaTab.id) {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });

    let messages = document.getElementById("message").value.split('&&');
    const randomIndex = Math.floor(Math.random() * messages.length);
    const randomMessage = messages[randomIndex].replaceAll("[NOMBRE]", user_name);

    try {
      await chrome.tabs.sendMessage(instaTab.id, {
        action: "sendMessage",
        instaTabId: instaTab.id,
        windowId: windowMessagesId,
        messageToSend: randomMessage,
        username: username,
        messagesLimit: messageLimit
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }

    await delay(1000 * 60); // Wait 4.5 minutes between messages

    if (stopMessages === true) {
      return;
    }
  }

  chrome.windows.remove(windowMessagesId);
}

// Event listener
document.getElementById("executeButton").addEventListener('click', sendInstagramDMMessages);

// Add event listener for file input
document.getElementById('csvFile').addEventListener('change', handleFileSelect, false);