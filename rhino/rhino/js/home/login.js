var studentID = 0;

document.getElementById("login").addEventListener("click", (event) => {
    (async ()=>{
        const response = await fetch("/api/student/login", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: 'meow@meow.com',
          password: '12345678'
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