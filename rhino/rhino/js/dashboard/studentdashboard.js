studentData = {}

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
studentId = params.id;

$.get(
    `/api/student/get?id=${studentId}`,
    function (data, status) {
        if (status == 'success') {
            studentData = data.data
            studentData.tasks = [
                {
                    'title': 'Write math quiz at 1pm',
                    'id': 34123
                },
                {
                    'title': 'AI assignment',
                    'id': 34124
                },
                {
                    'title': 'Finish Module 3',
                    'id': 34125
                }
            ]
            homeWindow()
        }
    }
)

var currWindow = 0

//HOME
$('#home').on('click', () => {
    if (currWindow != 0) {
        currWindow = 0;
        homeWindow()
    }
})

const home = `
<div class="home">
            <div class="text" style="padding: 15px;">Students Portal</div>
            <div class="welcome-text">
                <a id="greeting-text"></a>
                <a id="name-text" style="color: var(--primary-color);"></a>
            </div>
            <a class="text"
                style="font-size: 2rem; margin:20px 0 0 20px;width: fit-content;  padding: 5px 15px 5px 15px; border-radius: 10px; background-color:var(--primary-color); color: white;">Tasks
                & reminders</a>
            <div id="tasks">
                <div class="box add">
                    <a style="color: white; width: 100%; padding: 10px 5px 0px 5px;">New Task</a>
                    <div style="transition: transform 0.2s ease-in-out;"><img src="/icons/plus.svg"
                            style="fill: black; width: 40px; height: 40px; margin-top: 10px;"></div>
                </div>
            </div>
            <div id="router">
                <div class="route-container"></div>
                <div class="route-container"></div>
                <div class="route-container"></div>
            </div>
        </div>
`

function homeWindow() {
    $('#window').html(home)
    greets = ['Hello', 'Hi', 'Greetings,', 'Welcome back,', 'Welcome,']
    $('#greeting-text').text(greets[Math.floor(Math.random() * 5)])
    $('#name-text').text(`${studentData.first_name}`)
    $('#profile-name').text(`${studentData.first_name} ${studentData.last_name}`)

    studentData.tasks.forEach((task, index) => {

        const taskItem = $(`<div class="box" task-id=${task.id}>${task.title}</div>`)
            .on('mousedown', (event) => {

                let x = event.clientX;

                // enable 'delete/finish task'
                $('.box.add > div').css({ 'transform': 'rotate(45deg)' })
                $('.box.add').css({ 'background-color': '#ff3131', 'box-shadow': '1px 1px 10px #ff3131' })
                $('.box.add > a').text('Remove task')

                $(window).on('mousemove', (event) => {

                    taskItem.css('left', `${parseInt(taskItem.css('left'), 10) + event.clientX - x}px`)
                    x = event.clientX

                }).on('mouseup', (event) => {

                    //clean up listeners
                    $(window).off('mousemove').off('mouseup')

                    //reset 'delete/finish task' to original
                    setTimeout(() => {
                        $('.box.add > div').css('transform', 'rotate(0deg)')
                        $('.box.add').css({ 'background-color': 'var(--primary-color)', 'box-shadow': '' })
                        $('.box.add > a').text('New task')
                    }, 200)
                    const rect = $('.box.add')[0].getBoundingClientRect()

                    console.log(1)

                    if (event.clientX - rect.x <= rect.width && event.clientX - rect.x > 0) {

                        taskItem.addClass('task-remove')
                        setTimeout(() => {
                            taskItem.remove()
                        }, 300)
                    }
                    else {
                        taskItem.animate({ left: '0px' })
                    }
                })
            })
        $('#tasks')
            .append(taskItem)
    });
}

//ASSIGNMENTS

//e-material

const material =
    `
<div class="material">
<a style="font-size: 50px; padding: 50px 0px 0px 10px; font-weight: 500;">e-material</a>
<div class="route-container" id="resource-list" style="width: 100%; display: flex; flex-direction: row; overflow-x: scroll; min-height:150px;">

</div>
</div>
`

$('#resources').on('click', () => {
    if (currWindow != 2) {
        currWindow = 2;
        resourceWindow()
    }
})

function resourceWindow() {
    $('#window').html(material)

    fetch('/api/student/resource/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "teacher_id": 2120347291
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            $('#resource-list').not(':first').remove();
            Object.keys(data.resources).forEach((resourceId) => {

                let resourceBox = $(`<div class="box" resource-id=${resourceId}>${data.resources[resourceId].name}</div>`)
                    .on('click', () => {
                        window.open(`/resource/resource?resourceId=${resourceId}`)
                    })

                $('#resource-list').append(resourceBox)

            })
        })
}

//grading

//tests

const quiz = `
<div class="quiz">
<div style="font-size: 40px; font-weight: 500;">Quizzes</div>
<div id="router" style="margin-top: 10px; margin-bottom: 20px; max-height: 300px; min-height: 300px;">
    <div class="route-container">
        <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Active</a>
    </div>
    <div class="route-container">
        <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Scheduled</a>

    </div>
    <div class="route-container">
        <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Graded</a>

    </div>
</div>
<div id="quiz-list">
</div>
</div>
`
$('#quiz').on('click', () => {
    if (currWindow != 4) {
        currWindow = 4;
        testWindow()
    }
})

function testWindow() {

    $('#window').html(quiz)

    fetch('/api/student/tests/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "teacher_id": 2120347291,
            "student_id": studentId
        }),
    })
        .then((response) => response.json())
        .then((data) => {

            Object.keys(data.tests).forEach((test_id) => {

                if(data.tests[test_id].status == 'active'){
                    let testBox = $(`<div class="box" test-id=${test_id}>${data.tests[test_id].name}</div>`)

                    .on('click', () => {
                        window.open(`/tests/test?test_id=${test_id}&student_id=${studentId}`)
                    })

                    $('#quiz-list').append(testBox)
                }
            })
        })
}


