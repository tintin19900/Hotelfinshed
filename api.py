import datetime 
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nltk import edit_distance

app = FastAPI()

if __name__ == "__main__" :
    uvicorn.run("api:app", host="127.0.0.1", port=8000, log_level="info")

# ----------------------------
import main
import hotel_list
import schema
# ----------------------------
# ---------------------------------------------
# http://127.0.0.1:8000/docs
# uvicorn api:app --reload
# python -m uvicorn api:app --reload

#----------------DON'T TOUCH------------------------#
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)
#----------------DON'T TOUCH------------------------#

@app.get("/")
async def index():
    result = {}
    result["best_location"] = None
    result["best_city"] = None
    result["recommend"] = hotel_list.myHotel.search_hotel('1-1-2000', '2-1-2000')
    return result

#-----------------show user data----------------------------------------
@app.get("/user/")
async def user(id:int):
    return hotel_list.myHotel.show_user(id)

# -------------------make reservation--------------------------
@app.get("/reservation/")
async def create_reservation(hotel_id:int, detail:str, start:str, end:str):
    user_reservation = hotel_list.myHotel.create_reservation(hotel_id, detail, start, end)
    if user_reservation == None:
        return "User Not Login"
    return user_reservation

# ---------------------reservation payment----------------------------
@app.post("/payment")
async def pay(payment_data: schema.Payment):
    payment = hotel_list.myHotel.add_payment( payment_data.reservation_id, payment_data.discount_code)
    return payment

# ------------------------get rating--------------------------------
@app.get('/get_rating')
async def get_rating(name: str):
    rating = hotel_list.myHotel.get_rating(name)
    return rating

# -----------------------search by name----------------------
@app.get('/search_by_name')
async def search_by_name(name: str):
    hotel = hotel_list.myHotel.search_hotel_by_name(name)
    return hotel

# -----------------------search by location----------------------
@app.get('/search_by_location')
async def search_by_location(location: str):
    hotels = hotel_list.myHotel.search_hotel_by_location(location)
    return hotels

# -----------------------handle index search----------------------
@app.get('/index_search')
async def index_search(name: str, dayin, dayout, guest:int):
    result = hotel_list.myHotel.index_search(name, dayin, dayout, guest)
    return result

#--------------------------handle index search------------------------
@app.get('/search')
async def search(name: str, dayin, dayout, guest:int):
    result = hotel_list.myHotel.search(name, dayin, dayout, guest)
    return result

# --------Search Available Room by Hotel's Name----------------
@app.get('/get_available_room')
async def get_available_room(name: str, dayin, dayout, guest:int):
    available_room = hotel_list.myHotel.get_available_room(name, dayin, dayout, guest)
    return available_room

#-----------------Search room by name in hotel------------------
@app.get('/search_room_by_name')
async def search_room_by_name(hotel_name: str, room_name: str):
    room = hotel_list.myHotel.search_room_by_name(hotel_name, room_name)
    return room

#-------------------recommend hotel---------------------------
@app.get('/recommendations')
async def get_recommendations(name: str):
    recommendations = hotel_list.myHotel.get_recommendations(name)
    return recommendations

#----------------check discount code----------------------
@app.get('/check_discount')
async def check_discount(hotel_name, room_detail, code, date):
    discount = hotel_list.myHotel.check_discount(hotel_name, room_detail, code, date)
    return discount

#----------------------find cheapest room for guest--------------
@app.get('/cheapest_for_guest')
async def find_cheapest_room_for_guest(hotelname: str, guest: int):
    cheapest_room = hotel_list.myHotel.find_cheapest_room_for_guest(hotelname, guest)
    return cheapest_room

@app.put('/change')
async def change_reservation(change_reservation: schema.ChangeReservation):
    change_reservation = hotel_list.myHotel.change_reservation( change_reservation.reservation_id, change_reservation.date_in, change_reservation.date_out)
    return change_reservation

@app.post('/feedback')
async def add_feedback(review: schema.Review):
    add_feedback = hotel_list.myHotel.add_feedback(review.hotel_name, review.comment, review.rating)
    return add_feedback

@app.post('/user/sign_up')
async def sign_up(sign_up: schema.Sign_up):
    sign_up = hotel_list.myHotel.sign_up(sign_up.user_name, sign_up.user_password, sign_up.phone_number, sign_up.email)
    return sign_up
 
@app.post('/user/login')
async def login(login: schema.Login):
    login = hotel_list.myHotel.log_in(login.email, login.user_password)
    return login

@app.get('/user/logout')
async def logout():
    logout = hotel_list.myHotel.log_out()
    return logout

@app.delete('/user/cancel')
async def cancel_reservation(reservation_id: int):
    cancel_reservation = hotel_list.myHotel.cancel_reservation(reservation_id)
    return cancel_reservation

@app.post('/admin/add_hotel')
async def add_hotel( add_hotel: schema.Hotel):
    add_hotel = hotel_list.myHotel.add_hotel(add_hotel.name, add_hotel.country, add_hotel.city, add_hotel.maps, add_hotel.imgsrc)
    return add_hotel

@app.post('/admin/add_room')
async def add_room(hotel_name: str, add_room: schema.Room):
    add_room = hotel_list.myHotel.add_room(hotel_name, add_room.detail, add_room.price, add_room.guest, add_room.image)
    return add_room

@app.post('/admin/add_discount')
async def add_discount(hotel_name:str, detail:str, add_discount: schema.Discount):
    add_discount = hotel_list.myHotel.add_discount(hotel_name, detail, add_discount.discount_code, add_discount.discount_amount, add_discount.discount_expiration)
    return add_discount

@app.put("/admin/edit-room/")
def edit_room( edit_room: schema.RoomEditor):
    edit_room = hotel_list.myHotel.edit_room(edit_room.hotel_name, edit_room.room_detail, edit_room.new_price)
    return edit_room

@app.put('/admin/edit-hotel/')
def edit_hotel(edit_hotel: schema.HotelEditor):
    edit_hotel = hotel_list.myHotel.edit_hotel( edit_hotel.hotel_name, edit_hotel.country, edit_hotel.city, edit_hotel.maps, edit_hotel.imgsrc)
    return edit_hotel

@app.delete('/admin/remove-hotel/')
async def remove_hotel( hotel_name: str):
    remove_hotel = hotel_list.myHotel.remove_hotel(hotel_name)
    return remove_hotel

@app.delete('/admin/remove-room/') 
async def remove_room(hotel_name: str, room_detail: str):
    remove_room = hotel_list.myHotel.remove_room( hotel_name, room_detail)
    return remove_room  

@app.put('/user/change-info/')
def change_user_info(change_user_info: schema.UserInfoEditor):
    change_user_info = hotel_list.myHotel.change_user_info(change_user_info.new_name, change_user_info.new_password)
    return change_user_info

@app.get('/currentuser')
async def get_current_user():
    current_user = hotel_list.myHotel.current_user
    return current_user