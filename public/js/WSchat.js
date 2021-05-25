(function WebSocketTest(){
        const sendBtn = document.querySelector('#send');
        const messages = document.querySelector('#messages');
        const messageBox = document.querySelector('#messageBox');
    
        let ws;
    
        function showMessage(message) {
          messages.textContent += `${message}\n\n`;
          messages.scrollTop = messages.scrollHeight;
          messageBox.value = '';
        }
    
        function init() {
          if (ws) {
            ws.onerror = ws.onopen = ws.onclose = null;
            ws.close();
          }
    
          ws = new WebSocket('ws://localhost:8000');
          ws.onopen = () => {
            console.log('Connection opened!');
          }
          ws.onmessage = ({ data }) => showMessage(data);
          ws.onclose = function() {
            ws = null;
          }
        }
    
        sendBtn.onclick = function() {
          if (!ws) {
            showMessage("No WebSocket connection :(");
            return ;
          }
    
          ws.send(messageBox.value);
          showMessage("You: " + messageBox.value);
        }
    
        init();
    
    })();

   
