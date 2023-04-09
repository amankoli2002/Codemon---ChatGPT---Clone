import bot from './assets/Bot.png'
import user from './assets/User.png'

const form = document.querySelector('form')
const chatContainer = document.querySelector("#chat_container")
const stopResponce = document.querySelector(".btn")


let loadInterval


// Loading while fetching the content
function loader(element){
  element.textContent = ""
  stopResponce.classList.remove("hidden")
  loadInterval = setInterval(()=>{
    element.textContent += "."

    if(element.textContent === "...."){
      element.textContent = ""
    }
  }, 300)
}



// Typing text by bot after fetching the data
function typeText(element , text){
  let index = 0

  let interval = setInterval(()=>{
    if(index < text.length){
      element.innerHTML += text.charAt(index)
      index++
    } else {
      stopResponce.classList.add("hidden")
      clearInterval(interval)
    }
    stopResponce.addEventListener("click" , () => {
      stopResponce.classList.add("hidden")
      clearInterval(interval)
    })
  },30)
}

function generateUniqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}


function chatStripe (isAi , value , uniqueId) {
  return (
    `
      <div class="wrapper ${isAi ? 'ai' : ''}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id="${uniqueId}">${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  form.reset()

  //bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " " , uniqueId)

  chatContainer.scrollTop = chatContainer.scrollHeight

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  // fetch data from server ->  bot's response

  try {
    const responce  = await fetch("https://codemon-chatgpt-clone-bxrh.onrender.com/",{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body : JSON.stringify({
        prompt: data.get('prompt')
      })
    })

    console.log(responce);

    clearInterval(loadInterval)
    messageDiv.innerHTML = ''

    if(responce.ok){
      const data = await responce.json()
      const parsedData = data.bot.trim()
      console.log(parsedData);
      typeText(messageDiv, parsedData)
    } else {
      const err = await responce.text()
      messageDiv.innerHTML = "Something went wrong"
      alert(err)
    }
  } catch(error) {
    console.error("An error occurred while fetching the response:", error)
    messageDiv.innerHTML = "Something went wrong"
    alert(error.message)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener("keyup", (e) => {
  if(e.keyCode === 13){
    handleSubmit(e) 
  }
})



