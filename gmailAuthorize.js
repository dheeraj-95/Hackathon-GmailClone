let clientId = "384837060954-tignegqj2b5jos63abs8crqma12pjkng.apps.googleusercontent.com";
let apiKey = "AIzaSyD3SZ_hqSpRKuD0Io916-rt_k-OaZwOjZg";

let scopes = "https://mail.google.com/ https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.addons.current.action.compose https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.addons.current.message.action https://www.googleapis.com/auth/gmail.addons.current.message.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.addons.current.action.compose";

let data = [];

let loader = document.querySelector('.loader');
let myList = document.getElementById('my-mails-list');
let labels = document.getElementById('labels');

let TOEmail = document.getElementById("compose-to");
let EmailSubject = document.getElementById("compose-subject");
let EmailMsg = document.getElementById("compose-message");


function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({ scope: scopes })
        .then(function (res) { 
            console.log("Sign-in successful"); 
            
            alert(`Hello ${res.tt.gV}! Logged In Successfully.`); 
        },
            function (err) { console.error("Error signing in", err); });
}
function loadClient() {
    gapi.client.setApiKey(apiKey);
    return gapi.client.load("https://gmail.googleapis.com/$discovery/rest?version=v1")
        .then(function () {
            console.log("GAPI client loaded for API");
            // getMails.classList.remove('d-none');
            // getMails.classList.add('d-inline');
            executeMyFunc();
        },
            function (err) { console.error("Error loading GAPI client for API", err); });
}

async function executeMyFunc() {
    loader.classList.remove('d-none');

    try {
        let msgs = await gapi.client.gmail.users.messages.list({
            "userId": "gumudavellidheeraj@gmail.com",
            "includeSpamTrash": false,
            "maxResults": 30,
            "q": "category:social"
        });

        let msgResponse = JSON.parse(JSON.stringify(msgs.result.messages));
        // console.log(msgResponse);
        let resultArray = [];
        resultArray = msgResponse.map(obj => { return obj["id"] })

        for (let j = 0; j < resultArray.length; j++) {
            let res = await getMailObj(resultArray[j]);
            data.push(res);
        }
        // console.log(data);
        let uldata = document.querySelector('.pagination');
        
        if(data.length >= 10){
            let count =9; let start = 0;
            for(let i=0; i<3; i++,count+=9,start+=9){

                let lidata = document.createElement('li');
                lidata.classList.add('page-item');
                let aTag = document.createElement('a');
                aTag.setAttribute('href','#');
                aTag.classList.add('page-link', `id-${i+1}`);
                aTag.setAttribute('onclick',`addData(${i+start},${i+count})`);
                aTag.innerText= `${i+1}`;
                lidata.append(aTag);
                uldata.append(lidata);
            }
            addData(0,9);
            labels.classList.remove('d-none');
        }
        loader.classList.add('d-none');
        myList.classList.remove('d-none');
    } catch (e) {
        console.log('Error in Execute function', e);
    }
}

async function getMailObj(msgId) {
    let resultObj = { from: null, subject: null, snippet: null, time: null }
    try {

        let response = await gapi.client.gmail.users.messages.get({
            "userId": "gumudavellidheeraj@gmail.com",
            "id": msgId,
            "format": "full"
        });
        let mailDate = new Date(parseInt(response.result.internalDate)).toString().split(" ");
        
        if(new Date().getDay() > new Date(parseInt(response.result.internalDate)).getDay() ){
            mailDate = mailDate[1] + ' ' + mailDate[2];
            resultObj.time = mailDate;
        }else{
            let mailTime = new Date(parseInt(response.result.internalDate)).getHours() + ':' + new Date(parseInt(response.result.internalDate)).getMinutes();
            resultObj.time = mailTime;
        }

        resultObj.snippet = response.result.snippet;
        let data = JSON.parse(JSON.stringify(response.result.payload.headers));
        data.filter(item => {
            if (item["name"] === "Subject")
                resultObj.subject = item["value"];
            if (item["name"] === "From")
                resultObj.from = item["value"];
        });
        return resultObj;
    } catch (e) {
        console.log('Error in getMailObj Function', e);
    }
}

function sendEmail() {
    console.log('in send email func');
    sendMessage(
        {
            'To': TOEmail.value,
            'Subject': EmailSubject.value
        },
        EmailMsg.value,
    );
    
    return false;
}

function sendMessage(headers_obj, message, callback) {
    var email = '';

    for (var header in headers_obj)
        email += header += ": " + headers_obj[header] + "\r\n";
        email += "\r\n" + message;

    var sendRequest = gapi.client.gmail.users.messages.send({
        "userId": "gumudavellidheeraj@gmail.com",
        'resource': {
            'raw': window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_')
        }
    });
    console.log(sendRequest);
    return sendRequest.execute(callback);
}


let SendMail = document.getElementById("send-button")
// console.log(SendMail);
SendMail.addEventListener("click", function(){
    sendEmail();
    alert(`Email sent to ${TOEmail.value}`)
})

gapi.load("client:auth2", function () {
    gapi.auth2.init({ client_id: clientId });
});

var table=document.createElement('table');
table.setAttribute('class','table');
// table.classList.add('table-responsive');

var thead=document.createElement('thead');
thead.id='h-res';
var tbody=document.createElement('tbody');
tbody.id='b-res';

table.append(thead,tbody);

function addData(start,end) {
    // loader.classList.add('d-none');

    document.getElementById('h-res').innerHTML='';
    document.getElementById('b-res').innerHTML='';

    var row1=document.createElement('tr');
    var head1=document.createElement('th');
    head1.innerHTML='From';
    var head2=document.createElement('th');
    head2.innerHTML='Subject';
    var head3=document.createElement('th');
    head3.innerHTML='Time';

    thead.append(row1);
    row1.append(head1,head2,head3);

    for(let i=start;i<=end;i++) {
        
        let row=document.createElement('tr');
        let col1=document.createElement('td');
        col1.innerHTML=data[i].from;
        let col2=document.createElement('td');
        col2.innerHTML=data[i].subject;
        let col3=document.createElement('td');
        col3.innerHTML=data[i].time;
       
        row.append(col1,col2,col3);
        tbody.append(row);
    }
    
}
myList.append(table);


let search_input = document.querySelector("#search_input");

search_input.addEventListener("keyup", function(e){

    let filter, tr, td, i, txtValue;
    filter = search_input.value.toUpperCase();
    
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        // console.log(td);
        // console.log(tr[i]);
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
            }
        }       
    }
});