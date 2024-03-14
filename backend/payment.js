const api = "http://127.0.0.1:8000";

// Function to extract URL parameters
const urlParams = new URLSearchParams(window.location.search);
const price = urlParams.get('price');
const discount = urlParams.get('discount');
const code = urlParams.get('paycode');
const finalprice = urlParams.get('finalprice');
const reserveid = urlParams.get('reserveid');
const name = urlParams.get('name');
const number = urlParams.get('number');
const email = urlParams.get('email');

const pageroomprice = document.getElementById("roomprice");
const pageroomdiscount = document.getElementById("roomdiscount");
const pageroomfinalprice = document.getElementById("roomfinalprice");
const pagereserveid = document.getElementById("reserveid");
const pageusername = document.getElementById("username");
const pageuserdetail = document.getElementById("userdetail");
const pageusernum = document.getElementById("usernum");
const pageuseremail = document.getElementById("useremail");

const inputNum = document.getElementById('inputNum');
const inputExp = document.getElementById('inputExp');
const inputCVV = document.getElementById('inputCVV');
const inputCardname = document.getElementById('inputCardname');
const paybutton = document.getElementById("paybutton");

async function setpage(){
    pageroomprice.textContent = `$ ${price}`;
    pageroomdiscount.textContent = `$ ${discount}`;
    pageroomfinalprice.textContent = `$ ${finalprice}`;
    pagereserveid.textContent = reserveid;
    pageusername.textContent = name;
    pageuserdetail.textContent = name;
    pageusernum.textContent = number;
    pageuseremail.textContent = email;
}

async function pay(){
    cardnum = inputNum.value.trim();
    cardexp = inputExp.value.trim();
    cardcvv = inputCVV.value.trim();
    cardname = inputCardname.value.trim();

    if (cardnum === '' || cardexp === '' || cardcvv === '' || cardname === ''){
        alert("Please enter information!");
        return;
    }

    const paymentData = {
        reservation_id: reserveid,
        discount_code: code,
    };
    console.log(paymentData);
    try {
        const response = await fetch(`${api}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        if (response.ok) {
            // Payment successful, handle accordingly
            console.log("Payment successful");
            window.location.href = 'paymentredirect.html';
        } else {
            // Handle error responses from the server
            console.error("Payment failed");
        }
    } catch (error) {
        // Handle network errors or exceptions
        console.error("Error occurred while processing payment:", error);
    }
}

paybutton.addEventListener('click', pay);
setpage();