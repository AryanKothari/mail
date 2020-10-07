document.addEventListener('DOMContentLoaded', function() {
 
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', (e) => compose_email(e));
 
    // By default, load the inbox
      load_mailbox('inbox');
});
 
function compose_email(e) {
 
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
 
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
 
  document.querySelector('#compose-form').onsubmit = function(e) {
    e.preventDefault()
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        load_mailbox('sent');
    })
  };
}
  
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(element => {
        if (mailbox != "sent") {
          sender_recipients = element.sender;
        } else {
          sender_recipients = element.recipients;
        }
 
        var item = document.createElement("div");
        if (element.read) {
          item.style.backgroundColor = '#D3D3D3'
        } else {
          item.style.backgroundColor = '#fff'
        }
        item.className = `card my-1 items`;
        item.innerHTML = `<div class="card-body" id="item-${element.id}" style="width:fit-content; height:fit-content;">
        <p style="font-size: small;"> <strong>${sender_recipients}</strong> </p>
        <p style="margin-left: 200px; margin-top: -20px; font-size: small;"> ${element.subject} </p>
        <p style="margin-left: 450px; margin-top: -20px; font-size: small;"> ${element.timestamp} </p>
      </div>`;
        document.querySelector("#emails-view").append(item);

        item.addEventListener('click', () => {
          email_view(element.id, mailbox);
        })
      });
    });
  }


  
  function email_view(email_id, mailbox) {

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
    // Print email
    document.querySelector('#sender').innerHTML = `<strong>From:</strong> ${email.sender}`;
    document.querySelector('#recipients').innerHTML = `<strong>To:</strong> ${email.recipients}`;
    document.querySelector('#subject').innerHTML = `<strong>Subject:</strong> ${email.subject}`;
    document.querySelector('#timestamp').innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
    document.querySelector('#body').innerHTML = `${email.body}`;

    if (mailbox == "archive") {
      document.querySelector('#unarchive').style.display = 'block';
      document.querySelector('#archive').style.display = 'none';
      document.querySelector('#reply').style.display = 'block';
    } else if (mailbox == "inbox") {
      document.querySelector('#unarchive').style.display = 'none';
      document.querySelector('#archive').style.display = 'block';
      document.querySelector('#reply').style.display = 'block';
    } else {
      document.querySelector('#unarchive').style.display = 'none';
      document.querySelector('#archive').style.display = 'none';
      document.querySelector('#reply').style.display = 'none';
    }

    document.querySelector('#archive').addEventListener('click', () => {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
         body: JSON.stringify({
           archived: true
         })
       })
       location.reload();
    });

    document.querySelector('#unarchive').addEventListener('click', () => {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
         body: JSON.stringify({
           archived: false
         })
       })
       location.reload();
    });

    document.querySelector('#reply').addEventListener('click', () => reply(email));
    
});

  fetch(`/emails/${email_id}`, {
   method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

}

  function reply(email) {
     // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

    console.log(email)
  }
