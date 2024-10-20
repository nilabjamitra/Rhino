document.getElementById('login').addEventListener('click', (event)=>{
    (async ()=>{
        const response = await fetch("http://localhost:8080/teacher/register", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: document.getElementById('username').value,
          password:  document.getElementById('password').value
          })
        });
      
        response.json().then(data => {
          if(response.status === 200) {
            localStorage.setItem('userinfo', JSON.stringify(data));
            window.location.href = data['redirect'];
          }
          if(response.status === 202){
            console.log(response.status)
          }
        });
      })()
})