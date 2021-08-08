const URL_API = Object.freeze({
    URL_MESSAGES: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages',
    URL_JOIN_ROOM: 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants'
})


function startRender(renderMessageTime=3000) {
    askUserName()

    renderMessages()
    setInterval(renderMessages, renderMessageTime)
}


function askUserName() {
    const userName = prompt('Qual o seu lindo nome?')
    // userName = '100H'

    // Promise para verificar usabilidade da mensagem
    axios.post(URL_API.URL_JOIN_ROOM, { name: userName })
    .then(() => {
        return true
    })
    .catch(() => {
        return askUserName()
    })
}


function renderMessages() {
    // Promise para carregar mensagens
    axios.get(URL_API.URL_MESSAGES)
    .then((messages) => {
        const mainElement = document.querySelector('main')
    
        if (haveNewMessage(mainElement, messages)) {
    
            loadMessages(mainElement, messages)
        }    
    })
}


function loadMessages(mainElement, messages) {
    clearMain(mainElement)

    for (const message of messages.data) {
        
        const messageElement = makeMessageElement(message)

        if (canRenderizeThisMessage(message, '100H')) {

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
    const lastTimeServer = [...messages.data].pop().time


    let lastTimeClient = oldMessageElement.querySelector('.time')
    lastTimeClient = ['(', lastTimeClient, ')'].join('')

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