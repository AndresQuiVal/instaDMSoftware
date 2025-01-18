// content.js
var instaTabId = undefined;
var windowId = undefined;
var shouldFollowFollowers = false;
var message_to_send = "";
var stopMessages = false;
var messagesLimit = 50;
var RANDOM_MESSAGES_FOR_STORIES = [
  "Hola! [NOMBRE], cómo estás?",
  "Hey [NOMBRE], oye! te dejé un mensaje en tu perfil!",
  "Hola [NOMBRE]! ¿Qué tal tu día?",
  "Hey [NOMBRE]! Te escribí al DM 😊",
  "¡Hola [NOMBRE]! ¿Todo bien?",
  "¡Hey [NOMBRE]! Te mandé un mensaje directo",
  "¡Qué tal [NOMBRE]! ¿Cómo va todo?",
  "Hola [NOMBRE]! Te dejé un mensaje importante",
  "¡Hola [NOMBRE]! Espero que estés genial",
  "Hey [NOMBRE]! Te envié un DM, échale un vistazo",
  "¡Qué onda [NOMBRE]! ¿Cómo te va?",
  "¡Hola [NOMBRE]! Te escribí por mensaje directo",
  "Hey [NOMBRE]! ¿Todo en orden?",
  "¡Hola [NOMBRE]! Te mandé un mensaje al DM",
  "¿Qué tal [NOMBRE]? ¿Cómo has estado?",
  "Hey [NOMBRE]! Te dejé un mensaje importante en DM",
  "¡Hola [NOMBRE]! ¿Qué tal tu semana?",
  "¡Hey [NOMBRE]! Te escribí al mensaje directo",
  "Hola [NOMBRE]! ¿Cómo te está yendo?",
  "¡Qué tal [NOMBRE]! Te mandé un DM",
  "Hey [NOMBRE]! ¿Todo marcha bien?",
  "¡Hola [NOMBRE]! Revisa tu bandeja de mensajes"
];

function simulateEnterKeyPress(element) {
  // Create a new 'Enter' key event
  var enterKeyEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  });

  // Dispatch the event
  element.dispatchEvent(enterKeyEvent);
}

function setInputValue(xpath, value) {
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  const inputElement = result.singleNodeValue;

  if (inputElement) {
    let index = 0;

    function typeChar() {
      const char = value.charAt(index);
      const keyEvent = new KeyboardEvent("keydown", {
        key: char,
        keyCode: char.charCodeAt(0),
        which: char.charCodeAt(0),
        bubbles: true,
        cancelable: true,
      });

      inputElement.dispatchEvent(keyEvent); // Simulate the key press
      inputElement.value += char; // Add the character to the input value
      inputElement.dispatchEvent(new Event("input", { bubbles: true })); // Trigger the input event

      index++;
      if (index < value.length) {
        setTimeout(typeChar, 100);
      }
    }

    typeChar();
  } else {
    
  }
}



function findBlockedMessageDivs() {
  // List of texts to check
  const blockedMessages = [
    "Esta cuenta no puede recibir tu mensaje porque no permite nuevas solicitudes de mensajes de cualquier persona.",
    "Esta cuenta no puede recibir tu mensaje porque no permite nuevas solicitudes de mensaje de cualquier persona.",
    "This account can't receive your message because they don't allow new message requests from everyone.",
    "Esta cuenta no puede recibir tu mensaje porque no permite nuevas solicitudes de mensaje de cualquier persona.",
    
  ];

  const blockedMessages2 = [
    "Not everyone can message this account.", // El nuevo mensaje que mencionaste
    "No todos pueden enviar mensajes a esta cuenta.",
    "Not everyone can send messages to this account."
  ];

  // Select all div elements
  const divs = document.querySelectorAll('div');
  var hasFound = false;
  // Loop through each div
  divs.forEach(div => {
      // Check if the div contains any of the specified texts
      if (blockedMessages.includes(div.innerText.trim())) {
          console.log("Found a div with the blocked message:", div);
          hasFound = true;

          console.error(`[INSTA] - No se pudo enviar mensaje - Mensaje bloqueado!!'`);
          chrome.runtime.sendMessage({
            action: "ignoreUser"
          });

          return true;
          // You can add any action you want to perform here, such as:
          // div.style.backgroundColor = 'yellow'; // Highlight the div
      }
  });

   // Buscar si el span con el mensaje de bloqueo existe
  //  const blockedSpans = document.querySelectorAll('div');
  //   blockedSpans.forEach(span => {
  //     // Comprobar si el texto del span coincide con alguno de los mensajes bloqueados
  //     if (blockedMessages2.includes(span.innerText.trim())) {
  //       console.log("Found a span with the blocked message:", span);
  //       hasFound = true;

  //       console.error(`[INSTA] - No se pudo enviar mensaje - Mensaje bloqueado!!'`);
  //       chrome.runtime.sendMessage({
  //         action: "ignoreUser"
  //       });

  //       return true; // Si solo deseas actuar sobre el primer span encontrado, puedes salir del bucle
  //     }
  //   });

  const allDivs = document.querySelectorAll('div[aria-label]');
    const conversationTranslations = [
        "Conversation with",
        "Conversación con",  // Españols
        "Messages in conversation with", 
        "Mensajes en conversación con",
        "Messages from the conversation",
        // Agrega más traducciones aquí si es necesario
    ];

    for (const div of allDivs) {
        // Revisar si el aria-label contiene alguna de las traducciones de "Conversation with"
        const ariaLabel = div.getAttribute('aria-label');
        if (conversationTranslations.some(text => ariaLabel.includes(text))) {
            console.log("Div encontrado:", div);

            // Buscar el span dentro del div
            const blockedSpans = div.querySelectorAll(`span`);
            blockedSpans.forEach(span => {
                // Comprobar si el texto del span coincide con alguno de los mensajes bloqueados
                if (blockedMessages2.includes(span.innerText.trim())) {
                  console.log("Found a span with the blocked message:", span);
                  hasFound = true;
          
                  console.error(`[INSTA] - No se pudo enviar mensaje - Mensaje bloqueado!!'`);
                  chrome.runtime.sendMessage({
                    action: "ignoreUser"
                  });
          
                  return true; // Si solo deseas actuar sobre el primer span encontrado, puedes salir del bucle
                }
            });
        }
    }

    console.log("No se encontraron el div o el span.");
    // Verificar si hay un ícono de envío fallido (el ícono de SVG)
  
  const svgElement = document.querySelector('svg[aria-label="Failed to send"], svg[aria-label="Envío fallido"]');
  if (svgElement) {
    return true;
  }

  return hasFound;
}



function typeTextLikeHuman(text, delay = 100) {
  let index = 0;
  let focusedElement = document.activeElement;

  // Check if the focused element is contenteditable
  if (!focusedElement || !focusedElement.isContentEditable) {
    
    return;
  }

  function typeChar() {
    if (index < text.length) {
      const char = text.charAt(index);

      // Append the character
      focusedElement.textContent += char;

      index++;
      if (index < text.length) {
        setTimeout(typeChar, delay);
      }
    }
  }

  typeChar();
}

// Example usage

// Example usage

window.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    const tgt = e.target;
    if (tgt.matches("div[contenteditable] p"))
      typeTextLikeHuman(tgt, "Your message here", 100);
  });
});

function setClickButton(xpath) {
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  const buttonElement = result.singleNodeValue;

  if (buttonElement) {
    buttonElement.click();
  } else {
    
  }
}

function copyMessageToClipboard(message) {
  navigator.clipboard
    .writeText(message)
    .then(() => {
      
    })
    .catch((err) => {
      
    });
}

function waitForElementAndPaste(xpath) {
  const interval = setInterval(() => {
    const editableDiv = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (
      editableDiv &&
      editableDiv.isContentEditable &&
      document.activeElement === editableDiv
    ) {
      clearInterval(interval);
      
      // Paste the clipboard content into the editable div
      document.execCommand("paste");
    }
  }, 500); // Check every 500ms
}

function clickButtonByXpath(xpath) {
  const element = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  if (element) {
    element.click();
    return true;
  }
  return false;
}

function findDivByContent(contents) {
  const divs = document.querySelectorAll("div");
  
  for (let div of divs) {
    if (contents.includes(div.textContent.trim())) {
      return div;
    }
  }
  return null;
}

function getDivCoordinatesByContent(contents) {
  const div = findDivByContent(contents);
  if (div) {
    const rect = div.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2;
    const y = (rect.bottom + rect.top) / 2;
    return { x, y };
  } else {
    
    return null;
  }
}

var maxAttempts = 100; // Maximum number of attempts to focus the textbox
var currentAttempts = 0;
var userAddedCSV = false;

function checkAndFocusTextbox() {
  if (currentAttempts < maxAttempts) {
    checkIfTextboxIsFocused();

    currentAttempts++;
    
    if (!isTextboxFocused) {
      setTimeout(checkAndFocusTextbox, 100); // Adjust the delay as needed
    }
  } else {
    
    return false;
    // Optionally, handle the failure to focus the textbox here
  }
  
  // if (!userAddedCSV) {
  //   chrome.runtime.sendMessage({
  //     action: "userMessageSent",
  //     usernameMessageSent: usernameInsta,
  //     messagesLimit: messagesLimit,
  //   });
  //   userAddedCSV = true;
  // }
  return true;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var isTextboxFocused = false;
var isTextboxFocusedComments = false;


async function focusTextbox() {
  while (true) {
    var textboxSelector = 'div[role="textbox"][contenteditable="true"]';
    var textboxElement = document.querySelector(textboxSelector);
    isTextboxFocused = document.activeElement === textboxElement;

    if (!isTextboxFocused) {
      chrome.runtime.sendMessage({
        action: "focusTextbox",
        instaTabId: instaTabId,
      });

      await delay(100);
    } else {
      break;
    }
  }
}

function checkIfTextboxIsFocused() {
  var textboxSelector = 'div[role="textbox"][contenteditable="true"]';
  var textboxElement = document.querySelector(textboxSelector);
  isTextboxFocused = document.activeElement === textboxElement;


  // console.error(`[INSTAGRAM] - Enfocando Ventana!!'`);
  // chrome.runtime.sendMessage({
  //   action: "focusWindow",
  //   windowId: windowId
  // },
  // function (response) {
    
  // });



  if (!isTextboxFocused) {
    console.error(`[INSTA] - Enfocando textbox'`);
    chrome.runtime.sendMessage({
      action: "focusTextbox",
      instaTabId: instaTabId,
    });
    
  } else {
    
    if (message_to_send.length === 0) {
      
      return false;
    }
    console.error(`[INSTA] - Enviando mensaje!'`);
    chrome.runtime.sendMessage(
      {
        action: "buttonMessageClicked",
        instaTabId: instaTabId,
        messageToSend: message_to_send,
      },
      function (response) {
        
      }
    );

    setTimeout(() => {
      let resDivs = findBlockedMessageDivs();
      if (resDivs === false) {
        console.error(`[INSTAGRAM] - Enviando mensajes!!'`);
        chrome.runtime.sendMessage({
          action: "userMessageSent",
          usernameMessageSent: usernameInsta,
          messagesLimit: messagesLimit,
        });
        userAddedCSV = true;
      } else {
        console.error(`[INSTA] - NO se puede enviar mensaje '`);
        chrome.runtime.sendMessage({
          action: "userMessageNotAllowed",
          usernameMessageSent: usernameInsta
        });
      }
    }, 60000);  // 30,000 milisegundos = 30 segundos

    return true;
  }

  return false;
}






function checkAndFocusTextboxComments() {
if (currentAttempts < maxAttempts) {
    checkIfTextboxIsFocusedComments();
    currentAttempts++;
    
    if (!isTextboxFocusedComments) {
      setTimeout(checkAndFocusTextboxComments, 100); // Adjust the delay as needed
    }
  } else {
    
    return false;
    // Optionally, handle the failure to focus the textbox here
  }
  
  if (!userAddedCSV) {
    console.error(`[INSTAGRAM] - Enviando mensajes!!'`);
    chrome.runtime.sendMessage({
      action: "userMessageSent",
      usernameMessageSent: usernameInsta,
      messagesLimit: messagesLimit,
    });
    userAddedCSV = true;
  }
  return true;
}


function checkIfTextboxIsFocusedComments() {
  var textboxSelector = 'textarea[aria-label="Add a comment…"], textarea[aria-label="Agrega un comentario…"], textarea[placeholder="Add a comment…"], textarea[placeholder="Agrega un comentario…"]';
  var textboxElement = document.querySelector(textboxSelector);
  isTextboxFocusedComments = document.activeElement === textboxElement;


  // TODO: regain focus of window
  // console.error(`[INSTAGRAM] - Enfocando Ventana!!'`);
  // chrome.runtime.sendMessage({
  //   action: "focusWindow",
  //   windowId: windowId
  // },
  // function (response) {
    
  // });

  if (!isTextboxFocusedComments) {
    console.error(`[INSTA] - Enfocando textbox '`);
    chrome.runtime.sendMessage({
      action: "focusTextbox",
      instaTabId: instaTabId,
    });
    
  } else {
    
    if (message_to_send.length === 0) {
      
      return false;
    }
    // chrome.runtime.sendMessage(
    //   {
    //     action: "buttonMessageClicked",
    //     instaTabId: instaTabId,
    //     messageToSend: "🔥",
    //   },
    //   function (response) {
    //     
    //   }
    // );

    

    return true;
  }

  return false;
}

function clickPauseButtonDirectly() {
  // Busca elementos que contengan el atributo aria-label igual a "Pause" o "Pausa"
  let words = ["Pause", "Pausar"];

  for (let word of words) {
    var pauseButton = document.querySelector(
      `div[role="button"] svg[aria-label="${word}"]`
    );
    if (!pauseButton) {
      
      continue;
    }

    pauseButton = pauseButton.parentNode;
    
    // Verifica si se encontró el botón de pausa
    if (pauseButton) {
      pauseButton.click(); // Si se encuentra, haz clic en el botón
      return true;
    } else {
      console.log("No se encontró el botón de pausa");
    }
  }

  return false;
}

function setPasswordIG(password, instaTabId) {
  for (let i = 0; i < 5; i++) {
    try {
      let inputElement = document.querySelector('input[name="password"]');
      inputElement.focus();
      inputElement = document.querySelector('input[name="password"]');
      inputElement.focus();
      inputElement = document.querySelector('input[name="password"]');
      inputElement.focus();

      // write into the textbox the value

      console.error(`[INSTA] - Boton de mensaje se dio click'`);
      chrome.runtime.sendMessage(
        {
          action: "buttonMessageClicked",
          instaTabId: instaTabId,
          messageToSend: password,
        },
        function (response) {
          
        }
      );

      return;
    } catch (e) {
      
      continue;
    }
  }
}

function setUsernameIG(username, instaTabId) {
  // Select the textarea by its placeholder attribute
  //var textarea = document.querySelector(`textarea[placeholder^="Reply to ${usernameInsta}..."]`);

  for (let i = 0; i < 5; i++) {
    try {
      let inputElement = document.querySelector('input[name="username"]');
      inputElement.focus();
      inputElement = document.querySelector('input[name="username"]');
      inputElement.focus();
      inputElement = document.querySelector('input[name="username"]');
      inputElement.focus();

      // write into the textbox the value

      chrome.runtime.sendMessage(
        {
          action: "buttonMessageClicked",
          instaTabId: instaTabId,
          messageToSend: username,
        },
        function (response) {
          
        }
      );

      return;
      // setTimeout(() => {return;}, 10000);
    } catch (e) {
      
      continue;
    }

    // for (let placeholder of placeholders) {
    //     // Check if the textarea was found
    //     if (textarea) {
    //         textarea.focus(); // Focus on the textarea to be ready to type a message
    //         // after focusing, write message with keyboard
    //         chrome.runtime.sendMessage({ action: "buttonMessageClicked", instaTabId: instaTabId, messageToSend:message_to_send }, function(response) {
    //                             
    //                         });

    //         // TEST THIS CODE
    //         chrome.runtime.sendMessage({ action: 'userMessageSent', usernameMessageSent : usernameInsta, messagesLimit : messagesLimit });
    //         return true;

    //     } else {
    //         
    //         continue
    //     }
    // }
  }
}


function checkIfErrorIsShown() {
  // check if a banner as "something is wrong" is shown
  let errorBanner = document.querySelector('div[role="alert"]');
  if (errorBanner) {
    return true;
  }

  // Buscar elementos que contengan los mensajes de error
  const errorMessages = [
    'Something went wrong',
    'Algo salió mal',
    'Algo salio mal'
  ];

  // Buscar en todos los elementos div del DOM
  const divs = document.querySelectorAll('div');
  for (let div of divs) {
    if (errorMessages.some(message => div.textContent.toLowerCase().includes(message.toLowerCase()))) {
      return true;
    }
  }

  return false;
}




function focusOnTextarea() {
  // Select the textarea by its placeholder attribute
  //var textarea = document.querySelector(`textarea[placeholder^="Reply to ${usernameInsta}..."]`);

  for (let i = 0; i < 5; i++) {
    var placeholders = ["Reply to", "Responde a", "Responder a"];

    for (let placeholder of placeholders) {
      var textarea = document.querySelector(
        `textarea[placeholder^="${placeholder}"]`
      );
      // Check if the textarea was found
      if (textarea) {
        textarea.focus(); // Focus on the textarea to be ready to type a message
        // after focusing, write message with keyboard
          

        // TEST THIS CODE
        
         // TEST THIS CODE
         console.error(`[INSTA] - Envando mensaje por Story!!'`);
         chrome.runtime.sendMessage(
          {
            action: "buttonMessageClicked",
            instaTabId: instaTabId,
            messageToSend: RANDOM_MESSAGES_FOR_STORIES[Math.floor(Math.random() * RANDOM_MESSAGES_FOR_STORIES.length)], // here we should send a random message from the list of randomMessagesForStories
          },
          function (response) {
            
          }
        );

        setTimeout(() => {
          // check if error is shown!
          let errorIsShown = checkIfErrorIsShown();
          if (errorIsShown) {
            chrome.runtime.sendMessage({
              action: "userMessageNotAllowed",
              usernameMessageSent: usernameInsta
            });
            return false;
          }

          console.error(`[INSTAGRAM] - Desenfocando Ventana!!'`);
          chrome.runtime.sendMessage({
            action: "unfocusWindow",
            windowId: windowId
          },
          function (response) {
            
          }
        );
        setTimeout(async () => {
          let resDivs = findBlockedMessageDivs();
          if (resDivs === false) {
            // couldSendMessage = await sendDMmesssage(); // TODO: comment this 
            console.error(`[INSTAGRAM] - Enviando mensajes!!'`); // TODO: uncomment this
            chrome.runtime.sendMessage({
              action: "userMessageSent",
              usernameMessageSent: usernameInsta,
              messagesLimit: messagesLimit,
            });
            userAddedCSV = true;
          } else {
            console.error(`[INSTA] - Mensaje no se envió`);
            chrome.runtime.sendMessage({
              action: "userMessageNotAllowed",
              usernameMessageSent: usernameInsta
            });
          }
        }, getRandomNumber(27000,30000));  // 30,000 milisegundos = 30 segundos
      }, getRandomNumber(1000,2000));
        return true;
      } else {
        console.error(`[INSTAGRAM] - NO hay text area para enfocar!!'`);
        continue;
      }
    }
  }

  return false;
}

function clickFirstButtonWithRoleAndTabindex() {
  // Seleccionar todos los elementos con role="button" y tabindex="0"
  const buttons = document.querySelectorAll('div[role="button"][tabindex="0"]');

  // Verificar si se encontraron elementos
  if (buttons.length > 0) {
    // Obtener el primer elemento
    const firstButton = buttons[0];

    // Hacer clic en el primer elemento
    firstButton.click();
  } else {
    
  }
}

var usersMessageSent = [];

function clickButtonIfNotDisabled() {
  try {
    // var button = document.evaluate("/html/body/div[2]/div/div/div[2]/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/div/div", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    // if (button) {
    console.log("button story found");
    // var isDisabled = button.getAttribute('aria-disabled');
    // if (isDisabled === 'false') {
    // button.click();
    console.error(`[INSTA] - Dando click al botón de la story clickFirstButtonWithRoleAndTabindex()'`);
    clickFirstButtonWithRoleAndTabindex();
    console.error(`[INSTA] - Se dio click al botón de la story clickFirstButtonWithRoleAndTabindex()'`);

    var couldSendMessage = false;

    setTimeout(async () => {
      console.error(`[INSTA] - pausando clickPauseButtonDirectly();'`);
      let resPause = clickPauseButtonDirectly();
      console.error(`[INSTA] - se dio click al pausado clickPauseButtonDirectly();'`);
      if (!resPause) {
        console.error(`[INSTA] - no existe boton de pausa, entrando a sendDMmesssage();'`);
        couldSendMessage = await sendDMmesssage();
        console.error(`[INSTA] - no existe boton de pausa, saliendo de sendDMmesssage();'`);
        return couldSendMessage;
      }

      // TODO: regain focus of window
      // console.error(`[INSTAGRAM] - Enfocando Ventana!!'`);
      // chrome.runtime.sendMessage({
      //     action: "focusWindow",
      //     windowId: windowId
      //   },
      //   function (response) {
          
      //   }
      // );

      // setTimeout(() => {
        let resTextArea = focusOnTextarea();

        if (!resTextArea) {
          couldSendMessage = await sendDMmesssage();
        }

        return couldSendMessage;

      // }, getRandomNumber(5000,8000));
    }, getRandomNumber(2000,3000)); // changed

    // }
    // }
  } catch (ex) {
    
  }
}

async function sendDMmesssage() {
  console.error(`[INSTA] - Dando click en boton de enviar mensaje - clickSendMessageButton();'`);
  await clickSendMessageButton();
  console.error(`[INSTA] - Terminado dando click en boton de enviar mensaje - clickSendMessageButton();'`);

  // check if some error is shown
  let errorIsShown = checkIfErrorIsShown();
  if (errorIsShown) {
    chrome.runtime.sendMessage({
      action: "userMessageMessageButtonBan"
    });
    return
  }

  setTimeout(() => {
    //location.href = location.href; // reload
    console.error(`[INSTA] -  Obteniendo coordenadas del textarea dentro de mensajes directos'`);
    const contents = ["Message...", "Enviar mensaje...", "Envía un mensaje..."];
    const coordinates = getDivCoordinatesByContent(contents);
    console.error(`[INSTA] -  Coordenadas obtenidas, existe entonces'`);
    if (coordinates) {
        //console.error(`[INSTA] -  Desenfocando despues de abrir!`);
      //   chrome.runtime.sendMessage({
      //     action: "unfocusWindow",
      //     windowId: windowId
      //   },
      //   function (response) {
          
      //   }
      // );
        // console.error(`[INSTA] -  Desenfocada despues de abrir!`);
        setTimeout(async () => {
          console.error(`[INSTA] -  Dando click a la textarea'`);

          var textboxSelector = 'div[role="textbox"][contenteditable="true"]';
          var p = document.querySelector(textboxSelector);
          var s = window.getSelection();
          var r = document.createRange();
          p.innerHTML = '\u00a0';
          r.selectNodeContents(p);
          s.removeAllRanges();
          s.addRange(r);
          document.execCommand('delete', false, null);

          await delay(1000);
          await focusTextbox();

          console.error(`[INSTA] -  Desenfocando despues de abrir!`);
          chrome.runtime.sendMessage({
            action: "unfocusWindow",
            windowId: windowId
          },
          function (response) {
            
          });
          console.error(`[INSTA] -  Desenfocada despues de abrir!`);
        
          setTimeout(() => {
            console.error(`[INSTA] - Enviando a escribir mensaje a background.js'`);
            chrome.runtime.sendMessage(
              {
                action: "buttonMessageClicked",
                instaTabId: instaTabId,
                messageToSend: message_to_send,
              },
              function (response) {
                
              }
            );

            setTimeout(() => {
              console.error(`[INSTAGRAM] - Desenfocando Ventana!!'`);
                chrome.runtime.sendMessage({
                  action: "unfocusWindow",
                  windowId: windowId
                },
                function (response) {
                  
                }
              );
              setTimeout(() => {
                let resDivs = findBlockedMessageDivs();
                if (resDivs === false) {
                  console.error(`[INSTAGRAM] - Enviando mensajes!!'`);
                  chrome.runtime.sendMessage({
                    action: "userMessageSent",
                    usernameMessageSent: usernameInsta,
                    messagesLimit: messagesLimit,
                  });
                  userAddedCSV = true;
                } else {
                  console.error(`[INSTA] - Mensaje no se pudo enviar!`);
                  chrome.runtime.sendMessage({
                    action: "userMessageNotAllowed",
                    usernameMessageSent: usernameInsta
                  });
                }
              }, getRandomNumber(27000,30000));  // 30,000 milisegundos = 30 segundos
            }, getRandomNumber(2000,3000));
          }, getRandomNumber(1000,2000));

        }, getRandomNumber(1000,2000));

      
      // setTimeout(() => {
      //   currentAttempts = 0;
      //   
      //   let isSuccess = checkAndFocusTextbox();

      //   return isSuccess;

      //   // DONE!
      // }, 25000);
    } else {
      // if (location.href.includes(`/${usernameInsta}`) && shouldFollowFollowers) {
      //   console.error(`[INSTAGRAM] - NO puedo enviar mensajes directos por que estoy baneado!!!'`);
      //   chrome.runtime.sendMessage({
      //     action: "userMessageMessageButtonBan"
      //   });
      // } else if (!location.href.includes(`/${usernameInsta}`)) {
      //   console.error(`[INSTAGRAM] - NO hay caja de texto de mensaje directo!!!'`);
      //   chrome.runtime.sendMessage({
      //     action: "userMessageNotAllowed",
      //     usernameMessageSent: usernameInsta
      //   });
      // } else {
      //   // is in here but not shouldFollowFollowers
      //   chrome.runtime.sendMessage({
      //     action: "userMessageNotAllowed",
      //     usernameMessageSent: usernameInsta
      //   });
      // }
    }

    // refresh
  }, 5000);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function clickComposeButton(message) {
  message_to_send = message;
  
  setTimeout(function () {
    // first we follow the person!
    console.error(`[INSTA] - Empezando a dar click en seguir'`);

    if (shouldFollowFollowers) {
      clickButtonWithText(["Seguir", "Follow"]);
    }

    console.error(`[INSTA] - Terminó de dar click en seguir'`);

    setTimeout(async () => {
      chrome.runtime.sendMessage({
          action: "focusWindow",
          windowId: windowId
        },
        function (response) {
          
      });


      console.error(`[INSTA] - Verificando historia'`);

      var button = document.evaluate(
        "/html/body/div[2]/div/div/div[2]/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/div/div",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      var isDisabledStory = "false"; // true
      let isPrivateCheck = false;

      if (button) {
        console.error(`[INSTA] - Parece haber historia'`);
        isDisabledStory = button.getAttribute("aria-disabled");
      } else {
        
      }


      let couldSendMessage = false;

      if (isDisabledStory === "false") {
        console.error(`[INSTA] - empezando clibkButtonIfNotDisabled()'`);
        // pause story and send message?
        couldSendMessage = await clickButtonIfNotDisabled();
        console.error(`[INSTA] - terminando clibkButtonIfNotDisabled()'`);
      } else {
        // TODO: Descomentamos por ahora
        console.error(`[INSTA] - no se pudo con story, enviamos sendDMMessage()'`);

        couldSendMessage = await sendDMmesssage();
        console.error(`[INSTA] - no se pudo story, terminado sendDMMessage()'`);
      }

      return couldSendMessage;

        // check if button for stories is active
    }, getRandomNumber(3000,4500)); // aumentamos el tiempo de espera para que pueda seguir a los prsoepctos
  }, getRandomNumber(2000,3000));
}


function getRandomNumber(first, last) {
  return Math.floor(Math.random() * (last - first + 1)) + first;
}

function clickButtonWithText(texts) {
  let res = false;
  for (let text of texts) {
    const buttons = Array.from(document.querySelectorAll("button"));
    for (let button of buttons) {
      if (button.textContent.includes(text)) {
        button.click();
        setTimeout(() => {
          if (texts.indexOf(button.innerText.trim()) !== -1) {
            chrome.runtime.sendMessage({ action: "stopFollowing", instaTabId: instaTabId });
          } 
        }, 5000);
      }
    }
  }

  return res;
}

var currentAttemptsPauseStory = 0;
var isButtonPauseFocused = false;
var maxAttemptsStory = 20;

function checkIfPauseButtonIsFocused() {
  var activeElement = document.activeElement;
  var innerHTML = activeElement.innerHTML;

  var containsPauseSvg =
    innerHTML.includes('aria-label="Pause"') ||
    innerHTML.includes('aria-label="Pausa"');

  // while (true) {
  // var isTextboxFocused = false
  if (!containsPauseSvg) {
    chrome.runtime.sendMessage({ action: "tabStory", instaTabId: instaTabId });
    // setTimeout(() => {
    
    // },20000); // await for 20 seconds
  } else {
    
    // if (message_to_send.length === 0) {
    //     
    //     return;
    // }
    // chrome.runtime.sendMessage({ action: "buttonMessageClicked", instaTabId: instaTabId, messageToSend:message_to_send }, function(response) {
    //     
    // });
    activeElement.click();
  }
  // }
}

function findAndPauseStory() {
  if (currentAttemptsPauseStory < maxAttemptsStory) {
    checkIfPauseButtonIsFocused();
    currentAttemptsPauseStory++;
    
    if (!isButtonPauseFocused) {
      setTimeout(findAndPauseStory, 8000); // Adjust the delay as needed
    }
  } else {
    
    return false;
    // Optionally, handle the failure to focus the textbox here
  }
  if (!userAddedCSV) {
    console.error(`[INSTAGRAM] - Enviando mensajes!!'`);
    chrome.runtime.sendMessage({
      action: "userMessageSent",
      usernameMessageSent: usernameInsta,
      messagesLimit: messagesLimit,
    });
    userAddedCSV = true;
  }

  return true;
}

async function clickSendMessageButton() {
  const texts = ["Enviar mensaje", "Message", "Send message"]; // Add other button texts if needed

  for (let text of texts) {
    let xpath = `//div[contains(text(), '${text}')] | //div[normalize-space()='${text}']`;
    let iterator = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    );

    if (iterator) {
      // if theres a button!!
    //   chrome.runtime.sendMessage({
    //       action: "focusWindow",
    //       windowId: windowId
    //     },
    //     function (response) {
          
    //     }
    //   );
    // }
    

      let button = iterator.iterateNext();

      while (button) {
        if (button instanceof HTMLElement && button.click) {
          console.error("Dando click al boton de enviar mensajes");
          button.click();
          return true;
        }
        button = iterator.iterateNext();
      }
    }
  

  // for (let text of texts) {
  //   let xpath = `//div[contains(text(), '${text}')] | //div[normalize-space()='${text}']`;
  //   let button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
  //   if (button) {
  //     // console.error(`[INSTAGRAM] - Enfocando Ventana!!'`);
  //     // chrome.runtime.sendMessage({
  //     //     action: "focusWindow",
  //     //     windowId: windowId
  //     //   },
  //     //   function (response) {
          
  //     // });

  //     console.error("Dando click al boton de enviar mensajes");

  //     setTimeout(() => {
  //       button.click();
  //     }, 2000);
  //   }
  // }
  }

  // if not found a div with such texts, click the buttons with delay

  // TODO: uncomment this!
  // if (shouldFollowFollowers) {
  let resButton = await clickButtonsWithDelay(texts);
  if (resButton) {
    return true;
  }
  // }

  /* 
  TODO: TEORIA: 
  - Hay 2 escenarios cuando el botón de enviar mensajes no se encuentra MIENTRAS sigas shouldFolloFollowers = True
  1. El botón no se encuentra por que le dio seguir, y falló, aka, puede haber riesgo de ban!
  2. El idioma del usuario NO es español ni INGLES!
  */
  return false;  // Si no se encuentra ninguno de los botones
}



function clickButtonsWithDelay(texts) {
  return new Promise((resolve) => {
    // Selecciona el elemento <circle> con los atributos especificados
    const circleButton = document.querySelector('circle[cx="6"][cy="12"][r="1.5"]');
    
    if (!circleButton) {
      resolve(false);
      return;
    }

    // Simula un clic en el elemento <circle> usando dispatchEvent
    circleButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    console.log('Círculo clicado');

    // Espera 2 segundos antes de buscar y hacer clic en el botón de enviar mensaje
    setTimeout(() => {
      // Selecciona el botón de "Send message" por su texto
      const buttons = document.querySelectorAll('button');
      let messageButtonFound = false;
      
      for (let button of buttons) {
        if (texts.indexOf(button.innerText.trim()) !== -1) {
          button.click();
          console.log('Botón de enviar mensaje clicado');
          messageButtonFound = true;
          resolve(true);
          return;
        }
      }
      
      resolve(false);
    }, 2000);
  });
}






function checkIfSendMessageExists() {
  const texts = ["Enviar mensaje", "Message", "Send message"]; // Add other button texts if needed

  for (let text of texts) {
    let xpath = `//div[contains(text(), '${text}')] | //div[normalize-space()='${text}']`;
    let iterator = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    );
    let button = iterator.iterateNext();

    while (button) {
      if (button instanceof HTMLElement && button.click) {
        return true;
      }
      button = iterator.iterateNext();
    }
  }

  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dispatchKeyEventWithDelay(tabId, key, delay) {
  const keyDownParams = { type: "keyDown", text: key };
  const keyUpParams = { type: "keyUp" };

  await chrome.debugger.sendCommand(
    { tabId: tabId },
    "Input.dispatchKeyEvent",
    keyDownParams
  );
  await sleep(delay);
  await chrome.debugger.sendCommand(
    { tabId: tabId },
    "Input.dispatchKeyEvent",
    keyUpParams
  );
  await sleep(delay);
}

async function simulateTyping(tabId, message, delay = 100) {
  for (const char of message) {
    await dispatchKeyEventWithDelay(tabId, char, delay);
  }

  await pressedEnter(tabId);
}

async function pressedEnter(tabId) {
  await chrome.debugger.sendCommand(
    { tabId: tabId },
    "Input.dispatchKeyEvent",
    {
      type: "rawKeyDown",
      windowsVirtualKeyCode: 13,
      unmodifiedText: "\r",
      text: "\r",
    }
  );
  await chrome.debugger.sendCommand(
    { tabId: tabId },
    "Input.dispatchKeyEvent",
    {
      type: "char",
      windowsVirtualKeyCode: 13,
      unmodifiedText: "\r",
      text: "\r",
    }
  );
  await chrome.debugger.sendCommand(
    { tabId: tabId },
    "Input.dispatchKeyEvent",
    {
      type: "keyUp",
      windowsVirtualKeyCode: 13,
      unmodifiedText: "\r",
      text: "\r",
    }
  );
}

// async function sendMessage(tabId, message) {
//     await simulateTyping(tabId, message);
//     // await dispatchKeyEventWithDelay(tabId, 'Enter'); // Simulate pressing Enter to send the message
// }

var usernameInsta = "";
var isComments = false;

function sendMessage(username, message) {
  // Logic to navigate to the user's chat and send a message
  // This is complex because you'll need to interact with Instagram's UI elements
  // and they don't have consistent selectors you can easily target.
  
  
  usernameInsta = username;
  try {
    console.error(`[INSTA] - Empezando clickCompose()'`);
    // Open new message dialog
    return clickComposeButton(message);

  } catch (error) {
    
  }
}


// function checkDismissButton() {
//   const dismissButton = document.querySelector('[role="button"][aria-label="Dismiss"], [role="button"][aria-label="Cerrar"]');
//   if (dismissButton) {
//       // Agregar evento de clic al botón
//       dismissButton.click();
//       
//       return true;
//   } else {
//       
//       return false;
//   }
// }

function checkDismissButton() {
  const dismissButtons = document.querySelectorAll('[role="button"][aria-label="Dismiss"], [role="button"][aria-label="Cerrar"], [role="button"][aria-label="Despedir"], [role="button"][aria-label="Ignorar"]');
  
  if (dismissButtons.length > 1) {
      
      return false;
  } else if (dismissButtons.length === 1) {
      // Agregar evento de clic al único botón encontrado
      dismissButtons[0].click();
      
      return true;
  } else {
      
      return false;
  }
}



function logoutInstagram() {
  // Paso 1: Seleccionar el primer elemento basado en los criterios
  let ret = checkDismissButton();
  if (ret) {
    return 'dismiss';
  }
  
  const links = document.querySelectorAll('a[role="link"][tabindex="0"]');

  let targetLink = null;

  // Itera sobre los links encontrados para verificar el contenido del aria-label dentro del SVG
  links.forEach((link) => {
    const svg = link.querySelector("svg");
    if (svg) {
      const ariaLabel = svg.getAttribute("aria-label");
      if (
        ariaLabel &&
        (ariaLabel === "Settings" || ariaLabel === "Configuración" || ariaLabel === "Ajustes")
      ) {
        targetLink = link;
      }
    }
  });

  // Paso 2: Si se encuentra el primer elemento, enfocar el segundo elemento
  if (targetLink) {
    
    // make tab on that thing
    targetLink.focus();
    targetLink.focus();
    targetLink.click();
    setTimeout(() => {
    //   chrome.runtime.sendMessage(
    //     {
    //       action: "makeEnter",
    //       instaTabId: instaTabId,
    //     },
    //     function (response) {
    //       
    //     }
    //   );

      setTimeout(() => {
        console.log("Link encontrado:", targetLink);
        targetLink.focus();

        // Obtener el segundo elemento por sus atributos y texto interno
        const buttons = document.querySelectorAll(
          'div[role="button"][tabindex="0"]'
        );
        let targetButton = null;

        buttons.forEach((button) => {
          const span = button.querySelector("span");
          if (
            span &&
            (span.textContent === "Log out" ||
              span.textContent === "Cerrar sesión" || 
              span.textContent === "Salir"
            )
          ) {
            targetButton = button;
          }
        });

        if (targetButton) {
          console.log("Botón encontrado:", targetButton);
          targetButton.focus();
          targetButton.click();

        //   chrome.runtime.sendMessage(
        //     {
        //       action: "makeEnter",
        //       instaTabId: instaTabId,
        //     },
        //     function (response) {
        //       
        //     }
        //   );
        } else {
          console.log("Botón no encontrado.");
        }
      }, 5000);
    }, 10000);
  } else {
    console.log("Link no encontrado.");
  }
}

function loginInstagram(username, password, instaTabId, windowId) {

  setTimeout(() => {
    // TODO: regain focus of window
    console.error(`[INSTAGRAM] - Enfocando Ventana!!'`);
    chrome.runtime.sendMessage({
        action: "focusWindow",
        windowId: windowId
      },
      function (response) {
        
      }
    );

    setTimeout(() => {
      setUsernameIG(username, instaTabId);
      setTimeout(() => {
        setPasswordIG(password, instaTabId);
        setTimeout(() => {
          // check for "Detectamos comportamientos automatizados..." and click Dismiss button
          let ret = checkDismissButton();
          if (ret) {
            return;
          }
        });
      }, 20000); // 20 seconds
    }, 5000);
  }, 5000); // 5 seconds
}

async function checkIsPrivate() {
  return new Promise((resolve) => {
      setTimeout(() => {
          // Verificar si la página contiene la frase en español o en inglés
          const bodyText = document.body.innerText;
          if (bodyText.includes('sta cuenta es privada') || bodyText.includes('his account is private')) {
              console.error("[HOWER] Esta cuenta es privada!!");
              resolve(true); // Resolve the promise with 'true' if either text is found
          } else {
            console.error("[HOWER] Esta cuenta NO es privada!!");
              resolve(false); // Resolve the promise with 'false' if neither text is found
          }
      }, 2000); // Espera 4 segundos antes de verificar el texto
  });
}

// CHAT GPT FUNCTION!

async function openUserProfile(username) {
  try {
    // Paso 1: Buscar el ícono de búsqueda por aria-label "Search" o "Buscar" y hacer clic en el elemento
    const searchIcon = document.querySelector('svg[aria-label="Search"], svg[aria-label="Buscar"], svg[aria-label="Búsqueda"]');
    
    if (!searchIcon) {
      console.error('No se encontró el ícono de búsqueda.');
      return false; // Retorna false si no se encuentra el ícono de búsqueda
    }

    const link = searchIcon.closest('a'); // Buscar el <a> más cercano que contiene el icono

    if (!link) {
      console.error('No se encontró el enlace contenedor.');
      return false; // Retorna false si no se encuentra el enlace contenedor
    }

    link.click(); // Hacer clic en el enlace
    console.log('Clic en el ícono de búsqueda');

    // Paso 2: Esperar a que aparezca el input de búsqueda
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Esperamos 3 segundos para asegurar que el input haya cargado

    const searchInput = document.querySelector('input[aria-label="Search input"], input[aria-label="Buscar entrada"]');

    if (!searchInput) {
      console.error('No se encontró el input de búsqueda.');
      return false; // Retorna false si no se encuentra el input de búsqueda
    }

    // Paso 3: Escribir el nombre de usuario en el input de búsqueda
    searchInput.focus();
    searchInput.value = username;
    const event = new Event('input', { bubbles: true }); // Disparamos el evento 'input'
    searchInput.dispatchEvent(event); // Lanzar el evento manualmente
    console.log(`Se ha escrito "${username}" en el campo de búsqueda`);

    // Paso 4: Crear un intervalo que busque el enlace del perfil
    const profileFound = await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        const linkElement = document.querySelector(`a[href="/${username}/"]`);

        if (linkElement) {
          // Simular un clic real en el enlace
          const mouseEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            buttons: 1
          });

          linkElement.dispatchEvent(mouseEvent);
          console.log(`Simulando un clic real en el enlace de ${username}.`);

          clearInterval(intervalId);
          resolve(true); // Resolvemos con true cuando encontramos el enlace y hacemos clic
        }
      }, 500); // Repite la búsqueda cada 500ms

      // Opción: cancelar la búsqueda después de 10 segundos si no se encuentra
      setTimeout(() => {
        clearInterval(intervalId);
        resolve(false); // Resolvemos con false si no se encuentra después de 10 segundos
      }, 10000); // Cancelar después de 10 segundos
    });

    if (!profileFound) {
      console.error('No se encontró el enlace del perfil después de 10 segundos.');
      return false;
    }

    // Si todo fue exitoso, retornar true para continuar con el proceso
    return true;

  } catch (error) {
    console.error('Error en openUserProfile:', error);
    return false; // Retorna false si ocurre cualquier error
  }
}

// async function openUserProfile(username) {
//   try {
//     // Paso 1: Buscar el ícono de búsqueda por aria-label "Search" o "Buscar" y hacer clic en el elemento
//     const searchIcon = document.querySelector('svg[aria-label="Search"], svg[aria-label="Buscar"], svg[aria-label="Búsqueda"]');
    
//     if (!searchIcon) {
//       throw new Error('No se encontró el ícono de búsqueda.');
//     }

//     const link = searchIcon.closest('a'); // Buscar el <a> más cercano que contiene el icono

//     if (!link) {
//       throw new Error('No se encontró el enlace contenedor.');
//     }

//     link.click(); // Hacer clic en el enlace
//     console.log('Clic en el ícono de búsqueda');

//     // Paso 2: Esperar a que aparezca el input de búsqueda
//     await new Promise((resolve) => setTimeout(resolve, 3000)); // Esperamos 3 segundos para asegurar que el input haya cargado

//     const searchInput = document.querySelector('input[aria-label="Search input"], input[aria-label="Buscar entrada"]');

//     if (!searchInput) {
//       throw new Error('No se encontró el input de búsqueda.');
//     }

//     // Paso 3: Escribir el nombre de usuario en el input de búsqueda
//     searchInput.focus();
//     searchInput.value = username;
//     const event = new Event('input', { bubbles: true }); // Disparamos el evento 'input'
//     searchInput.dispatchEvent(event); // Lanzar el evento manualmente
//     console.log(`Se ha escrito "${username}" en el campo de búsqueda`);

//     // Paso 4: Crear un intervalo que busque el enlace del perfil
//     await new Promise((resolve, reject) => {
//       const intervalId = setInterval(() => {
//         const linkElement = document.querySelector(`a[href="/${username}/"]`);

//         if (linkElement) {
//           // Simular un clic real en el enlace
//           const mouseEvent = new MouseEvent('click', {
//             view: window,
//             bubbles: true,
//             cancelable: true,
//             buttons: 1
//           });

//           linkElement.dispatchEvent(mouseEvent);
//           console.log(`Simulando un clic real en el enlace de ${username}.`);

//           clearInterval(intervalId);
//           resolve(); // Resolvemos la promesa cuando encontramos el enlace y hacemos clic
//         }
//       }, 500); // Repite la búsqueda cada 500ms

//       // Opción: cancelar la búsqueda después de 10 segundos si no se encuentra
//       setTimeout(() => {
//         clearInterval(intervalId);
//         reject(new Error('No se encontró el enlace del perfil después de 10 segundos.'));
//       }, 10000); // Cancelar después de 10 segundos
//     });

//     // Paso 5: Enviar un mensaje a background script
//     // chrome.runtime.sendMessage(
//     //   {
//     //     action: "buttonMessageClicked",
//     //     instaTabId: instaTabId,
//     //     messageToSend: username,
//     //   },
//     //   function (response) {
//     //     console.log("Response from background:", response);
//     //   }
//     // );

//   } catch (error) {
    
//   }
// }




async function getFullName() {
  return new Promise((resolve) => {
    setTimeout(() => {
      let res = obtenerTextoDelQuintoSection();
      if (!res) {
        resolve("");
        return;
      }
      
      res = res.split(" ")[0];
      resolve(res);
    }, 4000);
  });
}



function obtenerTextoDelQuintoSection() {
  // Selecciona todos los elementos <section> que coincidan con el selector de clase proporcionado
  const sections = document.querySelectorAll('section');
  
  // Verifica si hay al menos cinco <section> en la colección
  console.error(`[INSTA] - Secciones encontradas: ${sections.length}`);

  if (sections.length >= 5) {
      // Selecciona el quinto <section>
      const quintoSection = sections[4];
      
      // Encuentra el primer <span> dentro del quinto <section>
      const primerSpan = quintoSection.querySelector('span');
      
      // Verifica si se encontró un <span> y obtiene su texto
      if (primerSpan) {
          const texto = primerSpan.textContent;
          console.log(texto);
          return texto;
      } else {
          console.log("No se encontró ningún <span> en el quinto <section>.");
      }
  } else {
      console.log("No hay suficientes <section> en la página.");
  }
}

function doFiltersApply(palabrasABuscar, filtersExclude) {
  // Selecciona el quinto section del documento
  let fifthSection = document.querySelectorAll('section')[4]; // Los selectores son base 0, por eso usamos 4 para el quinto section

  // Contenido del quinto section, incluyendo el texto de todos sus elementos hijos
  let contenidoSection = fifthSection.textContent.toLowerCase();

  // Verificar si alguna de las palabras está en el contenido
  for (let palabra of palabrasABuscar) {
    if (contenidoSection.includes(palabra.toLowerCase())) {
      console.log(`[INSTA] La palabra "${palabra}" está presente en el quinto section.`);
      return true;  // Retorna true inmediatamente si encuentra la palabra
    }
  }

  for (let palabra of filtersExclude) {
    if (contenidoSection.includes(palabra.toLowerCase())) {
      console.log(`[INSTA] La palabra de FILTERS EXCLUDE "${palabra}" está presente en el quinto section.`);
      return true;  // Retorna true inmediatamente si encuentra la palabra
    }
  }

  // Si no encontró ninguna palabra, retorna false
  return false;
}


function checkSendMessageIsEnabled() {
  const texts = ["Enviar mensaje", "Message", "Send message"]; // Add other button texts if needed

  for (let text of texts) {
    let xpath = `//div[contains(text(), '${text}')] | //div[normalize-space()='${text}']`;
    let iterator = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    );

    if (iterator) {
    

      let button = iterator.iterateNext();

      while (button) {
        if (button instanceof HTMLElement && button.click) {
          console.error("Dando click al boton de enviar mensajes");
          // button.click();
          return true;
        }
        button = iterator.iterateNext();
      }
    }
  
  }

  return false;
}

function checkIfUserAlreadyFollows() {
  // check if the user already follows the user
  let texts = ["Siguiendo", "Following", "Seguido"];

  for (let text of texts) {
    const buttons = Array.from(document.querySelectorAll("button"));
    for (let button of buttons) {
      if (button.textContent.includes(text)) {
        return true;
      }
    }
  }

  return false;
}

let usernameSending = '';



async function checkGender(full_name) {
  try {
    const response = await fetch(`https://gender.fly.dev/?name=${full_name}`);
    const data = await response.json();
    return data.gender;
  } catch (error) {
    console.error(`[INSTA] Error al obtener el género - ${error}`);
    return "not_provided";
  }
}


chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  
  let response = { status: "Done", message: "" };

  if (request.action === "sendMessage") {
    // await openUserProfile(
    //   request.username
    // )
    
    // const profileOpened = await openUserProfile(request.username);
    // if (!profileOpened) {
    //   // console.error(`[INSTA] - No se pudo abrir el perfil de ${request.username}.`);
    //   chrome.runtime.sendMessage({
    //     action: "userMessageNotAllowed",
    //     usernameMessageSent: request.username
    //   });
    //   //return; // Termina la ejecución si el perfil no se pudo abrir
    // }

    
    let isPrivateCheck = await checkIsPrivate();
    console.error(`[INSTA] Terminado verificacion privada - ${request.username}`);
    shouldFollowFollowers = request.shouldFollowFollowers;

    // check if the user already follows the user
    let userAlreadyFollows = await checkIfUserAlreadyFollows();
    if (userAlreadyFollows) {
      console.error(`[INSTA] - No se pudo enviar mensaje - el usuario ya sigue al usuario!!`);
      chrome.runtime.sendMessage({
        action: "userMessageNotAllowed",
        usernameMessageSent: request.username
      });
      return;
    }
    // console.error("[INSTA] Perfil abierto");

    // await new Promise(resolve => setTimeout(resolve, 2000));
    if (isPrivateCheck) {
      console.error(`[INSTA] - No se pudo enviar mensaje - es Privada!!'`);
      chrome.runtime.sendMessage({
          action: "isPrivateAccount",
          usernameMessageSent : request.username
       });
      return;
    }

    // if (!shouldFollowFollowers) {
    //   // also check if theres a story to send message in there!!
    //   let canSendMessageIfFollowProspects = checkSendMessageIsEnabled();
    //   if (!canSendMessageIfFollowProspects) {
    //     console.error(`[INSTA] - No se pudo enviar mensaje - boton de enviar mensaje no habilitado!!'`);
    //     chrome.runtime.sendMessage({
    //       action: "isPrivateAccount",
    //       usernameMessageSent : request.username
    //     });
    //     return;
    //   }
    // }



    let full_name = request.full_name;
    // if (request.isComments) {
    //   console.error(`[INSTA] Obteniendo nombre - ${request.username}`);
    //   // get title
    //   full_name = await getFullName();
    //   console.error(`[INSTA] Obtenido nombre - ${request.username}`);
    // }

    // check gender based on full_name
    // let gender = await checkGender(full_name);
    // console.error(`[INSTA] Género - ${gender}`);
    // if (request.providedGender !== "not_provided" && gender !== request.providedGender) {
    //   console.error(`[INSTA] - No se pudo enviar mensaje - Género desconocido!!'`);
    //   chrome.runtime.sendMessage({
    //     action: "userMessageNotAllowed",
    //     usernameMessageSent: request.username
    //   });
    //   return;
    // }

    if (full_name === undefined || full_name === "undefined") {
      full_name = "";
    }

    console.error(`[INSTA] Buscando en filtros - ${request.username}`);
    // if ((request.filters.length > 0 && request.filters[0] !== '') || (request.filtersExclude.length > 0 && request.filtersExclude[0] !== '')) {
    //   let res = doFiltersApply(request.filters, request.filtersExclude);
    //   if (!res) {
    //     console.error(`[INSTA] - No se pudo enviar mensaje - FILTROS!!'`);
    //     chrome.runtime.sendMessage({
    //         action: "userMessageNotAllowed",
    //         usernameMessageSent: request.username
    //     });
    //    return;
    //   }
    // }
    console.error(`[INSTA] Filtros sobrepasados - ${request.username}`);

    // here we should filter the prospect
    request.messageToSend = request.messageToSend.replaceAll("[NOMBRE]", full_name);
    RANDOM_MESSAGES_FOR_STORIES = [
      "Hola! [NOMBRE], cómo estás?",
      "Hey [NOMBRE], oye! te dejé un mensaje en tu perfil!",
      "Hola [NOMBRE]! ¿Qué tal tu día?",
      "Hey [NOMBRE]! Te escribí al DM 😊",
      "¡Hola [NOMBRE]! ¿Todo bien?",
      "¡Hey [NOMBRE]! Te mandé un mensaje directo",
      "¡Qué tal [NOMBRE]! ¿Cómo va todo?",
      "Hola [NOMBRE]! Te dejé un mensaje importante",
      "¡Hola [NOMBRE]! Espero que estés genial",
      "Hey [NOMBRE]! Te envié un DM, échale un vistazo",
      "¡Holaa [NOMBRE]! ¿Cómo te va?",
      "¡Hola [NOMBRE]! Te escribí por mensaje directo",
      "Hey [NOMBRE]! ¿Todo en orden?",
      "¡Hola [NOMBRE]! Te mandé un mensaje al DM",
      "¿Qué tal [NOMBRE]? ¿Cómo has estado?",
      "Hey [NOMBRE]! Te dejé un mensaje importante en DM",
      "¡Hola [NOMBRE]! ¿Qué tal tu semana?",
      "¡Hey [NOMBRE]! Te escribí al mensaje directo",
      "Hola [NOMBRE]! ¿Cómo te está yendo?",
      "¡Qué tal [NOMBRE]! Te mandé un DM",
      "Hey [NOMBRE]! ¿Todo marcha bien?",
      "¡Hola [NOMBRE]! Revisa tu bandeja de mensajes"
    ].map(message => message.replaceAll("[NOMBRE]", full_name));
    
    
    messagesLimit = request.messagesLimit;
    stopMessages = false;
    usernameSending = request.username;
    instaTabId = request.instaTabId;
    windowId = request.windowId;

    // console.error(`[INSTA] Verificando es privada - ${request.username}`);
    
    

    
    console.error(`[INSTA] - Empezando envio de mensaje'`);
    response.message = sendMessage(
      request.username,
      request.messageToSend
    )

    sendResponse(response);
  } else if (request.action === "loginInstagram") {
    
    loginInstagram(request.username, request.password, request.instaTabId, request.windowId);
  } else if (request.action === "logoutInstagram") {
    console.error(`[INSTAGRAM] - Enfocando Ventana!!'`);
    chrome.runtime.sendMessage({
        action: "focusWindow",
        windowId: request.windowId
      },
      function (response) {
        
      }
    );

    setTimeout(() => {
      logoutInstagram();
    //   setTimeout(() => {
    //     console.log("ENTRANDO AL LOGIN!!");
    //     loginInstagram(request.username, request.password, request.instaTabId);
    //   }, 10000);
    }, 5000);
  } else if (request.action === "removeCaptchas") {
    console.error(`[INSTAGRAM] - Enfocando Ventana!!'`);
    chrome.runtime.sendMessage({
        action: "focusWindow",
        windowId: request.windowId
      },
      function (response) {
        
      }
    );

    setTimeout(() => {
      checkDismissButton();
    //   setTimeout(() => {
    //     console.log("ENTRANDO AL LOGIN!!");
    //     loginInstagram(request.username, request.password, request.instaTabId);
    //   }, 10000);
    }, 5000);
  } else if (request.action === "couldSendMessage") {
    findBlockedMessageDivs();
  }

  // sendResponse(response);
  // return response.message === "true";
});
