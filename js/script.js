//   X-o-x-o-x-o-x-o-x-o-x-o-x-o-x-o-x-X
//   |        Variáveis Globais        |
//   X-o-x-o-x-o-x-o-x-o-x-o-x-o-x-o-x-X

const URL_API = Object.freeze({
    URL_MESSAGES: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages',
    URL_JOIN_ROOM: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants',
    URL_LOGGED_IN: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status'
})

let userName = null



//   X-o-x-o-x-o-x-o-x-o-x-o-x-o-x-o-x-X
//   |    Renderização de Mensagens    |
//   X-o-x-o-x-o-x-o-x-o-x-o-x-o-x-o-x-X

function startRender(timeRenderMessage=3000, timeStayLoggedIn=5000) {
    userName = askUserName()

    renderMessages()
    setInterval(renderMessages, timeRenderMessage)

    setInterval(stayLoggedIn, timeStayLoggedIn)
}


function askUserName(promptMessage='Qual o seu lindo nome?') {
    userName = prompt(promptMessage)

    // Promise para verificar usabilidade do nome
    axios.post(URL_API.URL_JOIN_ROOM, { name: userName })
    .catch(invalidUserNameError)
    
    function invalidUserNameError() {
        // Tentei deixar a função do catch separada, porém ela precisava do argumento
        // userData, então o melhor jeito que pensei para fazer essa definição, foi definir aqui em sequência
        // isso é uma boa prática? Tem alguma maneira melhor de resolver esse problema?
        promptMessage = `Desculpe, o nome '${ userName }' não pode ser utilizado no momento.\nPor gentileza, escolha outro nome :D`
        userName = askUserName(promptMessage)
    }

    return userName
}


function renderMessages() {
    // Promise para carregar mensagens
    axios.get(URL_API.URL_MESSAGES)
    .then(acceptRenderMessages)
}


function acceptRenderMessages(messages) {
    const mainElement = document.querySelector('main')
    
        if (haveNewMessage(mainElement.lastElementChild, messages)) {
    
            loadMessages(mainElement, messages)
        }
}


function haveNewMessage(oldMessageElement, messages) {
    if (oldMessageElement === null) return true  // Caso primeira vez carregado

    // Pegando o tempo da última mensagem enviada ao servidor
    let lastTimeServer = [...messages.data].pop().time


    let lastTimeClient = oldMessageElement.querySelector('.time').innerText
    lastTimeServer = ['(', lastTimeServer, ')'].join('')

    if (lastTimeServer !== lastTimeClient) return true
    return false
}


function loadMessages(mainElement, messages) {
    clearMain(mainElement)

    for (const message of messages.data) {
        const messageElement = makeMessageElement(message)

        if (canRenderizeThisMessage(message, userName)) {

            addMessage(messageElement, mainElement)
        }
    }

    const newMessageElement = mainElement.lastElementChild
    
    scrollToLastMessage(newMessageElement)
}


function clearMain(mainElement) {
    mainElement.innerHTML = ''
}


function makeMessageElement({ from, to, text, type, time }) {
    const messageElement = `<div class="msg-${ type }">
        <p>
            <span class="time">(${ time })</span> &ensp;<strong>${ from }</strong> para <strong>${ to }</strong>: ${ text }
        </p>
    </div>`
    
    return messageElement
}


/**
 * Função para verificando se o usuário pode ver a mensagem (se não é privada ou se é privada e é para ele)
 * @param {object} message Uma das mensagens de dentro do servidor
 * @param {string} userName Nome do usuário
 * @returns Booleano com a verificação
 */
 function canRenderizeThisMessage({to, type}, userName) {

    if (type === 'private_message') {

        if (to === userName) return true
        return false
    }
    return true
}


function addMessage(messageElement, mainElement) {
    mainElement.innerHTML += messageElement
}


function scrollToLastMessage(newMessageElement) {
    newMessageElement.scrollIntoView({ behavior: 'smooth' })
}


function stayLoggedIn() {
    // Promise para atualizar o status de conectividade do usuário
    axios.post(URL_API.URL_LOGGED_IN, { name: userName })
    .catch(userDisconnection)
}


function userDisconnection() {
    alert(`${ userName }, você desconectado(a)!\nPor favor, recarregue a página :)`)
    window.location.reload()
}


//   X-o-x-o-x-o-x-o-x-o-x-o-x-o-x-o-x-X
//   |        Envio de Mensagens       |
//   X-o-x-o-x-o-x-o-x-o-x-o-x-o-x-o-x-X

function handleMessageSending() {
    const inputElement = document.querySelector('footer input')

    sendMessage(inputElement.value)

    changeInputText(inputElement)

    renderMessages()
}


function sendMessage(inputValue, to='Todos', type='message') {

    const userMessageData = {
        from: userName,
        to: to,  // "nome do destinatário (Todos se não for um específico)"
        text: inputValue,
        type: type // ou "private_message" para o bônus  
    }

    // Promise para fazer o envio da mensagem
    axios.post(URL_API.URL_MESSAGES, userMessageData)
    .catch(problemsToSendoMessage)
}


function problemsToSendoMessage() {
    alert('Problemas para o envio da mensagem, recarregue sua página!')
    window.location.reload()
}


/**
 * Caso não tenha parâmetro essa função limpará o conteúdo do input
 * @param {object} inputElement 
 * @param {string} value 
 */
 function changeInputText(inputElement=null, value='') {
    // Caso não tenha o elemento do input já escolhido
    if (inputElement === null) inputElement = document.querySelector('footer input')

    inputElement.value = value
}


function sendWithEnter(event) {
    if (event.key === 'Enter') handleMessageSending()
}



//   X-o-x-o-x-o-x-o-x-o-x-o-x-o-x-o-x-X
//   |         Uso da funções          |
//   X-o-x-o-x-o-x-o-x-o-x-o-x-o-x-o-x-X

window.onload = startRender()
