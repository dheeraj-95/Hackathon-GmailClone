let clientId = "384837060954-tignegqj2b5jos63abs8crqma12pjkng.apps.googleusercontent.com";
let apiKey = "AIzaSyD3SZ_hqSpRKuD0Io916-rt_k-OaZwOjZg";

let getMails = document.getElementById('get-Mails');

let scopes = "https://mail.google.com/ https://www.googleapis.com/auth/gmail.addons.current.message.action https://www.googleapis.com/auth/gmail.addons.current.message.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.addons.current.action.compose";

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

        let resultMails = [];
        for (let j = 0; j < resultArray.length; j++) {
            let res = await getMailObj(resultArray[j]);
            resultMails.push(res);
        }
        console.log(resultMails);
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

