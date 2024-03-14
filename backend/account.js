const api = "http://127.0.0.1:8000";

const userdatacard = document.getElementById("userdata")
const logout_button = document.getElementById("logout-button");
const nav_login = document.getElementById("nav-login");
const nav_signup = document.getElementById("nav-signup");
const newnameinput = document.getElementById("newname");
const newemailinput = document.getElementById("newemail");
const changebutton = document.getElementById("newdatasubmit");  

async function cancelreserve(reserveid) {
    try {
      const response = await fetch(`${api}/user/cancel?reservation_id=${reserveid}`, {
        method: 'DELETE', // Specify DELETE method for cancellation
        headers: {
          'Content-Type': 'application/json' // Set content type if required by API
        },
        body: JSON.stringify({reserveid}) // Include reservation ID in request body
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      window.location.reload();

    } catch (error) {
      console.error('Error cancelling reservation:', error);
      // Handle errors gracefully (e.g., display a generic error message)
    }
}

function adminredirect(){
    window.location.href = 'admin.html';
}

async function current_user(){
    const userresponse = await fetch(`${api}/currentuser`); // Fetch data from '/hotel' endpoint
    const userdata = await userresponse.json(); // Parse the JSON response
    console.log(userdata);
    
    if(userdata !== null){
    
        document.getElementById("name").textContent = userdata['_User__name'];
        document.getElementById("email").textContent = userdata['_User__email'];

       

        if(userdata['_User__type'] == 'admin'){
            const adminbutton = document.createElement('button');
            adminbutton.classList.add('btn', 'btn-outline-dark', 'me-2', 'ms-2');
            adminbutton.innerHTML = 'Admin Tools';
            adminbutton.addEventListener('click', adminredirect);
            userdatacard.appendChild(adminbutton);
        }
        
        nav_login.textContent = userdata['_User__name'];
        const booking_list = document.getElementById("account-booking-list");
        booking_list.innerHTML = ''; //Clear shit inside
        for(let i = 0; i < userdata['_User__reservation'].length; i++){
            const booking = document.createElement('div');
            booking.classList.add('col');
            const changebuttonid = `changebutton-${i}`;
            const changebackdropid = `changebackdrop-${i}`
            const newdateinid = `newdatein-${i}`;
            const newdateoutid = `newdateout-${i}`;
            const newdatasubmitid = `newdatasubmit-${i}`;
            const cancelbuttonid = `cancelbutton-${i}`;
            const reviewbackdropid = `reviewbackdrop-${i}`;
            const reviewopenid = `reviewopen-${i}`;
            const reviewbuttonid = `reviewbutton-${i}`;
            const reviewcommentid = `commentbutton-${i}`;
            const reviewratingid = `ratingbutton-${i}`;
            const receiptbuttonid = `receiptbutton-${i}`
            const receiptbackdropid = `receiptbackdrop-${i}`

            const hotelresponse = await fetch(`${api}/search_by_name?name=${userdata['_User__reservation'][i]['_Reservation__hotel_name']}`); // Fetch data from '/hotel' endpoint
            const hotelData = await hotelresponse.json(); // Parse the JSON response

            console.log(i)
            console.log(userdata['_User__receipt'][i]['_Receipt__hotel'])
            booking.innerHTML =
            `
            <div class="d-flex justify-content-between align-items-center my-3">
                <div class="d-lg-flex align-items-center">
                    <div style="width: 180px; height: 120px; background-image: url(${hotelData._Hotel__imgsrc[0]}); background-position: center; background-size: cover;"></div>
                    <div class="mx-lg-5 mt-lg-0 mt-4">
                        <p class="m-0">check in</p>
                        <h5 class="m-0" id="checkin">${userdata['_User__reservation'][i]['_Reservation__date_in']}</h5>
                    </div>
                    <div class="pe-4 me-4 mt-lg-0 mt-4 border-end border-secondary-subtle">
                        <p class="m-0">check out</p>
                        <h5 class="m-0" id="checkout">${userdata['_User__reservation'][i]['_Reservation__date_out']}</h5>
                    </div>
                    <div class="mt-lg-0 mt-4">
                        <p class="m-0" id="hotel">${userdata['_User__reservation'][i]['_Reservation__hotel_name']}</p>
                        <p class="m-0" id="room">${userdata['_User__reservation'][i]['_Reservation__room_detail']}</p>
                    </div>
                </div>
                <div>
                    <!-- receipt -->
                    <button id='${receiptbuttonid}' type="button" class="btn btn-outline-dark me-2" data-bs-toggle="modal" data-bs-target="#${receiptbackdropid}"><i class="bi bi-receipt-cutoff me-2"></i>Receipt</button>
                    <div class="modal fade" id="${receiptbackdropid}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="receiptBackdropLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title fs-5" id="receiptBackdropLabel">Receipt details</h4>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <h4 class="text-uppercase fw-bold">${userdata['_User__receipt'][i]['_Receipt__hotel']}</h4>
                                    <h5>${userdata['_User__receipt'][i]['_Receipt__room']}</h5>
                                    <p class="m-0 text-secondary">Start : ${userdata['_User__receipt'][i]['_Receipt__checkin']}</p>
                                    <p class="m-0 text-secondary">End : ${userdata['_User__receipt'][i]['_Receipt__checkout']}</p>
                                    <p class="m-0 pb-3 mb-3 border-bottom border-secondary-subtle"></p>
                                    <h4 class="text-end fw-bold">THB ${userdata['_User__receipt'][i]['_Receipt__price']}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- review -->
                    <button id='${reviewopenid}' type="button" class="btn btn-outline-dark me-2" data-bs-toggle="modal" data-bs-target="#${reviewbackdropid}"><i class="bi bi-chat-left-text me-2"></i>Review</button>
                    <div class="modal fade" id="${reviewbackdropid}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="reviewBackdropLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title fs-5" id="reviewBackdropLabel">Review hotel</h4>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="mb-3">
                                            <label for="rating_review" class="form-label">Rating</label>
                                            <input id="${reviewratingid}" type="number" class="form-control">
                                        </div>
                                        <div class="mb-3">
                                            <label for="comment_review" class="form-label">Comment</label>
                                            <input id="${reviewcommentid}" class="form-control">
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button id="${reviewbuttonid}" type="button" class="btn btn-primary">Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Button trigger modal -->
                    <button id="${changebuttonid}" type="button" class="btn btn-outline-dark me-2" data-bs-toggle="modal" data-bs-target="#${changebackdropid}">
                    <i class="bi bi-wrench-adjustable"></i></button>
                    <!-- Modal -->
                    <div class="modal fade" id="${changebackdropid}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="nameBackdropLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title fs-5" id="nameBackdropLabel">Change reservation</h4>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="mb-3">
                                            <label for="new-name" class="form-label">New Check in date</label>
                                            <input id ="${newdateinid}" type="date" class="form-control">
                                        </div>
                                        <div class="mb-3">
                                            <label for="new-email" class="form-label">New Check out date</label>
                                            <input id ="${newdateoutid}" type="date" class="form-control">
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button id="${newdatasubmitid}" type="button" class="btn btn-primary">Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button id="${cancelbuttonid}" type="button" class="btn btn-dark"><i class="bi bi-x-lg"></i></button>
                </div>
            </div>
            `
            booking_list.appendChild(booking);
        }
        for(let i = 0; i < userdata['_User__reservation'].length; i++){
            const newdateinid = `newdatein-${i}`;
            const newdateoutid = `newdateout-${i}`;
            const newdatasubmitid = `newdatasubmit-${i}`;
            const cancelbutton = `cancelbutton-${i}`;
            const reviewbuttonid = `reviewbutton-${i}`
            const reviewratingid = `ratingbutton-${i}`
            const reviewcommentid = `commentbutton-${i}`
            const dateinElement = document.getElementById(newdateinid);
            const dateoutElement = document.getElementById(newdateoutid);
            const datasubmitElement = document.getElementById(newdatasubmitid);
            const cancelElement = document.getElementById(cancelbutton);
            const reviewElement = document.getElementById(reviewbuttonid);
            const ratingElement = document.getElementById(reviewratingid);
            const commentElement = document.getElementById(reviewcommentid);
            reviewElement.addEventListener('click', async function () {
                inputrating = ratingElement.value.trim()
                inputcomment = commentElement.value.trim()
                if(inputrating.length == 0){
                    alert("Please rate us!");
                    return;
                }
                console.log(userdata['_User__reservation'][i]._Reservation__hotel_name)
                reviewData = {
                    hotel_name: userdata['_User__reservation'][i]._Reservation__hotel_name,
                    comment: inputcomment,
                    rating: inputrating
                    }
                const feedbackresponse = await fetch(`${api}/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reviewData)
                });
                console.log(feedbackresponse);
                
                if(feedbackresponse.ok) {
                    const feedbackdata = await feedbackresponse.json();
                    // Assuming the response contains information about the success of login
                    if(feedbackdata) {
                        alert("Reviewed!");
                        window.location.reload();
                    } else {
                        alert("Review failed. Please check your credentials.");
                    }
                } else {
                    const errorMessage = await feedbackresponse.text();
                    alert("Error: " + errorMessage);
                }
            });
            datasubmitElement.addEventListener('click', async function () {
                const inputdatein = dateinElement.value.trim();
                const inputdateout = dateoutElement.value.trim();
                var datecheckin = new Date(checkin);
                var datecheckout = new Date(checkout);
                
                if (inputdatein.length === 0 || inputdateout.length ===  0) {
                    alert("Please input information!")
                    return;
                } else if (datecheckout <= datecheckin){
                    alert("Please fill in the date in/date out correctly");
                    return;
                } else{
                    console.log(userdata['_User__reservation'][i]._Reservation__id);
                    const response = await fetch(`${api}/change`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            reservation_id : userdata['_User__reservation'][i]._Reservation__id,
                            date_in: inputdatein,
                            date_out: inputdateout
                        })
                    });
                
                    if (!response.ok) {
                        alert("date not available!")
                        return;
                    }
                    window.location.reload();
                }
            });
            cancelElement.addEventListener('click', function () {
                // Show confirmation popup
                if (confirm("Are you sure you want to cancel this reservation?")) {
                    cancelreserve(userdata['_User__reservation'][i]['_Reservation__id']);
                } else {
                }
            });
          }
    } 
    else{
        document.getElementById("name").textContent = 'Guest';
        document.getElementById("email").textContent = "You're not logged in";
    
        const booking_list = document.getElementById("account-booking-list");
        booking_list.innerHTML = ''; //Clear shit inside
    }
}

async function log_out(){
    const userresponse = await fetch(`${api}/user/logout`); // Fetch data from '/hotel' endpoint
    console.log(userresponse);
    if(userresponse.ok) { // Check for successful logout
        document.getElementById("name").textContent = 'Guest'; // Clear user name
        document.getElementById("email").textContent = "You're not logged in"; // Clear user email
        const bookingList = document.getElementById("account-booking-list");
        bookingList.innerHTML = ""; // Clear booking list container

        nav_login.textContent = 'Login';
        logout_button.textContent = "Login";
        logout_button.removeEventListener("click", log_out);  // Remove logout listener
        logout_button.addEventListener("click", login_redirect);

      } else {
        // Handle logout error
        console.error("Error logging out!");
      }
}

async function login_redirect(){
    const userresponse = await fetch(`${api}/currentuser`); // Fetch data from '/hotel' endpoint
    const userdata = await userresponse.json(); // Parse the JSON response
    if(userdata == null){
    window.location.href = "login.html"
    }
}

async function signup_redirect(){
    window.location.href = "signup.html"
}

async function changeinfo(){
    const userresponse = await fetch(`${api}/currentuser`); // Fetch data from '/hotel' endpoint
    const userdata = await userresponse.json(); // Parse the JSON response
    console.log(userdata);
    
    if(userdata === null){
        window.location.href = "login.html"
        return;
    }

    newname = newnameinput.value.trim();
    newemail = newemailinput.value.trim();

    if(newnameinput.value.trim().length == 0){
        newname = userdata['_User__name'];
    }
    if(newemailinput.value.trim().length == 0){
        newemail = userdata['_User__password'];
    }
    console.log(newname);
    console.log(newemail);

    const response = await fetch(`${api}/user/change-info/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            new_name: newname,
            new_password: newemail
        })
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    window.location.reload();
}

logout_button.addEventListener("click", log_out);
nav_login.addEventListener("click", login_redirect)
nav_signup.addEventListener('click', signup_redirect);
changebutton.addEventListener('click', changeinfo);
current_user();
console.log(current_user.userdata)