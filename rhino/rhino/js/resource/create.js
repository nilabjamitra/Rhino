const resourceId = new URLSearchParams(window.location.search).get('resourceId')

const youtubeIframe = `
<iframe width="100%" height="600px" src="https://www.youtube.com/embed/{src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
`

const add = `<div id="content-add" style="width: 40px; height: 40px; position: absolute; left:50%; border-radius: 5px; background: var(--theme-medium) url(/icons/plus.svg) no-repeat center; background-size: 50%; cursor:pointer;"></div>`
const del = `<div id="content-remove" style="width: 40px; height: 40px; position: absolute; left:calc(50% + 50px); border-radius: 5px; background: var(--theme-medium) url(/icons/trash.png) no-repeat center; background-size: 50%; cursor:pointer;"></div>`
const edit = `<div id="content-edit" style="width: 40px; height: 40px; position: absolute; left:calc(50% + 100px); border-radius: 5px; background: var(--theme-medium) url(/icons/edit.png) no-repeat center; background-size: 50%; cursor:pointer;"></div>`
const type = `<div class="content-select" style="right:0px">
<div id="type-select-background"></div>
<div class="select-type" id="type-heading">Heading</div>
<div class="select-type" id="type-para">Paragraph</div>
<div class="select-type" id="type-video">Video</div>
</div>`

const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;

var resourceData = {
    metadata:{
        
    },
    data:{
        
    }
}

let teacher_id;

$.get(
    `/api/resource/get?resourceId=${resourceId}`,
    (data, response) => {
        if (response = 'success') {
            resourceData = JSON.parse(data.resource)
            teacher_id = resourceData.metadata.teacher_id
            Object.keys(resourceData.data).forEach((id) => {
                addContent(resourceData.data[id], false, id)
            })

            $('#title').text(`${resourceData.metadata.resource_name}`)

            $('#save').on('click', ()=>{

                resourceData.metadata.resource_name = $('#title').text()

                resourceData.data = {}
                $('#content').children().each((index, element)=>{
                    if($(element).attr('type') == 'text-heading'){
                        resourceData.data[('000' + index).slice(-3)] = {
                            'type':'text-heading',
                            'text': $(element).children('.text-heading').text()
                        }
                    }
                    else if($(element).attr('type') == 'text-paragraph'){
                        resourceData.data[('000' + index).slice(-3)] = {
                            'type':'text-paragraph',
                            'text': $(element).children('.text-paragraph').text()
                        }
                    }
                    else if($(element).attr('type') == 'video-youtube'){
                        resourceData.data[('000' + index).slice(-3)] = {
                            'type':'video-youtube',
                            'id': $(element).attr('video-src')
                        }
                    }
                    else if($(element).attr('type') == 'quiz'){
                        $(element).attr('quiz-src', $(element).children('input').val())
                        resourceData.data[('000' + index).slice(-3)] = {
                            'type':'quiz',
                            'id': $(element).attr('quiz-src')
                        }
                    }
                })
                fetch('/api/resource/save', {
                    method : 'POST',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify({
                        'resourceId':resourceId,
                        'teacher_id':teacher_id,
                        'resourceData':JSON.stringify(resourceData)
                    }),
                })
            })
        }
    }
)

function addContent(element, position, id)
{
    if (element.type == 'text-heading') {

        let contentElement = $(`<div class="content-item" style="position: relative;" type=${element.type}></div>`)
            .hover(
                (e) => {
                    $(contentElement).prepend('<div id=edit></div>')
                    $('#edit').append(
                        $(del).click(()=>{
                            contentElement.remove()
                        })
                    ).append(
                        $(add).click(()=>{
                            addContent({'type':'text-paragraph', 'text':'add text here'}, contentElement)
                        })
                    )
                    $('#type-heading').addClass('selected')

                },
                (e) => {
                    $('#edit').remove()
                })
            .append($(`<div class="text-heading" contenteditable="true">${element.text}</div>`))

        if(position){
            contentElement.insertAfter(position)
            return
        }
        $('#content')
            .append(
                contentElement
            )
    }
    else if (element.type == 'text-paragraph') {


        let contentElement = $(`<div class="content-item" style="position: relative;" type=${element.type}></div>`)
            .hover(
                (e) => {
                    $(contentElement).prepend(`<div id=edit></div>`)
                    $('#edit').append(
                        $(del).click(()=>{
                            contentElement.remove()
                        })
                    ).append(
                        $(add).click(()=>{
                            addContent({'type':'video-youtube', 'id':''}, contentElement)
                        })
                    )
                    $('#type-para').addClass('selected')
                },
                (e) => {
                    $('#edit').remove()
                })
            .append(
                $(`<div class="text-paragraph" contenteditable="true">${element.text}</div>`)
            )
        
        if(position){
            contentElement.insertAfter(position)
            return
        }
        $('#content')
            .append(
                contentElement
            )
    }
    else if (element.type == 'video-youtube') {
        
        let contentElement = $(`<div class="content-item" style="position: relative;" type=${element.type} video-src="${element.id}"><div class="video-youtube">${youtubeIframe.replace('{src}', element.id).replace('{height}', '60vh')}</div></div>`)
            .hover(
                (e) => {
                    $(contentElement).prepend(`<div id=edit></div>`)

                    $('#edit')
                    .append(
                        $(del).click(()=>{
                            contentElement.remove()
                        })
                    ).append(
                        $(add).click(()=>{
                            addContent({'type':'text-heading', 'text':'add heading here'}, contentElement)
                        })
                    )
                },
                (e) => {
                    $('#edit').remove()
                })
            .append(
                $(`<input type="text" class="text-paragraph" style="padding: 3px 5px 3px 5px; width: 450px">`)
                .val(`https://www.youtube.com/embed/${element.id}`)
                .on('change', (e)=>{
                    var match = $(e.target).val().match(regExp);
                    const src = (match&&match[7].length==11)? match[7] : false;
                    if(src){
                        contentElement
                        .attr('video-src', src)
                        .children('.video-youtube').replaceWith(`<div class="video-youtube">${youtubeIframe.replace('{src}', src).replace('{height}', '60vh')}</div>`)
                    }
                })
            )

        if(position){
            contentElement.insertAfter(position)
            return
        }
        $('#content')
            .append(
                contentElement
            )
    }
    else if (element.type == 'quiz') {
        let contentElement = $(`<div class="content-item" style="position: relative; width:200px;" type=${element.type}><div class="quiz-button button" style="background-color:white; color:black;">Quiz</div></div>`)
            .hover(
                (e) => {
                    $(contentElement).prepend(`<div id=edit></div>`)

                    $('#edit')
                    .append(
                        $(del).click(()=>{
                            contentElement.remove()
                        })
                    ).append(
                        // $(add).click(()=>{
                        //     addContent({'type':'text-paragraph', 'text':'add text here'}, contentElement)
                        // })
                    )
                },
                (e) => {
                    $('#edit').remove()
                })
            .append(
                $(`<input type="text" class="text-paragraph" style="padding: 3px 5px 3px 5px; margin: 5px 0 0 40px; width: 130px">`)
                .val(`${element.id}`)
                .on('change', (e)=>{
                    // var match = $(e.target).val().match(regExp);
                    // const src = (match&&match[7].length==11)? match[7] : false;
                    // if(src){
                    //     contentElement.children('.video-youtube').replaceWith(`<div class="video-youtube">${youtubeIframe.replace('{src}', src).replace('{height}', '60vh')}</div>`)
                    //     resourceData.data[id].id = src
                    // }

                    contentElement.attr('quiz-src', $(e.target).val())
                })
            )

        if(position){
            contentElement.insertAfter(position)
            return
        }
        $('#content')
            .append(
                contentElement
            )
    }
}

// $.get(
//     `/api/resource/get?resourceId=${resourceId}`,
//     (data, response)=>{
//         if(response = 'success'){
//             content = JSON.parse(data.resource)
//             content.data.forEach((element)=>{
//                 if(element.type == 'text-heading'){
//                     $('#content').append(`<a class="text-heading">${element.text}</a>`)
//                 }
//                 else if(element.type == 'text-paragraph'){
//                     $('#content').append(`<p class="text-paragraph">${element.text}</p>`)
//                 }
//                 else if(element.type == 'video-youtube'){
//                     $('#content').append(`<div class="video-youtube">${youtubeIframe.replace('{src}', element.id)}</div>`)
//                 }
//             })
//         }
//     }
// )