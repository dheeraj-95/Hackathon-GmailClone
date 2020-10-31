let clientId = "384837060954-tignegqj2b5jos63abs8crqma12pjkng.apps.googleusercontent.com";
let apiKey = "AIzaSyD3SZ_hqSpRKuD0Io916-rt_k-OaZwOjZg";

let getMails = document.getElementById('my-col');

let scopes = "https://mail.google.com/ https://www.googleapis.com/auth/gmail.addons.current.message.action https://www.googleapis.com/auth/gmail.addons.current.message.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.addons.current.action.compose";

let data = [];

function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({ scope: scopes })
        .then(function (res) { console.log("Sign-in successful"); alert(`Hello ${res.tt.gV}! Logged In Successfully.`) },
            function (err) { console.error("Error signing in", err); });
}
function loadClient() {
    gapi.client.setApiKey(apiKey);
    return gapi.client.load("https://gmail.googleapis.com/$discovery/rest?version=v1")
        .then(function () {
            console.log("GAPI client loaded for API");
            getMails.classList.remove('d-none');
            getMails.classList.add('d-inline');
        },
            function (err) { console.error("Error loading GAPI client for API", err); });
}

async function execute() {
    myList.classList.remove('d-none');
    try {
        let msgs = await gapi.client.gmail.users.messages.list({
            "userId": "gumudavellidheeraj@gmail.com",
            "includeSpamTrash": false,
            "maxResults": 20,
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
        console.log(data);
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
gapi.load("client:auth2", function () {
    gapi.auth2.init({ client_id: clientId });
});

var nav=document.createElement('nav');
nav.setAttribute('class','navbar');

var ul=document.createElement('ul');
ul.setAttribute('class','pagination');

var table=document.createElement('table');
table.setAttribute('class','table');
table.classList.add('table-responsive');

var thead=document.createElement('thead');
thead.id='h-res';
var tbody=document.createElement('tbody');
tbody.id='b-res';

table.append(thead,tbody);

function addData(start,end) {
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
       
        tbody.append(row);
        row.append(col1,col2,col3);
    }
}

let myList = document.getElementById('my-mails-list');
myList.append(table);