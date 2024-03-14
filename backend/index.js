const api = "http://127.0.0.1:8000";

const searchprompt = document.getElementById("index-search"); // Select the search bar input
const datein = document.getElementById("index-datein");
const dateout = document.getElementById("index-dateout");
const guests = document.getElementById("index-guests");
const searchbutton = document.getElementById("index-searchbutton"); // Select the search button

async function show_btn_login(){
  let response = await fetch(`${api}/currentuser`); // Fetch data from '/hotel' endpoint
  let userdata = await response.json(); // Parse the JSON response
  
  if(userdata != null){
      let user = document.getElementById("login_user");
      user.innerHTML = `<a href="account.html"><button type="button" class="btn btn btn-outline-light me-2">${userdata['_User__name']}</button></a>`
  }
}

function scrollto(target) {
  const Target = document.getElementById(target);
  Target.scrollIntoView({ behavior: 'smooth' });
}

async function generateStarRating(hotelname) {
  const ratingresponse = await fetch(`${api}/get_rating?name=${hotelname}`); // Fetch data from '/hotel' endpoint
  const ratingdata = await ratingresponse.json(); // Parse the JSON response
  rating = ratingdata.rating;
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
  const encodedName = encodeURIComponent(hotelname);
  window.location.href = `detail.html?name=${encodedName}&datein=${encodedCheckin}&dateout=${encodedCheckout}&guest=${encodedGuest}`;
}

function search_location(location) {
  let today = new Date();
  today.setHours(7); // Set hours to 12 (for example)
  today.setMinutes(0); // Set minutes to 0
  today.setSeconds(0); // Set seconds to 0
  today.setMilliseconds(0); // Set milliseconds to 0
  let datecheckin = new Date(datein.value);
  let datecheckout = new Date(dateout.value);
  
  if(datecheckout <= datecheckin){
    alert("Please try to put date again");
    return;
  }
  if(datecheckin < today  || datecheckout < today){
    alert("Please input new date");
    return;
  }

  window.location.href = `search.html?location=${location}&datein=${datein.value}&dateout=${dateout.value}&guest=${guests.value}`;
}

function search_hotel(hotel_name) {
  let checkin = new Date().toLocaleDateString('en-CA').replaceAll("/", "-");
  let checkout = new Date();
  checkout.setDate(checkout.getDate() + 1);
  checkout = checkout.toLocaleDateString('en-CA').replaceAll("/", "-");
  let guest = guests.value.trim();

  window.location.href = `detail.html?name=${hotel_name}&datein=${checkin}&dateout=${checkout}&guest=${guest}`;
}

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
    let today = new Date(); // Get today's date
    today.setHours(7); // Set hours to 12 (for example)
    today.setMinutes(0); // Set minutes to 0
    today.setSeconds(0); // Set seconds to 0
    today.setMilliseconds(0); // Set milliseconds to 0
    var datecheckin = new Date(checkin);
    var datecheckout = new Date(checkout);
    if(datecheckout <= datecheckin){
      alert("Please try to put date again");
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
    const encodedCheckin = encodeURIComponent(checkin);
    const encodedCheckout = encodeURIComponent(checkout);
    const encodedGuest = encodeURIComponent(guest);

    // Redirect to detail.html with the encoded data
    console.log(data);
    window.location.href = `detail.html?name=${encodedName}&datein=${encodedCheckin}&dateout=${encodedCheckout}&guest=${encodedGuest}`;
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

async function hotel_card(tag, location) {
  let response = await fetch(`${api}/search_by_location?location=${location}`);
  let data = await response.json();
  let result = document.getElementById(tag)
  let text = "";
  console.log(data)
  for (const key of Object.keys(data)) {
    roomfinalprice = data[key]['_Hotel__rooms'][0]['_Room__price'] * (1 - data[key]['_Hotel__rooms'][0]['_Room__discount']['_Discount__amount'])
    text += `
      <div class="card mb-4 me-lg-5 me-1 shadow-sm" style="width: 15rem;" onclick="search_hotel('${data[key]['_Hotel__name']}')">
          <div style="width: 238px; height: 159px; background-image: url(${data[key]['_Hotel__imgsrc'][0]}); background-position: center; background-size: cover;"></div>
          <div class="card-body">
              <p class="card-title text-capitalize mb-1 fw-bold">${data[key]['_Hotel__name']}</p>
              <div class="d-flex mb-1">
                ${await generateStarRating(data[key]['_Hotel__name'])}
              </div>
              <p class="m-0 text-body-secondary text-decoration-line-through"><small>THB ${data[key]['_Hotel__rooms'][0]['_Room__price']}</small></p>
              <p class="fw-semibold"><small>THB ${roomfinalprice}</small></p>
          </div>
      </div>
    `
  };
  result.innerHTML = text
}

document.querySelectorAll('.cities').forEach(function(button) {
  button.addEventListener('click', function() {
    hotel_card("result_city", this.value);
  });
});

document.querySelectorAll('.international').forEach(function(button) {
  button.addEventListener('click', function() {
    hotel_card("result_inter", this.value);
  });
});

hotel_card("result_city", "California");
hotel_card("result_inter", "Japan");

show_btn_login();

datein.value = new Date().toLocaleDateString('en-CA');
let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
let tomorrowString = tomorrow.toLocaleDateString('en-CA');
dateout.value = tomorrowString

searchbutton.addEventListener("click", searchHotels); // Add click event listener to the button