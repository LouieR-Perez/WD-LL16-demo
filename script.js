// Get chatbot elements
const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
const chatbotPanel = document.getElementById('chatbotPanel');

if (chatbotToggleBtn && chatbotPanel) {
  // Toggle chat open/closed when clicking the button
  chatbotToggleBtn.addEventListener('click', () => {
    chatbotPanel.classList.toggle('open');
  });

  // Close chat when clicking anywhere except the chat panel or button
  document.addEventListener('click', (e) => {
    // If chat is open AND user clicked outside chat area, close it
    if (chatbotPanel.classList.contains('open') && 
        !chatbotPanel.contains(e.target) && 
        !chatbotToggleBtn.contains(e.target)) {
      chatbotPanel.classList.remove('open');
    }
  });
}

// --- Chatbot logic ---
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSendBtn = document.getElementById('chatbotSendBtn');
const chatbotMessages = document.getElementById('chatbotMessages');

// Store conversation history for OpenAI API
const conversationHistory = [
  { role: 'system', content: 'You are a helpful assistant.' }
];

// Helper: Add a message to the chat window and update history
function addMessage(text, sender = 'user') {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = text;
  msgDiv.style.margin = '8px 0';
  msgDiv.style.padding = '8px 12px';
  msgDiv.style.borderRadius = '8px';
  msgDiv.style.maxWidth = '85%';
  msgDiv.style.wordBreak = 'break-word';
  if (sender === 'user') {
    msgDiv.style.background = '#3bb0ff';
    msgDiv.style.color = '#fff';
    msgDiv.style.alignSelf = 'flex-end';
    msgDiv.style.marginLeft = 'auto';
    // Add to conversation history
    conversationHistory.push({ role: 'user', content: text });
  } else {
    msgDiv.style.background = '#fff';
    msgDiv.style.color = '#23232d';
    msgDiv.style.alignSelf = 'flex-start';
    msgDiv.style.marginRight = 'auto';
    // Add to conversation history
    conversationHistory.push({ role: 'assistant', content: text });
  }
  chatbotMessages.appendChild(msgDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Send message to OpenAI API and display response
async function sendMessage() {
  const userInput = chatbotInput.value.trim();
  if (!userInput) return;
  addMessage(userInput, 'user');
  chatbotInput.value = '';

  // Show a loading message
  const loadingDiv = document.createElement('div');
  loadingDiv.textContent = 'Thinking...';
  loadingDiv.style.color = '#aaa';
  loadingDiv.style.margin = '8px 0';
  loadingDiv.style.alignSelf = 'flex-start';
  chatbotMessages.appendChild(loadingDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  try {
    // Call OpenAI API (gpt-4o) with full conversation history
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: conversationHistory,
        max_tokens: 200
      })
    });
    const data = await response.json();
    loadingDiv.remove();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      addMessage(data.choices[0].message.content, 'assistant');
    } else {
      addMessage('Sorry, I could not understand the response.', 'assistant');
    }
  } catch (err) {
    loadingDiv.remove();
    addMessage('Error: Could not reach OpenAI API.', 'assistant');
  }
}

// Send on button click
if (chatbotSendBtn && chatbotInput) {
  chatbotSendBtn.addEventListener('click', sendMessage);
  // Send on Enter key
  chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}
