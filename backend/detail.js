const api = "http://127.0.0.1:8000";

// Function to extract URL parameters
const urlParams = new URLSearchParams(window.location.search);
const encodedName = urlParams.get('name');
const encodedDatein = urlParams.get('datein');
const encodedDateout = urlParams.get('dateout');
const encodedGuest = urlParams.get('guest');
const hotelName = decodeURIComponent(encodedName);
const checkin = decodeURIComponent(encodedDatein);
const checkout = decodeURIComponent(encodedDateout)
const guest = decodeURIComponent(encodedGuest)

// Process the data as needed
console.log(hotelName);
console.log(checkin);
console.log(checkout);
console.log(guest); //NULL?

const pagebg = document.getElementById("header-bg");
const pagename = document.getElementById("hotel-name");
const pagelocation = document.getElementById("hotel-location")
const pageimg1 = document.getElementById("img1");
const pageimg2 = document.getElementById("img2");
const pageimg3 = document.getElementById("img3");
const pagerating = document.getElementById("rating");
const pagefeedback = document.getElementById("feedback");
const pagetotalfeedback = document.getElementById("feedbacknum");


//Function here

async function show_btn_login(){
  let response = await fetch(`${api}/currentuser`); // Fetch data from '/hotel' endpoint
  let userdata = await response.json(); // Parse the JSON response
  
  if(userdata != null){
      let user = document.getElementById("login_user");
      user.innerHTML = `<a href="account.html"><button type="button" class="btn btn btn-outline-light me-2">${userdata['_User__name']}</button></a>`
  }
}
show_btn_login()

async function gethoteldata(name){
  const hotelresponse = await fetch(`${api}/search_by_name?name=${hotelName}`); // Fetch data from '/hotel' endpoint
  const hoteldata = await hotelresponse.json(); // Parse the JSON response
  return hotelData;
}

async function setpage(){
  const hotelresponse = await fetch(`${api}/search_by_name?name=${hotelName}`); // Fetch data from '/hotel' endpoint
  const hoteldata = await hotelresponse.json(); // Parse the JSON response
  hotelData = hoteldata;
  console.log(hotelData);

  const ratingresponse = await fetch(`${api}/get_rating?name=${hotelName}`); // Fetch data from '/hotel' endpoint
  const ratingdata = await ratingresponse.json(); // Parse the JSON response

  pagename.textContent = hotelName;
  pagelocation.textContent = `${hotelData._Hotel__location._Location__city} - ${hotelData._Hotel__location._Location__country}`
  pagebg.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${hotelData._Hotel__imgsrc[0]})`;
  pagebg.style.backgroundSize = 'cover';
  pageimg1.style.backgroundImage = `url(${hotelData._Hotel__imgsrc[1]})`;
  pageimg2.style.backgroundImage = `url(${hotelData._Hotel__imgsrc[2]})`;
  pageimg3.style.backgroundImage = `url(${hotelData._Hotel__imgsrc[3]})`;
  pagerating.textContent = ratingdata.rating;
  
  switch(true){
    case ratingdata.rating === "N/A":
      pagefeedback.textContent = "No Reviews Yet";
      pagetotalfeedback.textContent = `${ratingdata.total} verified reviews`;
      break;
    case ratingdata.rating >= 0 && ratingdata.rating < 1:
      pagefeedback.textContent = "Bad";
      pagetotalfeedback.textContent = `${ratingdata.total} verified reviews`;
      break;
    case ratingdata.rating >= 1 && ratingdata.rating < 2:
      pagefeedback.textContent = "Quite Bad";
      pagetotalfeedback.textContent = `${ratingdata.total} verified reviews`;
      break;
    case ratingdata.rating >= 2 && ratingdata.rating < 3:
      pagefeedback.textContent = "Moderate";
      pagetotalfeedback.textContent = `${ratingdata.total} verified reviews`;
      break;
    case ratingdata.rating >= 3 && ratingdata.rating < 4:
      pagefeedback.textContent = "Good";
      pagetotalfeedback.textContent = `${ratingdata.total} verified reviews`;
      break;
    case ratingdata.rating >= 4 && ratingdata.rating < 5:
      pagefeedback.textContent = "Very Good";
      pagetotalfeedback.textContent = `${ratingdata.total} verified reviews`;
      break;
    case ratingdata.rating === 5:
      pagefeedback.textContent = "Recommended";
      pagetotalfeedback.textContent = `${ratingdata.total} verified reviews`;
      break;
  }

  // show feed back
  let result_feedback = document.getElementById("result_feedback");
  let text = "";
  for (let i = 0; i < hoteldata['_Hotel__feedback'].length; i++) {
    text += `
    <div class="col py-3 border-bottom border-secondary-subtle">
        <div class="row mt-2">
            <div class="col-auto mx-3">
                <img src="https://picsum.photos/80/80" class="rounded-circle" alt="">
            </div>
            <div class="col">
                <div class="d-flex flex-column">
                    <div class="d-flex mb-1">
                        <p class="m-0 pe-3 me-3 border-end border-secondary-subtle fw-bold">${hotelData['_Hotel__feedback'][i]['_Feedback__rating']}.0 Star</p>
                        <p class="m-0 text-secondary text-capitalize">${hotelData['_Hotel__feedback'][i]['_Feedback__user']}</p>
                    </div>
                    <p class="m-0 text-secondary">${hotelData['_Hotel__feedback'][i]['_Feedback__time']}</p>
                    <p>${hotelData['_Hotel__feedback'][i]['_Feedback__comment']}</p>
                </div>
            </div>
        </div>
    </div>
    `;
  };
  result_feedback.innerHTML = text;
  console.log(['_Hotel__feedback'][i]['_Feedback__user'])
}

function generateStarRating(rating) {
  const stars = [];
  roundedRating = Math.round(rating);
  if(rating === "N/A"){
    roundedRating = 0;
  }

  for (let i = 0; i < roundedRating; i++) {
      stars.push('<i class="bi bi-star-fill"></i>');
  }

  for (let i = roundedRating; i < 5; i++) {
      stars.push('<i class="bi bi-star"></i>');
  }

  return stars.join(''); // Join the star icons into a string
}

async function hotel_redirect(hotelname){
  const encodedName = encodeURIComponent(hotelname);
  window.location.href = `detail.html?name=${encodedName}&datein=${encodedCheckin}&dateout=${encodedCheckout}&guest=${encodedGuest}`;
}

async function room_redirect(hotelname, roomname){
  const encodedRoom = encodeURIComponent(roomname);
  const encodedName = encodeURIComponent(hotelname);
  window.location.href = `contact.html?name=${encodedName}&room=${encodedRoom}&datein=${encodedDatein}&dateout=${encodedDateout}&guest=${encodedGuest}`;
}

async function show_recommended(){
  const hotelresponse = await fetch(`${api}/search_by_name?name=${hotelName}`); // Fetch data from '/hotel' endpoint
  const hotelData = await hotelresponse.json(); // Parse the JSON response

  const response = await fetch(`${api}/recommendations?name=${hotelData._Hotel__name}`); // Fetch data from '/hotel' endpoint
  const data = await response.json(); // Parse the JSON response
  console.log(data)
  const recommend_list = document.getElementById("recommendations")
  recommend_list.innerHTML = '';

  for(let i = 0; i < data.length; i++){
    const ratingresponse = await fetch(`${api}/get_rating?name=${hotelData._Hotel__name}`); // Fetch data from '/hotel' endpoint
    const ratingdata = await ratingresponse.json(); // Parse the JSON response

    // ratingdata.rating = Math.floor(Math.random() * 6);

    const hotel = document.createElement('div');
    hotel.classList.add('row');

    const hotels = data[i];
    const buttonid = `hotelbutton-${i}`;

    hotel.innerHTML =
    `
    <div id="${buttonid}">
        <div class="card mb-4 me-lg-5 me-1 shadow-sm" style="width: 15rem;" onclick="search_hotel('${hotels._Hotel__name}')">
            <div style="width: 238px; height: 159px; background-image: url(${hotels._Hotel__imgsrc[0]}); background-position: center; background-size: cover;"></div>
            <div class="card-body">
                <h5 class="card-title text-capitalize mb-1 fw-bold">${hotels._Hotel__name}</h5>
                <div class="d-flex mb-1">
                  ${generateStarRating(ratingdata.rating)}
                </div>
                <div class="d-flex">
                    <p class="m-0 me-1"><i class="bi bi-geo-alt"></i></p>
                    <p class="text-body-secondary">${hotels._Hotel__location._Location__city}, ${hotels._Hotel__location._Location__country}</p>
                </div>
                <p class="fw-semibold">THB 1238.23</p>
            </div>  
        </div>
    </div>
    `;
    recommend_list.appendChild(hotel);
  }
  
  for(let i = 0; i < data.length; i++){
    const buttonid = `hotelbutton-${i}`;
    const hotelElement = document.getElementById(buttonid);
    hotelElement.addEventListener('click', (event) => {
      event.preventDefault();
      hotel_redirect(data[i]._Hotel__name);
    });
  }
}

async function show_available_room(){
  const hotelresponse = await fetch(`${api}/search_by_name?name=${hotelName}`); // Fetch data from '/hotel' endpoint
  const hotelData = await hotelresponse.json(); // Parse the JSON response

  const response = await fetch(`${api}/get_available_room?name=${hotelData._Hotel__name}&dayin=${checkin}&dayout=${checkout}&guest=${guest}`); // Fetch data from '/hotel' endpoint
  const data = await response.json(); // Parse the JSON response
  filteredroom = data;

  const room_list = document.getElementById('room-list');
  room_list.innerHTML = '';
  for(let i = 0; i < filteredroom.length; i++){
    const room = document.createElement('div');
    room.classList.add('row');

    const rooms = filteredroom[i];
    const buttonid = `roombutton-${i}`;

    finalprice = rooms._Room__price;
    if(rooms._Room__discount !== null){
      finalprice = rooms._Room__price * (1 - rooms._Room__discount._Discount__amount);
    }
    console.log(rooms)
    room.innerHTML =
    `
    <div class="row gx-lg-5 mb-3">
        <div class="col-auto">
            <!-- picture -->
            <div class="bg-image-full" style="width: 300px; height: 200px; background-image: url(${rooms._Room__rooms_image}); background-position: center; background-size: cover;"></div>
        </div>
        <div class="col-auto me-auto mt-lg-0 mt-4">
            <!-- hotel name -->
            <h4 class="hotel_name mb-3 text-uppercase">${rooms._Room__detail}</h4>
            <!-- hotel location -->
            <div class="d-flex align-items-center mb-2">
                <h5 class="m-0 me-3"><i class="bi bi-person"></i></h5>
                <p class="m-0 text-capitalize text-body-secondary">${rooms._Room__guests} guests</p>
            </div>
        </div>
        <!-- hotel price -->
        <div class="col-auto align-self-end text-end">
            <p class="m-0 mb-1 text-body-secondary text-decoration-line-through">THB ${rooms._Room__price}</p>
            <h4 class="mb-3 fw-bolder">THB ${finalprice}</h4>
            <button id="${buttonid}" type="button" class="btn btn-dark fw-bold" style="width: 200px;">Book Now</button>
        </div>
    </div>
    `
    room_list.appendChild(room);
  }

  for(let i = 0; i < filteredroom.length; i++){
    const buttonid = `roombutton-${i}`;
    const roomElement = document.getElementById(buttonid);
    roomElement.addEventListener('click', () => {
      room_redirect(hotelData._Hotel__name, data[i]._Room__detail);
    });
  }
}

function search_hotel(hotel_name) {
  window.location.href = `detail.html?name=${hotel_name}&datein=${checkin}&dateout=${checkout}&guest=${guest}`;
}

setpage();
show_available_room();
show_recommended();
