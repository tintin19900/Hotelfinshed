const api = "http://127.0.0.1:8000";

//------------------Add Hotel----------------------
const ah_name = document.getElementById('add-hotel-name');
const ah_country = document.getElementById('add-hotel-country');
const ah_city = document.getElementById('add-hotel-city');
const ah_map = document.getElementById('add-hotel-map');
const ah_img = document.getElementById('add-hotel-image');
const ah_submit = document.getElementById('add-hotel-submit');
//-----------------Add Room----------------------------
const ar_name = document.getElementById('add-room-name');
const ar_detail = document.getElementById('add-room-detail');
const ar_price = document.getElementById('add-room-price');
const ar_guest = document.getElementById('add-room-guest');
const ar_img = document.getElementById('add-room-image')
const ar_submit = document.getElementById('add-room-submit');
//------------------------Add Discount------------------
const ad_name = document.getElementById('add-discount-name');
const ad_detail = document.getElementById('add-discount-detail');
const ad_code = document.getElementById('add-discount-code');
const ad_amount = document.getElementById('add-discount-amount');
const ad_exp = document.getElementById('add-discount-exp');
const ad_submit = document.getElementById('add-discount-submit');
//--------------------------Edit Room---------------------------
const er_name = document.getElementById('edit-room-name');
const er_detail = document.getElementById('edit-room-detail');
const er_price = document.getElementById('edit-room-price');
const er_submit = document.getElementById('edit-room-submit');
//---------------------------Remove Hotel----------------------------
const rh_name = document.getElementById('remove-hotel-name');
const rh_submit = document.getElementById('remove-hotel-submit');
//----------------------------Remove Room----------------------
const rr_name = document.getElementById('remove-room-name');
const rr_detail = document.getElementById('remove-room-details');
const rr_submit = document.getElementById('remove-room-submit');


async function checkcurrentuser(){
    const userresponse = await fetch(`${api}/currentuser`); // Fetch data from '/hotel' endpoint
    const userdata = await userresponse.json(); // Parse the JSON response
    // console.log(userdata._User__type);
    if(userdata === null || userdata._User__type != 'admin'){
        window.location.href = 'index.html';
        alert('No Permission!');
    }
}

async function addhotel(){
    const name = ah_name.value.trim();
    const country = ah_country.value.trim();
    const city = ah_city.value.trim();
    const map = ah_map.value.trim();
    const img = ah_img.value.trim();
    if(name.length === 0 || country.length === 0 || city.length === 0 || map.length === 0){
        alert("Please enter information!");
        return;
    }
    const hotelData = {
        name: name,
        country: country,
        city: city,
        maps: map,
        imgsrc: img
    };
    const response = await fetch(`${api}/admin/add_hotel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(hotelData)
    });

    if (!response.ok) {
        alert('Failed to add hotel')
        throw new Error('Failed to add hotel');
    }

    const data = await response.json();
    console.log(data.HotelID);
    alert('Hotel added successfully.\nYour hotel ID is : ' + data.HotelID._Hotel__id);
    return;
}

async function addroom(){
    const name = ar_name.value.trim()
    const detail = ar_detail.value.trim()
    const price = ar_price.value.trim()
    const guest = ar_guest.value.trim()
    const img = ar_img.value.trim()
    console.log(name+detail+price+guest)
    if(name.length === 0 || detail.length === 0 || price.length === 0 || guest.length === 0 || img === 0){
        alert("Please enter information!");
        return;
    }

    const roomData = {
        detail: detail,
        price: price,
        guest: guest,
        image: img
    };
    const response = await fetch(`${api}/admin/add_room?hotel_name=${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
    });

    if (!response.ok) {
        alert('Failed to add room')
        throw new Error('Failed to add room');
    }

    const data = await response.json();
    alert('Room added successfully');
    return;
}

async function adddiscount(){
    const name = ad_name.value.trim();
    const detail = ad_detail.value.trim();
    const code = ad_code.value.trim();
    const amount = ad_amount.value.trim();
    const exp = ad_exp.value.trim();
    console.log(name+detail+code+amount+exp)
    if(name.length === 0 || detail.length === 0 || code.length === 0 || amount.length === 0 || exp.length === 0){
        alert("Please enter information!");
        return;
    }

    const discountData = {
        discount_code: code,
        discount_amount: parseFloat(amount),
        discount_expiration: exp
    };
    const response = await fetch(`${api}/admin/add_discount?hotel_name=${name}&detail=${detail}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(discountData)
    });

    if (!response.ok) {
        alert('Failed to add discount')
        throw new Error('Failed to add discount');
    }

    const data = await response.json();
    alert('Discount added successfully');
    return;
}

async function editroom(){
    const name = er_name.value.trim();
    const detail = er_detail.value.trim();
    const price = er_price.value.trim();


    const response = await fetch(`${api}/admin/edit-room/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            hotel_name: name,
            room_detail: detail,
            new_price: price
        })
    });
    if (!response.ok) {
        alert('Failed to edited room')
        throw new Error('Failed to edited room');
    }
    alert("Room edited successful");

}

async function removehotel() { 
    const name = rh_name.value.trim()
    try {
        const response = await fetch(`${api}/admin/remove-hotel/?hotel_name=${name}`, {
            method: 'DELETE', // Specify DELETE method for cancellation
            headers: {
            'Content-Type': 'application/json' // Set content type if required by API
            },
            body: JSON.stringify({name}) // Include reservation ID in request body
        });
    
    
        if (!response.ok) { 
            alert("The hotel name is incorrect")
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        alert("Deletion successful")
        window.location.reload();
  
      } catch (error) {
        console.error('Error removeing hotel:', error);
        // Handle errors gracefully (e.g., display a generic error message)
    }
}

async function removeroom() {
    const name = rr_name.value.trim()
    const detail = rr_detail.value.trim()
    if(name.length == 0 || detail.length == 0){
        alert("Please Enter Information!");
        return;
    }
    const response = await fetch(`${api}/admin/remove-room/?hotel_name=${name}&room_detail=${detail}`,
    {
        method: 'DELETE', // Specify DELETE method for cancellation
        headers: {
        'Content-Type': 'application/json' // Set content type if required by API
        },
        body: JSON.stringify({}) // Include reservation ID in request body
    });
    
    if (!response.ok) {
        alert("The hotel name or room name is incorrect")
        throw new Error(`API request failed with status ${response.status}`);
    }   
    
    alert("deletion successful");
    window.location.reload();
}


checkcurrentuser();
ah_submit.addEventListener('click', addhotel);
ar_submit.addEventListener('click', addroom);
ad_submit.addEventListener('click', adddiscount);
er_submit.addEventListener('click', editroom);
rh_submit.addEventListener('click', removehotel);
rr_submit.addEventListener('click', removeroom);
