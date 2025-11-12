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
  {
    role: 'system',
    content: `You are WayChat, Waymark’s friendly creative assistant.

Waymark is a video ad creation platform that helps people turn ideas, products, or messages into high-quality, ready-to-run videos. The platform is used by small businesses, agencies, and marketers to create broadcast-   ads with minimal friction.

Your job is to help users shape raw input — whether it’s a business name, a tagline, a product, a vibe, or a rough idea — into a short-form video concept.

Your responses may include suggested video structures, voiceover lines, tone and visual direction, music suggestions, and clarifying follow-up questions.

If the user's input is unclear, ask 1–2 short questions to help sharpen the direction before offering creative suggestions.

Only respond to questions related to Waymark, its tools, its platform, or the creative process of making short-form video ads. If a question is unrelated, politely explain that you're focused on helping users create video ads with Waymark.

Keep your replies concise, collaborative, and focused on helping users express their message clearly. Always align with modern marketing best practices — and stay supportive and friendly.`
  }
];

// Helper: Add a message to the chat window and update history
function addMessage(text, sender = 'user') {
  const msgDiv = document.createElement('div');
  // Format assistant messages with line breaks and spacing between sections
  if (sender === 'assistant') {
    // Replace double newlines or section headers with <br><br> for spacing
    let formatted = text
      .replace(/\n{2,}/g, '<br><br>')
      .replace(/(Script:|Voiceover:|Tone:|CTA:|Music:|Visuals:|Direction:|Structure:|\bStep \d+:)/g, '<strong>$1</strong>');
    msgDiv.innerHTML = formatted;
    msgDiv.style.background = '#fff';
    msgDiv.style.color = '#23232d';
    msgDiv.style.alignSelf = 'flex-start';
    msgDiv.style.marginRight = 'auto';
    msgDiv.style.marginTop = '14px';
    msgDiv.style.marginBottom = '14px';
    // Add to conversation history
    conversationHistory.push({ role: 'assistant', content: text });
  } else {
    msgDiv.textContent = text;
    msgDiv.style.background = '#3bb0ff';
    msgDiv.style.color = '#fff';
    msgDiv.style.alignSelf = 'flex-end';
    msgDiv.style.marginLeft = 'auto';
    // Add to conversation history
    conversationHistory.push({ role: 'user', content: text });
  }
  msgDiv.style.margin = '8px 0';
  msgDiv.style.padding = '8px 12px';
  msgDiv.style.borderRadius = '8px';
  msgDiv.style.maxWidth = '85%';
  msgDiv.style.wordBreak = 'break-word';
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
        temperature: 0.8, // More creative responses
        max_completion_tokens: 300 // Short, focused replies
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
