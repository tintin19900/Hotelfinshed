const api = "http://127.0.0.1:8000";

const urlParams = new URLSearchParams(window.location.search);
const encodedLocation = urlParams.get('location');
const encodedDatein = urlParams.get('datein');
const encodedDateout = urlParams.get('dateout');
const encodedGuest = urlParams.get('guest');
const inputlocation = decodeURIComponent(encodedLocation);
const checkin = decodeURIComponent(encodedDatein);
const checkout = decodeURIComponent(encodedDateout);
const guest = decodeURIComponent(encodedGuest);

const resultnum = document.getElementById("resultnum");

const searchprompt = document.getElementById("index-search"); // Select the search bar input
const datein = document.getElementById("index-datein");
const dateout = document.getElementById("index-dateout");
const guests = document.getElementById("index-guests");
const searchbutton = document.getElementById("index-searchbutton"); // Select the search button

inputlocation.value = encodedLocation
datein.value = encodedDatein
dateout.value = encodedDateout
guests.value = guest

async function show_btn_login(){
  let response = await fetch(`${api}/currentuser`); // Fetch data from '/hotel' endpoint
  let userdata = await response.json(); // Parse the JSON response
  
  if(userdata != null){
      let user = document.getElementById("login_user");
      user.innerHTML = `<a href="account.html"><button type="button" class="btn btn btn-outline-light me-2">${userdata['_User__name']}</button></a>`
  }
}
show_btn_login()

async function searchHotels() {
  const prompt = searchprompt.value.trim();
  const checkin = datein.value.trim(); // Output as yyyy-mm-dd
  const checkout = dateout.value.trim(); // Output as yyyy-mm-dd
  const guest = guests.value.trim();
  
  if (prompt.length === 0 || checkin.length === 0 || checkout.length === 0 || guest.length === 0) {
    alert("Please fill in information.");
    return;
  }

  try {
    const today = new Date(); // Get today's date
    today.setHours(7); // Set hours to 12 (for example)
    today.setMinutes(0); // Set minutes to 0
    today.setSeconds(0); // Set seconds to 0
    today.setMilliseconds(0); // Set milliseconds to 0
    var datecheckin = new Date(checkin);
    var datecheckout = new Date(checkout);
    if(datecheckout <= datecheckin){
      alert("Please try selected date again");
      return;
    }
    if(datecheckin < today || datecheckout < today){
      alert("Please input new date");
      return;
    }
    
    const response = await fetch(`${api}/search_by_name?name=${prompt}`); // Fetch data from '/hotel' endpoint
    const data = await response.json(); // Parse the JSON response
    console.log(data);

    if(data != null){
      // Encode
    const encodedName = encodeURIComponent(prompt);
    const encodedGuest = encodeURIComponent(guest);

    // Redirect to detail.html with the encoded data
    console.log(data);
    window.location.href = `detail.html?name=${encodedName}&datein=${encodedDatein}&dateout=${encodedDateout}&guest=${encodedGuest}`;
    return;
    }

    const locationresponse = await fetch(`${api}/search_by_location?location=${prompt}`); // Fetch data from '/hotel' endpoint
    const locationdata = await locationresponse.json(); // Parse the JSON response

    if (locationdata.length != 0){
      // Encode
    const encodedLocation = encodeURIComponent(prompt);
    const encodedCheckin = encodeURIComponent(checkin);
    const encodedCheckout = encodeURIComponent(checkout);
    const encodedGuest = encodeURIComponent(guest);

    // Redirect to detail.html with the encoded data
    window.location.href = `search.html?location=${encodedLocation}&datein=${encodedCheckin}&dateout=${encodedCheckout}&guest=${encodedGuest}`;
    return;
    }

    if (data.error || location.error) {
      alert("Error fetching hotels: " + data.error);
      return;
    }

  } catch (error) {
    console.error("Error fetching hotels:", error);
    alert("An error occurred while searching for hotels.");
  }
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

function hotel_redirect(hotelname){
  let today_1 = new Date();
  today_1.setHours(7); // Set hours to 12 (for example)
  today_1.setMinutes(0); // Set minutes to 0
  today_1.setSeconds(0); // Set seconds to 0
  today_1.setMilliseconds(0); // Set milliseconds to 0
  let checkin_1 = new Date(datein.value); // Output as yyyy-mm-dd
  let checkout_1 = new Date(dateout.value); // Output as yyyy-mm-dd
  
  if (checkin_1.length === 0 || checkout_1.length === 0 || guests.length === 0) {
    alert("Please fill in information.");
    return;
  }
  if (checkout_1 <= checkin_1){
    alert("Please try to put date again");
    return;
  }
  if (checkin_1 < today_1  || checkout_1 <= today_1){
    alert("Please input new date");
    return;
  }

  window.location.href = `detail.html?name=${hotelname}&datein=${datein.value}&dateout=${dateout.value}&guest=${guests.value}`;
}

async function show_recommended(){
  const response = await fetch(`${api}/search_by_location?location=${inputlocation}`); // Fetch data from '/hotel' endpoint
  const data = await response.json(); // Parse the JSON response
  console.log(data);
  resultnum.textContent = `${data.length}  RESULT(S)`

  const recommend_list = document.getElementById("hotel-list");
  recommend_list.innerHTML = '';

  for(let i = 0; i < data.length; i++){
    const ratingresponse = await fetch(`${api}/get_rating?name=${data[i]._Hotel__name}`); // Fetch data from '/hotel' endpoint
    const ratingdata = await ratingresponse.json(); // Parse the JSON response
    if(data[i]._Hotel__rooms.length == 0){
      continue;
    }

    const cheapestresponse = await fetch(`${api}/cheapest_for_guest?hotelname=${data[i]._Hotel__name}&guest=${guest}`); // Fetch data from '/hotel' endpoint
    const cheapestdata = await cheapestresponse.json(); // Parse the JSON response

    const hotel = document.createElement('div');
    hotel.classList.add('row');

    const hotels = data[i];
    const buttonid = `hotelbutton-${i}`;

    hotel.innerHTML =
    `
    <div class="row gx-lg-5 mb-3">
        <div class="col-auto">
            <!-- picture -->
            <div class="bg-image-full" style="width: 300px; height: 200px; background-image: url(${data[i]._Hotel__imgsrc[0]}); background-size: cover; background-position: right bottom;"></div>
        </div>
        <div class="col-auto me-auto mt-lg-0 mt-4">
            <!-- hotel name -->
            <h4 class="hotel_name mb-3 text-uppercase">${data[i]._Hotel__name}</h4>
            <!-- rating -->
            <div class="d-flex mb-3">
            ${generateStarRating(ratingdata.rating)}
            </div>
            <!-- hotel location -->
            <div class="d-flex align-items-center mb-2">
                <h5 class="m-0 me-3"><i class="bi bi-geo-alt"></i></h5>
                <p class="m-0 text-capitalize text-body-secondary">${data[i]._Hotel__location._Location__city}, ${data[i]._Hotel__location._Location__country}</p>
            </div>
        </div>
        <!-- hotel price -->
        <div class="col-auto align-self-end text-end">
            <p class="m-0 mb-1 text-body-secondary text-decoration-line-through">THB ${cheapestdata._Room__price}</p>
            <h4 class="mb-3 fw-bolder">THB ${(1 - cheapestdata._Room__discount._Discount__amount) * (cheapestdata._Room__price)}</h4>
            <button id="${buttonid}" type="button" class="btn btn-dark fw-bold" style="width: 200px;">Book Now</button>
        </div>
    </div>
    `
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

searchbutton.addEventListener("click", searchHotels); // Add click event listener to the button
show_recommended();