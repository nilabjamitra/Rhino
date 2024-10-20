const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
const test_id = params.test_id;

const studentTableBody = document.getElementById("student-table-body");

let students = [
    
];

fetch('/api/tests/grade/list', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        "test_id": test_id
    }),
})
    .then((response) => response.json())
    .then((data) => {

        students = data.data
        gradeTable()
        $('#grade-all').click(()=>{
            fetch('/api/tests/grade/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "test_id": test_id
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    fetch('/api/tests/grade/list', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "test_id": test_id
                        }),
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            students = data.data
                            gradeTable()
                        })
                })
        })
    })

function gradeTable(){
    $(studentTableBody).empty()
    for (var i = 0; i < students.length; i++) {
        var student = students[i];
        var row = document.createElement("tr");
    
        var nameCell = document.createElement("td");
        nameCell.innerHTML = `${student.first_name} ${student.last_name}`;
        row.appendChild(nameCell);
    
        var rollCell = document.createElement("td");
        rollCell.innerHTML = student.usn;
        row.appendChild(rollCell);
        
        if(student.score && student.score!=0){
            var marksCell = document.createElement("td");
            marksCell.innerHTML = student.score;
            row.appendChild(marksCell);
        }
        else{
            var marksCell = document.createElement("td");
            marksCell.innerHTML = "Not Graded";
            row.appendChild(marksCell);
        }
    
        var answersCell = $(`<td><div class="box" style="width:40px; height:40px; background: var(--theme-dark) url(/icons/external.png) no-repeat center; background-size: 50%;"><div></td>`)
            .click(() => {
                window.open(`/tests/view?test-id=${test_id}&student-id=${student.student_id}`)
            });
        $(row).append(answersCell);
    
        studentTableBody.appendChild(row);
    }
}
