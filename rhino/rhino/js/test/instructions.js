//get test metadata from server save it locally [server]
test_metadata = 
{'test_name':"Communication skills test",
'test_author':"Lavnish",
'publish_date':"",
'types':{'listening':['www.google.com','www.google.com'],
          'speaking':['www.google.com'], 
          'writing':['www.google.com'],
          'reading':['www.google.com']}}
localStorage.setItem('testMetadata', JSON.stringify(test_metadata));


test_metadata =  JSON.parse(localStorage.getItem('testMetadata'));

document.getElementById("test-name").textContent = test_metadata.test_name
document.getElementById("test-author").textContent = 'Test author: ' + test_metadata.test_author

Object.keys(test_metadata.types).forEach(type =>{
  const typeEle = document.createElement('div')
  typeEle.setAttribute('type', type)
  typeEle.classList.add('test-type')
  const img = document.createElement('img')
  img.src = "../../icons/"+type+".png"
  typeEle.appendChild(img)
  const text = document.createElement('b')
  text.textContent = type.charAt(0).toUpperCase() + type.slice(1) + " Test"
  typeEle.appendChild(text)

  typeEle.addEventListener('click', (event) => {
    document.getElementById('test-type-screen').style.display = "none"
    document.getElementById('test-levels').style.display = "flex"
    document.getElementById('test-type-levels').innerHTML = '';
    for(let i = 0; i < test_metadata.types[event.currentTarget.getAttribute('type')].length; i++){
      let level_button = document.createElement('div')
      level_button.classList.add('test-type')
      level_button.textContent = 'Level ' + (i + 1)
      level_button.addEventListener('click', (event) => {

        //tell [server] to load test

      })
      document.getElementById('test-type-levels').appendChild(level_button)
    }
  })

  document.querySelector('.test-types').appendChild(typeEle)
})

document.getElementById('back-home').addEventListener('click', (event) => {
    //[server] go home
});

document.getElementById('level-back-button').addEventListener('click', (event) => {
  document.getElementById('test-type-screen').style.display = "flex"
  document.getElementById('test-levels').style.display = "none"
})