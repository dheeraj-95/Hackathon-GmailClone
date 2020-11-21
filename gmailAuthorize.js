let clientId = "384837060954-tignegqj2b5jos63abs8crqma12pjkng.apps.googleusercontent.com";
let apiKey = "AIzaSyD3SZ_hqSpRKuD0Io916-rt_k-OaZwOjZg";

let scopes = "https://mail.google.com/ https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.addons.current.action.compose https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.addons.current.message.action https://www.googleapis.com/auth/gmail.addons.current.message.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.addons.current.action.compose";

let data = [];
// var googleUser ;
// var profile;
let loader = document.querySelector('.loader');
let myList = document.getElementById('my-mails-list');
let labels = document.getElementById('labels');
let main = document.querySelector('.main');
let firstPage = document.querySelector('.firstPage');
let composeMail = document.querySelector('.header');
let Inbox = document.getElementById("inbox")

let TOEmail = document.getElementById("compose-to");
let EmailSubject = document.getElementById("compose-subject");
let EmailMsg = document.getElementById("compose-message");
let myTable = document.querySelector('.table-inbox');

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
  }
  function onFailure(error) {
    console.log(error);
  }
  function renderButton() {
    gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 200,
      'height': 40,
      'longtitle': true,
      'theme': 'dark',
      'onsuccess': onSuccess,
      'onfailure': onFailure
    });
}

    function authenticate() {
        return gapi.auth2.getAuthInstance()
            .signIn({ scope: scopes })
            .then(function (res) {
                console.log("Sign-in successful");
            },
                function (err) { console.error("Error signing in", err); });
    }
    function loadClient() {
        gapi.client.setApiKey(apiKey);
        return gapi.client.load("https://gmail.googleapis.com/$discovery/rest?version=v1")
            .then(function () {
                console.log("GAPI client loaded for API");
                executeMyFunc();
            },
                function (err) { console.error("Error loading GAPI client for API", err); });
    }

    async function executeMyFunc() {
        // console.log(user);
        firstPage.classList.add('d-none');
        loader.classList.remove('d-none');
        main.classList.remove('d-none');
        await gapi.client.gmail.users.messages.list({
            "userId": "gumudavellidheeraj@gmail.com",
            "includeSpamTrash": false,
            "maxResults": 30,
            "q": "category:social"
        })
            .then(async function(response) {
                    for(let i=0; i<response.result.messages.length; i++){
                        messageid = response.result.messages[i].id;
                        await getMailObj(messageid);
                        // data.push(res);

                    }
                    // loader.classList.add('d-none');

                },
            function(err) { console.error("Execute error", err); });

            loader.classList.add('d-none');
            myList.classList.remove('d-none');

    }

    async function getMailObj(msgId) {
        let resultObj = { from: null, subject: null, snippet: null, Date: null }
        try {

            let response = await gapi.client.gmail.users.messages.get({
                "userId": "gumudavellidheeraj@gmail.com",
                "id": msgId,
                "format": "full"
            });
            
            let mailDate = new Date(parseInt(response.result.internalDate)).toString().split(" ");

            // if (new Date().getDay() > new Date(parseInt(response.result.internalDate)).getDay()) {
                mailDate = mailDate[1] + ' ' + mailDate[2];
            //     resultObj.time = mailDate;
            // } else {
                // let mailTime = new Date(parseInt(response.result.internalDate)).getHours() + ':' + new Date(parseInt(response.result.internalDate)).getMinutes();
                resultObj.Date = mailDate;
            // }

            resultObj.snippet = response.result.snippet;
            let headersData = JSON.parse(JSON.stringify(response.result.payload.headers));
            headersData.filter(item => {
                if (item["name"] === "Subject")
                    resultObj.subject = item["value"];
                if (item["name"] === "From")
                    resultObj.from = item["value"];
            });
            data.push(resultObj);
            
            // let uldata = document.querySelector('.pagination');

            if (data.length >= 27) {
            //     let count = 9; let start = 0;
            //     for (let i = 0; i < 1; i++, count += 9, start += 9) {

            //         let lidata = document.createElement('li');
            //         lidata.classList.add('page-item');
            //         let aTag = document.createElement('a');
            //         aTag.setAttribute('href', '#');
            //         aTag.classList.add('page-link', `id-${i + 1}`);
            //         aTag.setAttribute('onclick', `addData(${i + start},${i + count},${response})`);
            //         aTag.innerText = `${i + 1}`;
            //         lidata.append(aTag);
            //         uldata.append(lidata);
            //     }
                // addData(0, 9);
                myTable.classList.remove('d-none');
                labels.classList.remove('d-none');
                composeMail.classList.remove('d-none');
            }
            addData(response);
            // return response;
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
    SendMail.addEventListener("click", function () {
        sendEmail();
        alert(`Email sent to ${TOEmail.value}`)
    })

    gapi.load("client:auth2", function () {
        gapi.auth2.init({ client_id: clientId });

    });

    // authenticate().then(loadClient)


    var table = document.createElement('table');
    table.setAttribute('class', 'table');
    // table.classList.add('table-responsive');

    var thead = document.createElement('thead');
    thead.id = 'h-res';
    var tbody = document.createElement('tbody');
    tbody.id = 'b-res';

    table.append(thead, tbody);

    function addData(message) {
        // loader.classList.add('d-none');

        // document.getElementById('h-res').innerHTML = '';
        // document.getElementById('b-res').innerHTML = '';

        // var row1 = document.createElement('tr');
        // var head1 = document.createElement('th');
        // head1.innerHTML = 'From';
        // var head2 = document.createElement('th');
        // head2.innerHTML = 'Subject';
        // var head3 = document.createElement('th');
        // head3.innerHTML = 'Date';

        // thead.append(row1);
        // row1.append(head1, head2, head3);

        // // for (let i = start; i <= end; i++) {
        // console.log(message);
        //     let row = document.createElement('tr');
        //     let col1 = document.createElement('td');
        //     // col1.innerHTML = data[i].from;
        //     col1.innerHTML = `${getHeader(message["result"]["payload"]["headers"], 'From')}`;
        //     let col2 = document.createElement('td');
        //     // col2.innerHTML = data[i].subject;
        //     col2.innerHTML = `<a href="#message-modal-${message["result"]["id"]}" data-toggle="modal" id="message-link-${message["result"]["id"]}"> ${getHeader(message["result"]["payload"]["headers"], 'Subject')} </a>`
        //     let col3 = document.createElement('td');
        //     // col3.innerHTML = data[i].Date;
        //     col3.innerHTML = `${getHeader(message["result"]["payload"]["headers"], 'Date')}`;

        //     row.append(col1, col2, col3);
        //     tbody.append(row);
        // }

        // let date = getHeader(message["result"]["payload"]["headers"], 'Date');
        let date = new Date(getHeader(message["result"]["payload"]["headers"], 'Date')).toString().split(" ");

        $('.table-inbox tbody').append(
            '<tr>\
              <td>'+getHeader(message["result"]["payload"]["headers"], 'From')+'</td>\
              <td>\
                <a href="#message-modal-' + message["result"]["id"] +
                  '" data-toggle="modal" id="message-link-' + message["result"]["id"]+'">' +
                  getHeader(message["result"]["payload"]["headers"], 'Subject') +
                '</a>\
              </td>\
              <td>'+ date[1] + ' '+date[2] +'</td>\
            </tr>'
          );
  
          $('body').append(
            '<div class="modal fade" id="message-modal-' + message["result"]["id"] +
                '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
              <div class="modal-dialog modal-lg">\
                <div class="modal-content">\
                  <div class="modal-header">\
                    <button type="button"\
                            class="close"\
                            data-dismiss="modal"\
                            aria-label="Close">\
                      <span aria-hidden="true">&times;</span></button>\
                    <h4 class="modal-title" id="myModalLabel">' +
                      getHeader(message["result"]["payload"]["headers"], 'Subject') +
                    '</h4>\
                  </div>\
                  <div class="modal-body">\
                    <iframe id="message-iframe-'+message["result"]["id"]+'" srcdoc="<p>Loading...</p>">\
                    </iframe>\
                  </div>\
                </div>\
              </div>\
            </div>'
          );
  
          $('#message-link-'+message["result"]["id"]).on('click', function(){
            var ifrm = $('#message-iframe-'+message["result"]["id"])[0].contentWindow.document;
            $('body', ifrm).html(getBody(message["result"]["payload"]));
          });

    }
    myList.append(table);


    function getHeader(headers, index) {
        var header = '';

        headers.forEach(function(obj){
          if(obj.name === index){
            header = obj.value;
          }
        });
        return header;
      }

      function getBody(message) {
        var encodedBody = '';
        if(typeof message.parts === 'undefined')
        {
          encodedBody = message.body.data;
        }
        else
        {
          encodedBody = getHTMLPart(message.parts);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        return decodeURIComponent(escape(window.atob(encodedBody)));
      }

      function getHTMLPart(arr) {
        for(var x = 0; x <= arr.length; x++)
        {
          if(typeof arr[x].parts === 'undefined')
          {
            if(arr[x].mimeType === 'text/html')
            {
              return arr[x].body.data;
            }
          }
          else
          {
            return getHTMLPart(arr[x].parts);
          }
        }
        return '';
      }

    let search_input = document.querySelector("#search_input");

    search_input.addEventListener("keyup", function (e) {

        let filter, tr, td, i, txtValue;
        filter = search_input.value.toUpperCase();

        tr = myTable.getElementsByTagName("tr");
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

