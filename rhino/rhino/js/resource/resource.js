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

var resourceData = {
    metadata:{
        
    },
    data:{
        
    }
}

$.get(
    `/api/resource/get?resourceId=${resourceId}`,
    (data, response) => {
        if (response = 'success') {
            resourceData = JSON.parse(data.resource)
            console.log(resourceData)
            Object.keys(resourceData.data).forEach((id) => {
                addContent(resourceData.data[id], false, id)
            })

            $('#title').text(`${resourceData.metadata.resource_name}`)
        }
    }
)

function addContent(element, position, id)
{
    if (element.type == 'text-heading') {

        let contentElement = $(`<div class="content-item" style="position: relative;" type=${element.type}></div>`)
            .append($(`<div class="text-heading">${element.text}</div>`))

        $('#content')
            .append(
                contentElement
            )
    }
    else if (element.type == 'text-paragraph') {


        let contentElement = $(`<div class="content-item" style="position: relative;" type=${element.type}></div>`)
            .append(
                $(`<div class="text-paragraph">${element.text}</div>`)
            )

        $('#content')
            .append(
                contentElement
            )
    }
    else if (element.type == 'video-youtube') {
        
        let contentElement = $(`<div class="content-item" style="position: relative;" type=${element.type} video-src="${element.id}"><div class="video-youtube">${youtubeIframe.replace('{src}', element.id).replace('{height}', '60vh')}</div></div>`)

        $('#content')
            .append(
                contentElement
            )
    }
    else if (element.type == 'quiz') {
        let contentElement = $(`<div class="content-item" style="position: relative; width:200px;" type=${element.type}></div>`)

        $('#content')
            .append(
                contentElement
                .append(
                    $(`<div class="quiz-button button" style="background-color:white; color:black;">Quiz</div>`)
                    .on('click',()=>{window.open(
                        `/tests/test?test_id=${element.id}`
                    )})
                )
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