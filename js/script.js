const URL_API = Object.freeze({
    URL_MESSAGES: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages',
    URL_JOIN_ROOM: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants',
    URL_LOGGED_IN: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status'
})


function startRender(timeRenderMessage=3000, timeStayLoggedIn=5000) {
    const userName = askUserName()  // Tentei não usar uma variável global,
    // isso acarretou em um encadeamento dessa variável por 3 funções,
    // há algum jeito melhor?

    renderMessages(userName)
    setInterval(renderMessages, timeRenderMessage, userName)

    setInterval(stayLoggedIn, timeStayLoggedIn, userName)
}


function stayLoggedIn(userName) {
    // Promise para atualizar o status de conectividade do usuário
    axios.post(URL_API.URL_LOGGED_IN, { name: userName })
    .catch(() => {
        alert(`${ userName }, você desconectado(a)!\nPor favor, recarregue a página :)`)
        // console.log(error.response)
    })
}


function askUserName() {
    let userName = prompt('Qual o seu lindo nome?')
    // const userName = '100H'

    // Promise para verificar usabilidade da mensagem
    axios.post(URL_API.URL_JOIN_ROOM, { name: userName })
    .catch(() => {
        userName = askUserName()
    })
    return userName
}


function renderMessages(userName) {
    // console.log('render message:', userName)
    // Promise para carregar mensagens
    axios.get(URL_API.URL_MESSAGES)
    .then((messages) => {
        const mainElement = document.querySelector('main')
    
        if (haveNewMessage(mainElement, messages)) {
    
            loadMessages(mainElement, messages, userName)
        }    
    })
}


function loadMessages(mainElement, messages, userName) {
    clearMain(mainElement)

    for (const message of messages.data) {
        
        const messageElement = makeMessageElement(message)

        if (canRenderizeThisMessage(message, userName)) {

            addMessage(messageElement, mainElement)
        } else {
            // console.log(message)
            // TIRAR ESSE ELSE, VER SE ELE ESTÁ FUNCIONADO CORRETAMENTE ANTES
            // console.log(`não pode!, mensagem:`, message)
        }
    }

    const newMessageElement = mainElement.lastElementChild
    
    scrollToLastMessage(newMessageElement)
}


function makeMessageElement({ from, to, text, type, time }) {
    const messageElement = `<div class="msg-${ type }">
        <p>
            <span class="time">(${ time })</span> &ensp;<strong>${ from }</strong> para <strong>${ to }</strong>: ${ text }
        </p>
    </div>`
    
    return messageElement
}


function scrollToLastMessage(newMessageElement) {
    newMessageElement.scrollIntoView({ behavior: 'smooth' })
}


function addMessage(messageElement, mainElement) {
    mainElement.innerHTML += messageElement
}


function clearMain(mainElement) {
    mainElement.innerHTML = ''
}


function haveNewMessage(mainElement, messages) {
    const oldMessageElement = mainElement.lastElementChild
    if (oldMessageElement === null) return true  // Caso primeira vez carregado

    // Pegando o tempo da última mensagem enviada ao servidor
    let lastTimeServer = [...messages.data].pop().time


    let lastTimeClient = oldMessageElement.querySelector('.time').innerText
    lastTimeServer = ['(', lastTimeServer, ')'].join('')

    if (lastTimeServer !== lastTimeClient) return true
    return false
}


/**
 * Função para verificando se o usuário pode ver a mensagem (se não é privada ou se é privada e é para ele)
 * @param {object} message Uma das mensagens de dentro do servidor
 * @param {string} userName Nome do usuário
 * @returns Booleano com a verificação
 */
function canRenderizeThisMessage(message, userName) {
    const {to, type} = message

    if (type === 'private_message') {

        if (to === userName) return true
        return false
    }
    return true
}


window.onload = startRender()