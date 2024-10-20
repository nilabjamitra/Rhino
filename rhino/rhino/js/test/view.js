let outputQuestions = {
    metadata:{
        test_name:'',
        publish_date:'',
        test_duration:'',
        test_passing:'',
        professor_ID:'',
        test_ID:'',
        level_info:'',
        test_info:'',
        description:''
    },
    questions:[]
}

let outputAnswers = {}

const url = new URLSearchParams(window.location.search)
const test_id = url.get('test-id')
const student_id = url.get('student-id')

// fetch(

// )

$.get(
    `/api/student/answers/get`,
    {
        'test_id':test_id
    },
    (data, response)=>{
        outputQuestions = data.questions
        outputAnswers = data.answers

        if(outputQuestions.questions.length<1){
            addQuestion(0)
            return
        }

        console.log(data)

        outputQuestions.questions.forEach((questionData, index)=>{
            addQuestion(index, exists=true)
            getQuestion(questionData.id)
        })

        $('#test-name').val(outputQuestions.metadata.test_name )
        $('#test-duration').val(outputQuestions.metadata.test_duration)
        $('#test-passing').val(outputQuestions.metadata.test_passing)
        $('#test-description').val(outputQuestions.metadata.description)
    }
)

//allow resize
function addResize(element, direction, side, displacement, mul){

    let old, size;

    $(element).prepend(`<div class='arrow'></div>`)
    $(`${element}>.arrow`)
    .css('transform', `rotate(${(direction-2)*90}deg)`)
    .css(side, displacement)
    .mousedown((event)=>{
        old = event.clientX
        delta = 0;
        size = parseInt($(element).css('width'),10)

        $(window).mousemove((event)=>{
            delta = (old - event.clientX)*mul
            size += delta
            $(element).css('width', `${size}px`)
            old = event.clientX
            $('.choice-textarea').each((index,textarea)=>{
                textarea.style.height = ""; /* Reset the height*/
                textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
            })
        })
    })
    $(window).mouseup(()=>{
        $(window).off('mousemove')
    })
}

addResize('#content>.left', 1, 'left', '100%', -1)

//text area resize
$('.choice-textarea').each((index,textarea)=>{
    textarea.addEventListener('input',()=>{
        textarea.style.height = ""; /* Reset the height*/
        textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    })
})

$('.choice-textarea').each((index,textarea)=>{
    textarea.style.height = ""; /* Reset the height*/
    textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
})

// '+' add question button
$('#question-add-button').on('click',(event)=>{
    saveQuestion()
    addQuestion(outputQuestions.questions.length, exists = false);
    buttonState(outputQuestions.questions.length)
})

//answer selection
$('.choice-options > .option').each((index, button)=>{
    button.addEventListener('click',(event)=>{
        $('.choice-options > .option').each((_, button)=>{
            button.classList.toggle('option-correct', false)
            button.classList.toggle('button-enabled', true)
            button.textContent = "Select as answer"
        })
        button.classList.toggle('option-correct', true)
        button.classList.toggle('button-enabled', false)
        button.textContent = "Selected as answer"

        $('#question-content').attr('answer-id', event.target.getAttribute('option'))

    })
})

//select question type
$('#question-type-select').on('change',(event)=>{
    $('#question-content').attr('question-type', event.target.value)
    if(event.target.value=='listening'){
        $('#audio-type').css('display','flex')
    }
    else{
        $('#audio-type').css('display','none')
    }
})

//select answer type
$('#answer-type-select').on('change',(event)=>{
    $('#question-content').attr('answer-type', event.target.value)
    if(event.target.value=='writing'){
        $('#choices').css('display','none')
    }
    else{
        $('#choices').css('display','initial')

        //restore if user switches back from writing-->choice
        $('.choice-textarea').each((i, element)=>{
            element.value = outputQuestions.questions[parseInt($('#question-content').attr('question-id'))].choices[i]
        })
    }
})

//add question to dictionary
function addQuestion(index, exists){

    const questionType = $('#question-type-select').val()
    const answerType = $('#answer-type-select').val()
    const questionId = (index).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping:false})

    $(`<div class="question-num-icon" question-id=${questionId}>${index+1}</div>`)
    .insertBefore('#question-add-button')
    .click('click', (event)=>{

        //save question, then reset form
        saveQuestion()
        $('#question-text').val("");
        $('.choice-textarea').val("");

        getQuestion(event.target.getAttribute('question-id'))

        buttonState(parseInt(event.target.getAttribute('question-id'))+1)
    })

    $('#question-text').val("");
    $('.choice-textarea').val("");

    //if question is not generated from previous input
    if(!exists){
        outputQuestions.questions.push({
            "id": questionId,
            "question": null,
            "questionType":questionType,
            "answerType":answerType,
            "choices":['','','','']
        })

        outputAnswers[questionId] = 0

        getQuestion(questionId)
    }
}

//set form
function getQuestion(questionId){

    const index = parseInt(questionId)
    const questionData = outputQuestions.questions[index]
    const answerType = questionData.answerType
    const questionType = questionData.questionType

    $('#question-text').val(questionData.question);
    $('#question-content').attr("question-id", questionId);
    $('#question-type-select').val(questionData.questionType).change()
    $('#answer-type-select').val(answerType).change()

    $($('.option')[outputAnswers[questionId]]).trigger('click').change()
    $('.choice')[outputAnswers[questionId]].scrollIntoView({behavious:"smooth"})

    if(answerType=='choice'){
        $('.choice-textarea').each((i, element)=>{
            element.value = questionData.choices[i]
        })
    }

    if(questionType == 'listening'){
        $('#audio-input').src = outputQuestions.questions[index].audiosrc ? new Audio(outputQuestions.questions[index].audiosrc) : audio_files[questionId]
    }
}

//save question to dictionary
function saveQuestion(){
    const index = parseInt($('#question-content').attr('question-id'))
    const questionType = $('#question-content').attr('question-type')
    const answerType = $('#question-content').attr('answer-type')
    console.log(index)
    outputQuestions.questions[index].question=$('#question-text').val()
    outputQuestions.questions[index]['questionType']= questionType
    outputQuestions.questions[index]['answerType']= answerType
    outputAnswers[$('#question-content').attr('question-id')] = $('#question-content').attr('answer-id')

    if(answerType=='choice'){
        outputQuestions.questions[index].choices = []

        $('.choice-textarea').each((_, element)=>{
            outputQuestions.questions[index].choices.push(element.value)
        })
    }

    if(questionType=='listening'){
        outputQuestions.questions[index].audiosrc = document.getElementById("audio-input").files[0]
        addFile(document.getElementById("audio-input").files[0],$('#question-content').attr('question-id'))
    }

    return index+1
}

audio_files = {}

//audio files, upload to server in the end [TODO]
document.getElementById("audio-input").addEventListener("change", (event) => {
    const audio = event.target.files[0]
    addFile(audio, $('#question-content').attr('question-id'))
    document.getElementById('audio-output').src = URL.createObjectURL(audio)
})

//add audio files
function addFile(audio, questionId){
    //[TODO] group same audio into one audio=>[001,002,003]
    audio_files[questionId] = audio
}

//next question button
$('#next-button').click((event)=>{
    saveQuestion()
    nextIndex = parseInt($('#question-content').attr('question-id')) + 1
    if(nextIndex>=outputQuestions.questions.length){
        buttonState(nextIndex)
        addQuestion(nextIndex, exists = false)
    }
    else{
        getQuestion((nextIndex).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping:false}))
        buttonState(nextIndex + 1)
    }
})

//previous question button
$('#prev-button').click((event)=>{
    nextIndex = parseInt($('#question-content').attr('question-id'))

    if(nextIndex <= 0){
        return
    } 
    buttonState(nextIndex)
    if(nextIndex == 1){
        $('#prev-button').toggleClass('button-enabled', false)
    }
    getQuestion((nextIndex - 1).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping:false}))
})

//set same as previous button
$('#load-previous').click((event)=>{
    $('#question-text').val(outputQuestions.questions[parseInt($('#question-content').attr('question-id')) - 1].question)
})

//save button
$('#save-button').click((event)=>{

    saveQuestion()

    let negative = []
    let problems = []

    outputQuestions.questions.forEach((question)=>{

        if(!question.question){
            negative.push(parseInt(question.id))
            problems.push(`Question not filled for Q.${parseInt(question.id)+1}`)
        }
        else{
            if(question.answerType == 'choice'){
                question.choices.forEach((choice)=>{
                    if(!choice){
                        negative.push(parseInt(question.id))
                        problems.push(`Choice not filled in Q.${parseInt(question.id)+1}`)
                        return
                    }
                })
            }
            if(question.questionType == 'listening'){
                if(!Object.keys(audio_files).includes(question.id)){
                    negative.push(parseInt(question.id))
                    problems.push(`No audio files uploaded for Q.${parseInt(question.id)+1}`)
                    return
                }
            }
        }
    })
    
    if(negative.length!=0){

        questionList = $('.question-num-icon')

        negative.forEach(index=>{
            setTimeout(()=>{questionList[index].classList.add('alert-red')}, 2000)
            setTimeout(()=>{questionList[index].classList.remove('alert-red')}, 7000)
        })

        alertWindow('A few of your questions seem to have incomplete questions/choices. Please refer to the blinking numbers to view more.', problems)
        return
    }

    $('#content').css('display','none')
    $('#metadata-content').css('display','flex')

})

$('#back-button').on('click',()=>{
    $('#metadata-content').css('display','none')
    $('#content').css('display','flex')
    
})

$('#save-button-final').on('click',()=>{

    outputQuestions.metadata.test_name = $('#test-name').val()
    outputQuestions.metadata.test_duration = $('#test-duration').val()
    outputQuestions.metadata.test_passing = $('#test-passing').val()
    outputQuestions.metadata.description = $('#test-description').val()

    for(var i = 0; i<outputQuestions.questions.length; i++){
        if(outputQuestions.questions[i].questionType == 'listening'){
            outputQuestions.questions[i].audiosrc = `/tests/audio/${test_ID}-${outputQuestions.questions[i].id}`
        }
    }

    fetch('/api/tests/save', {
        method : 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            'questions':outputQuestions,
            'answers':outputAnswers,
            'testId':test_ID,
            'testName':outputQuestions.metadata.test_name
        }),
    })

    Object.keys(audio_files).forEach((questionId)=>{
        const formData = new FormData()
        formData.append('name',`${test_ID}-${questionId}`)
        formData.append('file',audio_files[questionId])
        fetch('/api/tests/audio/upload', {
            method : 'POST',
            body:formData,
        })
    })
})

$('#home-button').on('click',()=>{
    
    //alert about save

    window.close('','_parent','')
    
})

//sets button states
function buttonState(index){

    if(outputQuestions.questions.length - index == 0){
        delay(200).then(()=>{
            $('#next-button').text("Add question")
        })
        $('#next-button').css('width', "150px")
    }
    else{
        $('#next-button').text("Next")
        $('#next-button').css('width', "100px")
    }

    if(index == 1){
        $('#prev-button').toggleClass('button-enabled', false)
        $('#load-previous').toggleClass('button-enabled', false)
    }
    else{
        $('#prev-button').toggleClass('button-enabled', true)
        $('#load-previous').toggleClass('button-enabled', true)
    }
}

//window alert
function alertWindow(prompt, problems){
    $('#alert-text').append(`${prompt}<br>`)
    problems.forEach(problemText=>{
        $('#alert-text').append(`<br>${problemText}`)
    })
    $('#alert-window').addClass('alert-anim')
    setTimeout(()=>{$('#alert-window').removeClass('alert-anim')}, 7000)
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));