const api = "http://127.0.0.1:8000";

// Function to extract URL parameters
const urlParams = new URLSearchParams(window.location.search);
const encodedName = urlParams.get('name');
const encodedRoom = urlParams.get('room');
const encodedDatein = urlParams.get('datein');
const encodedDateout = urlParams.get('dateout');
const encodedGuest = urlParams.get('guest');
const hotelname = decodeURIComponent(encodedName);
const roomdetail = decodeURIComponent(encodedRoom);
const checkin = decodeURIComponent(encodedDatein);
const checkout = decodeURIComponent(encodedDateout)
const guest = decodeURIComponent(encodedGuest)

// Process the data as needed

const pagehotelname = document.getElementById("hotel-name");
const pagelocation = document.getElementById("hotel-location");
const pageroomguest = document.getElementById("room-guest");
const pageroomname = document.getElementById("room-name");
const pagedatein = document.getElementById("datein");
const pagedateout = document.getElementById("dateout");
const pageroomprice = document.getElementById("room-price");
const pageroomdiscount = document.getElementById("room-discount");
const codeinput = document.getElementById("inputCode");
const coderedeembutton = document.getElementById("redeem-button");
const pagetotalprice = document.getElementById("total-price");
const pagejumpbutton = document.getElementById("jumpbutton");
const inputname = document.getElementById("inputName");
const inputemail = document.getElementById("inputEmail");
const inputnumber = document.getElementById("inputNumber");

//Function
async function current_user(){
    const userresponse = await fetch(`${api}/currentuser`); // Fetch data from '/hotel' endpoint
    const userdata = await userresponse.json(); // Parse the JSON response
    
    if(userdata === null){
        window.location.href = "login.html"
    }
}

async function setpage(){
    const hotelresponse = await fetch(`${api}/search_by_name?name=${hotelname}`); // Fetch data from '/hotel' endpoint
    const hotelData = await hotelresponse.json(); // Parse the JSON response
    pagehotelname.textContent = hotelData._Hotel__name;
    pagelocation.textContent = `${hotelData._Hotel__location._Location__city} / ${hotelData._Hotel__location._Location__country}`;

    const roomresponse = await fetch(`${api}/search_room_by_name?hotel_name=${hotelname}&room_name=${roomdetail}`);
    const roomData = await roomresponse.json();
    console.log(roomData);

    pageroomguest.textContent = `${roomData._Room__guests} Guest(s)`;
    pageroomname.textContent = roomData._Room__detail;
    pagedatein.textContent = checkin;
    pagedateout.textContent = checkout;
    pageroomprice.textContent = `THB ${roomData._Room__price}`
    pageroomdiscount.textContent = `THB 0`
    pagetotalprice.textContent = `THB ${roomData._Room__price}`
}

async function checkdiscount(){   
    const hotelresponse = await fetch(`${api}/search_by_name?name=${hotelname}`); // Fetch data from '/hotel' endpoint
    const hotelData = await hotelresponse.json(); // Parse the JSON response
    const roomresponse = await fetch(`${api}/search_room_by_name?hotel_name=${hotelname}&room_name=${roomdetail}`);
    const roomData = await roomresponse.json();
    const code = codeinput.value.trim();
    console.log(hotelData._Hotel__name)
    console.log(roomData._Room__detail)
    console.log(code)
    console.log(checkin)
    console.log(roomData._Room__discount._Discount__code)
    const response = await fetch(`${api}/check_discount?hotel_name=${hotelData._Hotel__name}&room_detail=${roomData._Room__detail}&code=${code}&date=${checkin}`);
    if (!response.ok) {
        alert("Discount not found");
        return;
    }
    const data = await response.json(); // Parse the JSON response
    console.log(data);
    roomdiscount = roomData._Room__price * data._Discount__amount;
    finalprice = roomData._Room__price * (1 - data._Discount__amount);
    pageroomdiscount.textContent = `THB ${roomdiscount}`;
    pagetotalprice.textContent = `THB ${finalprice}`;
}

async function paymentredirect(){
    const roomresponse = await fetch(`${api}/search_room_by_name?hotel_name=${hotelname}&room_name=${roomdetail}`);
    const roomData = await roomresponse.json();
    const hotelresponse = await fetch(`${api}/search_by_name?name=${hotelname}`); // Fetch data from '/hotel' endpoint
    const hotelData = await hotelresponse.json();
    username = inputname.value.trim();
    useremail = inputemail.value.trim();
    usernumber = inputnumber.value.trim();
    if(username === '' || useremail === '' || usernumber === ''){
        alert("Please enter information!");
        return;
    }
    //-------------------------Get Discount--------------------------
    const code = codeinput.value.trim();
    let paycode
    payprice = roomData._Room__price
    paydiscount = 0
    payfinalprice = roomData._Room__price
    if(code.length != 0){
        const discountresponse = await fetch(`${api}/check_discount?hotel_name=${hotelData._Hotel__name}&room_detail=${roomData._Room__detail}&code=${code}&date=${checkin}`);
        if (!discountresponse.ok) {
            alert("Discount not found");
            return;
        }
        const discountdata = await discountresponse.json(); // Parse the JSON response
        console.log(discountdata);
        paycode = code;
        paydiscount = roomData._Room__price * discountdata._Discount__amount;
        payfinalprice = roomData._Room__price * (1 - discountdata._Discount__amount);
    }
    //-----------------------------------------------------------------------
    
    //---------------------Make Reservation----------------------
    const reserveresponse = await fetch(`${api}/reservation/?hotel_id=${hotelData._Hotel__id}&detail=${roomData._Room__detail}&start=${checkin}&end=${checkout}`);
    const reservedata = await reserveresponse.json();
    console.log(reservedata);
    //-------------------------------------------------------

    // Roomprice
    // Roomdiscount
    // Roomfinalprice
    // ReserveID
    // Name
    // Number
    // Email

    window.location.href = `payment.html?price=${payprice}&discount=${paydiscount}&paycode=${code}&finalprice=${payfinalprice}&reserveid=${reservedata.ID}&name=${username}&number=${usernumber}&email=${useremail}`
    return;
}

coderedeembutton.addEventListener("click", checkdiscount);
pagejumpbutton.addEventListener("click", paymentredirect);
current_user();
setpage();