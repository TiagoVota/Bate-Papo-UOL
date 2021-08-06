const URL_MESSAGES = 'https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages'


function loadMessages() {
    const mainElement = document.querySelector('main')
    const oldMessageElement = mainElement.lastElementChild

    axios.get(URL_MESSAGES)
    .then((messages) => {
        clearMain(mainElement)

        for (const message of messages.data) {
            
            const messageElement = makeMessageElement(message)
            addMessage(messageElement, mainElement)
        }

        const newMessageElement = mainElement.lastElementChild
        if (haveNewMessage(oldMessageElement, newMessageElement)) {
            // ESSA FUNÇÃO TEM QUE VIR PRIMEIRO, ESTOU RENDERIZANDO O DOM INTEIRO A TOA
            scrollToLastMessage(mainElement)
        }

    })
}


function makeMessageElement({ from, to, text, type, time }) {
    const messageElement = `<div class="msg-${ type }">
        <p>
            <span>(${ time })</span> &ensp;<strong>${ from }</strong> para <strong>${ to }</strong>: ${ text }
        </p>
    </div>
    `
    return messageElement
}


function scrollToLastMessage(mainElement) {
    mainElement.lastElementChild.scrollIntoView({ behavior: 'smooth' })
}


function addMessage(messageElement, mainElement) {
    mainElement.innerHTML += messageElement
}


function clearMain(mainElement) {
    mainElement.innerHTML = ''
}


function haveNewMessage(oldMessageElement, newMessageElement) {
    if (oldMessageElement === null) return true  // Caso primeira vez carregado

    const oldTime = oldMessageElement.querySelector('span').innerText
    const newTime = newMessageElement.querySelector('span').innerText

    if (oldTime !== newTime) return true
    return false
}

setInterval(loadMessages, 3000)