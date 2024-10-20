const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
const teacher_id = params.id;

let teacher = {
}


$.get(
    `/api/teacher/get?id=${teacher_id}`,
    function (data, status) {
        if (status == 'success') {
            teacher = data.data
            teacher.tasks = [
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
            <div class="text" style="padding: 15px;">Teachers Portal</div>
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
    $('#name-text').text(`${teacher.first_name}`)
    $('#profile-name').text(`${teacher.first_name} ${teacher.last_name}`)
    teacher.tasks.forEach((task, index) => {

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
                        $('.box.add').css({ 'background-color': 'var(--theme-dark)', 'box-shadow': '' })
                        $('.box.add > a').text('New task')
                    }, 200)
                    const rect = $('.box.add')[0].getBoundingClientRect()

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
<a style="font-size: 50px; padding: 50px 0px 0px 10px; font-weight: 500; margin-top: 50px;">e-material</a>
<div class="route-container" id="resource-list" style="width: 100%; display: flex; flex-direction: row; overflow-x: scroll;">
    <div class="box add" id="new-resource">
        <a style="color: white; width: 100%; padding: 10px 5px 0px 5px;">New resource</a>
        <div style="transition: transform 0.2s ease-in-out;"><img src="/icons/plus.svg"
                style="fill: black; width: 40px; height: 40px; margin-top: 10px;"></div>
    </div>
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
    
    function reloadResourceList(){
        fetch('/api/resource/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "teacher_id": teacher_id
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                $('#resource-list').children().not(':first').remove();
                Object.keys(data.resources).forEach((resource_id) => {
    
                    let resourceBox = $(`
                            <div class="dropdown">
                                <div class="dropdown-content">
                                </div>
                            </div>
                            `)
                            .prepend($(`
                            <div class="box" resource-id=${resource_id}>
                                <a>${data.resources[resource_id].name}</a>
                            </div>
                            `).on('click', () => {
                                window.open(`/resource/create?resourceId=${resource_id}`)
                            })
                            )
    
                            if (data.resources[resource_id].status == 'active') {
                                resourceBox.find('.dropdown-content')
                                    //disable
                                    .append(
                                        $('<button>Deactivate</button>')
                                            .click(() => {
                                                $('#alert-title').text("Deactivate resource?")
                                                $('#alert-text').text('Once deactivaetd, it would not be viewed on the students dashboard and they can not view/access the resource anymore.')
                                                $('#alert-buttons div:nth-child(1)')
                                                    .text('Deactivate')
                                                    .click(() => {
                                                        fetch('/api/resource/disable', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                                "teacher_id": teacher_id,
                                                                "resource_id": resource_id
                                                            }),
                                                        })
                                                            .then((response) => response.json())
                                                            .then((data) => {
                                                                $("#alert-window").css('display', 'none')
                                                                reloadResourceList()
                                                            })
                                                    })
                                                $('#alert-buttons div:nth-child(2)')
                                                    .text('Cancel')
                                                    .click(() => {
                                                        $("#alert-window").css('display', 'none')
                                                    }
                                                    )
                                                $("#alert-window").css('display', 'block')
                                            })
                                    )
                            }
                            else {
                                resourceBox.find('.dropdown-content')
                                    //enable
                                    .append(
                                        $('<button>Activate</button>')
                                            .click(() => {
                                                $('#alert-title').text("Activate resource ?")
                                                $('#alert-text').text('Once activated, it can be viewed on the students dashboard and they can view the resource if not specifically meant to.')
                                                $('#alert-buttons div:nth-child(1)')
                                                    .text('Yes, enable')
                                                    .click(() => {
                                                        fetch('/api/resource/enable', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                                "teacher_id": teacher_id,
                                                                "resource_id": resource_id
                                                            }),
                                                        })
                                                            .then((response) => response.json())
                                                            .then((data) => {
                                                                console.log(data)
                                                                $("#alert-window").css('display', 'none')
                                                                reloadResourceList()
                                                            })
                                                    })
                                                $('#alert-buttons div:nth-child(2)')
                                                    .text('Cancel')
                                                    .click(() => {
                                                        $("#alert-window").css('display', 'none')
                                                    }
                                                    )
                                                $("#alert-window").css('display', 'block')
                                            })
                                    )
                            }
        
                            resourceBox.find('.dropdown-content')
                                //delete
                                .append(
                                    $('<button style="color:red">Delete</button>')
                                        .click(() => {
                                            $('#alert-title').text("Delete resource ?")
                                            $('#alert-text').text('Once deleted, its related content including audio files and content (except quizzes) would be taken off the servers.')
                                            $('#alert-buttons div:nth-child(1)')
                                                .text('Yes, delete')
                                                .click(() => {
                                                    fetch('/api/resource/delete', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                        },
                                                        body: JSON.stringify({
                                                            "teacher_id": teacher_id,
                                                            "resource_id": resource_id
                                                        }),
                                                    })
                                                        .then((response) => response.json())
                                                        .then((data) => {
                                                            reloadResourceList()
                                                            $("#alert-window").css('display', 'none')
                                                        })
                                                })
                                            $('#alert-buttons div:nth-child(2)')
                                                .text('Cancel')
                                                .click(() => {
                                                    $("#alert-window").css('display', 'none')
                                                }
                                                )
                                            $("#alert-window").css('display', 'block')
                                        })
                                )
    
                    $('#resource-list').append(resourceBox)
    
                })
            })
    }

    $('#window').html(material)
    reloadResourceList()

    $('#new-resource').on('click', () => {
        fetch('/api/resource/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "teacher_id": teacher_id
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(1)
                console.log(data)
                window.open(`/resource/create?resourceId=${data.resource_id}`)
                $('#resource-list').not(':first').remove();
                Object.keys(data.resources).forEach((resource_id) => {

                    let resourceBox = $(`<div class="box" resource-id=${resource_id}>${data.resources[resource_id].name}</div>`)
                        .on('click', () => {
                            window.open(`/resource/create?resourceId=${resource_id}`)
                        })
                    $('#resource-list').append(resourceBox)

                })
            })
    })
}

//grading

const grading =
    `
<div class="grading">
    <div style="font-size: 40px; font-weight: 500;">Grading</div>
    <div id="router" style="margin-top: 10px; margin-bottom: 20px; max-height: 300px; min-height: 300px;">
        <div class="route-container">
            <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Active</a>
            <div class="box-container" id="container-active">
                
            </div>
        </div>
        <div class="route-container">
            <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Scheduled</a>
        </div>
        <div class="route-container">
            <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Finished</a>
        </div>
    </div>
</div>
`
$('#grading').on('click', () => {
    if (currWindow != 3) {
        currWindow = 3;
        gradingWindow()
    }
})

function gradingWindow() {
    $('#window').html(grading)

    fetch('/api/tests/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "teacher_id": teacher_id
        }),
    })
        .then((response) => response.json())
        .then((data) => {

            Object.keys(data.tests).forEach((test_id) => {

                let testBox = $(`<div class="box test-box" test-id=${test_id}><a>${data.tests[test_id].name}<a></div>`)

                    .on('click', () => {
                        window.open(`/tests/grade?test_id=${test_id}`)
                    })

                $('#container-active').append(testBox)

            })
        })
}

//tests

const quiz = `
<div class="quiz">
    <div style="font-size: 40px; font-weight: 500;">Quizzes</div>
    <div id="router" style="margin-top: 10px; margin-bottom: 20px; max-height: 400px; min-height: 400px;">
        <div class="route-container">
            <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Active</a>
            <div id="quiz-active" class="wrap"></div>
        </div>
        <div class="route-container">
            <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Scheduled</a>
            <div id="quiz-scheduled" class="wrap"></div>
        </div>
        <div class="route-container">
            <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Finished</a>
            <div id="quiz-finished" class="wrap"></div>
        </div>
    </div>
    <div class="route-container">
        <div style="display:flex; flex-direction:row; justify-content:space-between; margin: 10px 0 10px 0">
            <a style="font-size: 1.5rem; font-weight: 400; padding: 0 0 0 10px;">Editing</a>
            <div class="search-container">
                <input type="text" class="search-bar" placeholder="Search quizzes">
            </div>
            <div></div>
        </div>    
        <div id="quiz-list">
            <div class="box add" id="quiz-add">
                <a style="color: white; width: 100%; padding: 10px 5px 0px 5px;">New Quiz</a>
                <div style="transition: transform 0.2s ease-in-out;">
                    <img src="/icons/plus.svg" style="fill: black; width: 40px; height: 40px; margin-top: 10px;">
                </div>
            </div>
        </div>
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

    function reloadQuizList() {

        fetch('/api/tests/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "teacher_id": teacher_id
            }),
        })
            .then((response) => response.json())
            .then((data) => {

                $('#quiz-list').children().not(':first').remove();
                $(`#quiz-active`).empty()
                $(`#quiz-scheduled`).empty()
                $(`#quiz-finished`).empty()
                $('#alert-buttons').children().off('click')


                Object.keys(data.tests).forEach((test_id) => {

                    let testBox = $(`
                        <div class="dropdown">
                            <div class="dropdown-content">
                            </div>
                        </div>
                        `)
                        .prepend($(`
                        <div class="box test-box" test-id=${test_id}>
                                <a>${data.tests[test_id].name}</a>
                        </div>
                        `).on('click', () => {
                            window.open(`/tests/create?test_id=${test_id}&teacher_id=${teacher_id}`)
                        })
                        )

                    if (data.tests[test_id].status == 'active') {
                        testBox.find('.dropdown-content')
                            //disable
                            .append(
                                $('<button>Disable</button>')
                                    .click(() => {
                                        $('#alert-title').text("Disable quiz ?")
                                        $('#alert-text').text('Once disabled, it would not be viewed on the students dashboard and they can not attempt the test anymore.')
                                        $('#alert-buttons div:nth-child(1)')
                                            .text('Yes, disable')
                                            .click(() => {
                                                fetch('/api/tests/disable', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        "teacher_id": teacher_id,
                                                        "test_id": test_id
                                                    }),
                                                })
                                                    .then((response) => response.json())
                                                    .then((data) => {
                                                        $("#alert-window").css('display', 'none')
                                                        reloadQuizList()
                                                    })
                                            })
                                        $('#alert-buttons div:nth-child(2)')
                                            .text('Cancel')
                                            .click(() => {
                                                $("#alert-window").css('display', 'none')
                                            }
                                            )
                                        $("#alert-window").css('display', 'block')
                                    })
                                    .prop(
                                        'disabled', data.tests[test_id].status != 'active'
                                    )
                            )
                    }
                    else {
                        testBox.find('.dropdown-content')
                            //enable
                            .append(
                                $('<button>Enable</button>')
                                    .click(() => {
                                        $('#alert-title').text("Enable quiz ?")
                                        $('#alert-text').text('Once enabled, it can be viewed on the students dashboard and they can attempt and view the test if not specifically meant to.')
                                        $('#alert-buttons div:nth-child(1)')
                                            .text('Yes, enable')
                                            .click(() => {
                                                fetch('/api/tests/enable', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        "teacher_id": teacher_id,
                                                        "test_id": test_id
                                                    }),
                                                })
                                                    .then((response) => response.json())
                                                    .then((data) => {
                                                        $("#alert-window").css('display', 'none')
                                                        reloadQuizList()
                                                    })
                                            })
                                        $('#alert-buttons div:nth-child(2)')
                                            .text('Cancel')
                                            .click(() => {
                                                $("#alert-window").css('display', 'none')
                                            }
                                            )
                                        $("#alert-window").css('display', 'block')
                                    })
                                    .prop(
                                        'disabled', data.tests[test_id].status == 'active'
                                    )
                            )
                    }

                    testBox.find('.dropdown-content')
                        //copy id
                        .append(
                            $('<button>Copy id</button>')
                                .click(() => {
                                    console.log('copied')
                                })
                        )
                        //delete
                        .append(
                            $('<button style="color:red">Delete</button>')
                                .click(() => {
                                    $('#alert-title').text("Delete quiz ?")
                                    $('#alert-text').text('Once deleted, its related content including audio files, answers and mark list would be taken off the servers.')
                                    $('#alert-buttons div:nth-child(1)')
                                        .text('Yes, delete')
                                        .click(() => {
                                            fetch('/api/tests/delete', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    "teacher_id": teacher_id,
                                                    "test_id": test_id
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    $("#alert-window").css('display', 'none')
                                                    reloadQuizList()
                                                })
                                        })
                                    $('#alert-buttons div:nth-child(2)')
                                        .text('Cancel')
                                        .click(() => {
                                            $("#alert-window").css('display', 'none')
                                        }
                                        )
                                    $("#alert-window").css('display', 'block')
                                })
                                .prop(
                                    'disabled', data.tests[test_id].status == 'active'
                                )
                        )

                    $('#quiz-list').append(testBox)

                    if (['active', 'finished'].includes(data.tests[test_id].status)) {
                        $(`#quiz-${data.tests[test_id].status}`).append(testBox)
                    }

                })

            })
    }


    $('#window').html(quiz)
    $('#quiz-add').on('click', () => {

        fetch('/api/tests/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "teacher_id": teacher_id
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                window.open(`/tests/create?test_id=${data.test_id}&teacher_id=${teacher_id}`)
                reloadQuizList()
            })
    })

    reloadQuizList()
}

