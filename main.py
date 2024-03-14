import datetime 
from datetime import date
import uvicorn
from typing import Optional
from fastapi import FastAPI, HTTPException
import re 
regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

app = FastAPI()

class HotelReservationSystem:
    def __init__(self):
        self.__hotel = []
        self.__user = []
        self.__country = []
        self.__city = []
        self.__payment = []
        self.__current_user = None
    
    @property
    def hotel(self):
        return self.__hotel
    
    @hotel.setter
    def hotel(self, hotel: object):
        self.__hotel.append(hotel)
    
    @property
    def user(self):
        return self.__user
    
    @user.setter
    def user(self, user: object):
        self.__user.append(user)
    
    @property
    def country(self):
        return self.__country
    
    @country.setter
    def country(self, country: object):
        self.__country.append(country)
    
    @property
    def city(self):
        return self.__city
    
    @city.setter
    def city(self, city: object):
        self.__city.append(city)
    
    @property
    def payment(self):
        return self.__payment
    
    @payment.setter
    def payment(self, payment):
        self.__payment.append(payment)

    @property
    def current_user(self):
        return self.__current_user
    
    @current_user.setter
    def current_user(self, user):
        self.__current_user = user
    
    # utility function
    def check(self, email):
        if(re.fullmatch(regex, email)):
            return True
 
        else:
            return False
    
    def str_to_datetime(self, date: str) -> object: # date form: dd-mm-yy
        date = date.split('-')
        return datetime.date(int(date[2]), int(date[1]), int(date[0]))

    def search_user_by_id(self, id: int) -> object:
        for user in self.__user:
            if id == user.user_id:
                return user
        return None
    
    def search_hotel_by_id(self, id: int) -> object:
        for hotel in self.__hotel:
            if id == hotel.id:
                return hotel
        return None
    
    def search_hotel_by_name(self, name: str) -> object:
        for hotel in self.__hotel:
            if hotel.name.upper() == name.upper():
                return hotel
        return None
    
    def search_hotel_by_location(self, location:str):
        hotels = []
        for hotel in self.__hotel:
            if hotel.location.city.upper() == location.upper() or hotel.location.country.upper() == location.upper():
                hotels.append(hotel)
        return hotels

    def not_overlap(self, start1:object, end1:object, start2:object, end2:object) -> bool:
        if (start1 < start2 and end1 < start2) or (start1 > end2):
            return True
        else:
            return False
    
    def is_overlap(self, start1:object, end1:object, start2:object, end2:object) -> bool:
        if (start1 < start2 and end1 < start2) or (start1 > end2):
            return False
        else:
            return True
    
    # api function

    def index_search(self, name: str, dayin: str, dayout: str, guest: int):
        dayin = dayin.split('-')
        dayin = datetime.date(int(dayin[0]), int(dayin[1]), int(dayin[2]))
        dayout = dayout.split('-')
        dayout = datetime.date(int(dayout[0]), int(dayout[1]), int(dayout[2]))
        room_price = 999999999
        hotel = None
        for hotels in self.__hotel:
            if hotels.name.upper() == name.upper() or hotels.location.city.upper() == name.upper() or hotels.location.country.upper() == name.upper():
                for rooms in hotels.room:
                    if rooms.price < room_price and rooms.guests >= guest and rooms.is_available(dayin,dayout):
                        hotel = hotels
        return hotel
    
    def search(self, name: str, dayin: str, dayout: str, guest: int):
        dayin = dayin.split('-')
        dayin = datetime.date(int(dayin[0]), int(dayin[1]), int(dayin[2]))
        dayout = dayout.split('-')
        dayout = datetime.date(int(dayout[0]), int(dayout[1]), int(dayout[2]))
        hotel = []
        for hotels in self.__hotel:
            if hotels.name.upper() == name.upper() or hotels.location.city.upper() == name.upper() or hotels.location.country.upper() == name.upper():
                for rooms in hotels.room:
                    if rooms.guests >= guest and rooms.is_available(dayin,dayout):
                        hotel.append(hotels)
        return hotel
    
    def search_room_by_name(self, hotel_name, room_name):
        for hotels in self.__hotel:
            if hotels.name.upper() == hotel_name.upper():
                for rooms in hotels.room:
                    if rooms.detail.upper() == room_name.upper():
                        return rooms

    def show_user(self, id:int) -> dict:
        user = self.search_user_by_id(id)
        result = {}
        result["My account"] = {
            "Name" : user.name,
            "Telephone" : user.telephone,
            "Email" : user.email
        }
        result["My Booking"] = user.reservation
        result["Purchase List"] = user.receipt
        return user
    
    def get_recommendations(self, name: str):
        recommendations = []
        hotel = None
        for hotels in self.__hotel:
            if hotels.name.upper() == name.upper():
                hotel = hotels
        for hotels in self.__hotel:
            if ((hotels.location.country == hotel.location.country) or (hotels.location.city == hotel.location.city)) and (hotels.name != hotel.name):
                recommendations.append(hotels)
        return recommendations
    
    def search_hotel(self, start:str, end:str, guest:int = 1, country:str = None, city:str = None, price:int = "0-40000", ratings:int = "0-1-2-3-4-5") -> dict:
        hotel_list = []
        start = self.str_to_datetime(start)
        end = self.str_to_datetime(end)
        price = [int(number) for number in price.split('-')]
        ratings = [int(number) for number in ratings.split('-')]
        for hotel in self.__hotel:
            if country != hotel.location.country and country != None:
                continue
            if city != hotel.location.city and city != None:
                continue
            if hotel.cheapest_room().price < price[0] or hotel.cheapest_room().price > price[1]:
                continue
            check_rate = False
            for rate in ratings:
                if round(hotel.average_rating()) == rate:
                    check_rate = True
            if check_rate == False:
                continue
            for room in hotel.room:
                if hotel in hotel_list:
                    break
                if room.guests < guest:
                    continue
                if room.reservation == []:
                    hotel_list.append(hotel)
                    break
                available = False
                for resevation in room.reservation:
                    if self.is_overlap(start, end, resevation.date_in, resevation.date_out) == False:
                        available = True
                    else:
                        available = False
                if available:
                    hotel_list.append(hotel)
        result = {}
        for hotel in hotel_list:
            result[hotel.name] = {
                "Rating" : hotel.average_rating(),
                "Location" : hotel.location.country + ", " + hotel.location.city,
                "Price" : hotel.cheapest_room().price
            }
        return result

    def get_hotel_details(self, name: str, start: str, end: str):
        start = start.split('-')
        start = datetime.date(int(start[2]), int(start[1]), int(start[0]))
        end = end.split('-')
        end = datetime.date(int(end[2]), int(end[1]), int(end[0]))
        selected_hotel = None
        for hotel in self.__hotel:
            if name == hotel.name:
                selected_hotel = hotel
                link = hotel.location.map
                recommended_hotel = []

                for rec in self.__hotel:
                    if hotel.location.city == rec.location.city and rec != selected_hotel:
                        available_rooms = [room for room in rec.room if room.is_available(start, end)]
                        if available_rooms:
                            recommended_price = min([room.price for room in available_rooms])
                            discounted_price = min([room.final_price for room in available_rooms if room.discount is not None])

                            recdict = {
                                "Name": rec.name,
                                "Location": rec.location.city,
                                "Rating": rec.average_rating(),
                                "Price": recommended_price,
                                "Discounted price": discounted_price
                            }
                            recommended_hotel.append(recdict)
                available_rooms = []
                for room in selected_hotel.room:
                    if room.is_available(start, end):
                        if room.final_price == room.price:
                            final_price = "No available discount"
                        else:
                            final_price = room.final_price
                        room_info = {
                            'Detail': room.detail,
                            'Price': room.price,
                            'Discounted Price': final_price,
                            'Guests': room.guests
                        }
                        available_rooms.append(room_info)
                your_select = {
                    'Name': selected_hotel.name,
                    'Location': selected_hotel.location.city,
                    'Map': link,
                    'Available Room': available_rooms,
                    'Feedback': [{'User': feedback.user,
                                'Comment': feedback.comment,
                                'Rating': feedback.rating,
                                'Time': feedback.time} for feedback in selected_hotel.feedback]
                }
                final_result = {'Hotel': your_select, 'Recommend nearby hotels': recommended_hotel}
                return final_result
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    def get_available_room(self, hotel_name, dayin, dayout, guest:int):
        dayin = dayin.split('-')
        dayin = datetime.date(int(dayin[0]), int(dayin[1]), int(dayin[2]))
        dayout = dayout.split('-')
        dayout = datetime.date(int(dayout[0]), int(dayout[1]), int(dayout[2]))
        available_room = []
        for hotels in self.__hotel:
            if hotels.name.upper() == hotel_name.upper():
                for rooms in hotels.room:
                    if guest <= rooms.guests:
                        if len(rooms.reservation) == 0:
                            available_room.append(rooms)
                        else:
                            for reservations in rooms.reservation:
                                if self.not_overlap(reservations.date_in, reservations.date_out, dayin, dayout) and (rooms not in available_room):
                                    available_room.append(rooms)
                                if not self.not_overlap(reservations.date_in, reservations.date_out, dayin, dayout) and (rooms in available_room):
                                    available_room.remove(rooms)
        return available_room
    
    def get_rating(self, name: str):
        for hotels in self.__hotel:
           if hotels.name == name:
               rating = hotels.average_rating()
               total_reviews = len(hotels.feedback)
        return {
            "rating" : rating,
            "total" : total_reviews
        }
    
    def check_discount(self, hotel_name, room_detail, code, date):
        date = date.split('-')
        date = datetime.date(int(date[0]), int(date[1]), int(date[2]))
        for hotels in self.__hotel:
           if hotels.name.upper() == hotel_name.upper():
               for rooms in hotels.room:
                   if rooms.detail.upper() == room_detail.upper():
                       if rooms.discount != None:
                            if rooms.discount.code == code:
                                    if date <= rooms.discount.expiration:
                                        return rooms.discount
        raise HTTPException(status_code=400, detail="Error")
                           
    def create_reservation(self, hotel_id : int, room_detail : str, start : str, end : str) -> dict:  #hotel id, room name, userid, in, out
        today = date.today()
        if self.current_user == None:
            return None
        if start == end or start > end:
            raise HTTPException(status_code=400, detail="Invalid Date")
        for hotels in self.__hotel:
            if hotel_id == hotels.id: 
                for rooms in hotels.room:
                    if room_detail == rooms.detail:      
                        start = start.split('-')
                        start = datetime.date(int(start[0]), int(start[1]), int(start[2]))
                        end = end.split('-')
                        end = datetime.date(int(end[0]), int(end[1]), int(end[2]))
                        if start < today or end < today:
                            raise HTTPException(status_code=400, detail="Invalid Date")
                        if  (rooms.is_available(start,end)):
                            data = Reservation(self.current_user.name, start, end)
                            data.hotel_id = hotels.id
                            data.room_detail = room_detail
                            data.hotel_name = hotels.name
                            self.current_user.cart = data
                            return {
                                "ID" : data.id,
                                "Hotel" : hotels,
                                "Room" : rooms,
                                "User" : self.current_user.name,
                                "Start_date" : data.date_in,
                                "End_date" : data.date_out,
                                "Price" : rooms.price,
                                "Detail" : rooms.detail,
                                "Guests" : rooms.guests,
                                "Hotel_Rating" : hotels.average_rating(),
                                "Location":hotels.location,
                                "Image": hotels.imgsrc
                            }
                        raise HTTPException(status_code=404, detail="Room Not Available")
                raise HTTPException(status_code=404, detail="Room Not Found")
        raise HTTPException(status_code=404, detail="Hotel ID Not Found")
    
        # Validate - Checked
    
    def cancel_reservation(self, reservation_id : int):
        user = self.current_user
        if self.current_user == None:
            return "User Not login"
        for reservation in user.reservation:
                    if reservation.id == reservation_id:
                        user.cancel_reservation(reservation)
                        hotel = reservation.hotel_id
                        for hotels in self.__hotel:
                            if hotels.id == hotel:
                                for rooms in hotels.room:
                                    for reservations in rooms.reservation:
                                        if reservations.id == reservation_id:
                                            rooms.cancel_reservation(reservation)
                                            return "Cancelled Reservation"
        raise HTTPException(status_code=404, detail="Not Your Reservation ID")

    def sign_up(self, user_name, user_password, phone_number, email):
            email_check = self.check(email)
            if email_check == False:
                raise HTTPException(status_code=400, detail="Invalid Email form")
            for user in self.__user:
                if user.email == email:
                    raise HTTPException(status_code=400, detail="This Email has already been used")
            if len(user_password) < 8:
                raise HTTPException(status_code=400, detail="Password must have at least 8 characters")
            if len(phone_number) != 10:
                raise HTTPException(status_code=400, detail="Invalid telephone number form")
            data = User(user_name, user_password, phone_number, email, "customer")
            self.user = data
            return {"User Name": user_name,"Tel.": phone_number,"Status": "Sign up successfully"}
            
    def log_in(self, email, user_password):
        if self.__current_user == None:
            for user in self.__user:
                if user.email == email:
                    if user.password == user_password:
                        self.__current_user = user
                        return user
                    elif user.password != user_password:
                        raise HTTPException(status_code=400, detail="Incorrect Password!")
            raise HTTPException(status_code=400, detail="This Email didn't sign up yet!")
        raise HTTPException(status_code=400, detail="You are already logged in!")
    
    def log_out(self):
         if self.__current_user != None:
            self.__current_user = None
            return "Logged out"
         return "You are not logged in"
    
    def change_user_info(self, new_name:str, new_password:str):
      
        user = self.__current_user
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must have at least 8 characters")
        user.name = new_name
        user.password = new_password
        return {
            "Name": user.name,
            "Password": user.password,
        }
    
    def change_reservation(self, reservation_id : int, new_date_in : str, new_date_out : str) -> dict:
        today = date.today()
        if self.current_user != None:
                for reservation in self.current_user.reservation:
                    if reservation.id == reservation_id:
                        new_date_in = new_date_in.split('-')
                        new_date_in = datetime.date(int(new_date_in[0]), int(new_date_in[1]), int(new_date_in[2]))
                        new_date_out = new_date_out.split('-')
                        new_date_out = datetime.date(int(new_date_out[0]), int(new_date_out[1]), int(new_date_out[2]))
                        if(new_date_out <= new_date_in ):
                            raise HTTPException(status_code=400, detail="Invalid Date")
                        if new_date_in < today or new_date_out < today:
                            raise HTTPException(status_code=400, detail="Invalid Date")
                        
                        for hotels in self.__hotel:    
                            if hotels.id == reservation.hotel_id:
                                for rooms in hotels.room:
                                    if reservation.room_detail == rooms.detail:
                                        if rooms.is_available(new_date_in,new_date_out):                   
                                            old_reservation_date_in = reservation.date_in
                                            old_reservation_date_out = reservation.date_out
                                            reservation.date_in = new_date_in
                                            reservation.date_out = new_date_out
                                            return {
                                                "Your Old Check in Date: " : old_reservation_date_in,
                                                "Your Old Check out Date: ": old_reservation_date_out,
                                                "Your New Check in Date:": reservation.date_in,
                                                "Your New Check out Date": reservation.date_out
                        }
                                        raise HTTPException(status_code=400, detail="Room Not Available")
                                raise HTTPException(status_code=400, detail="Invalid Hotel")
                raise HTTPException(status_code=404, detail="No Reservation ID")
        raise HTTPException(status_code=404, detail="User Not Found")
    
        # Validate - Checked
    
    def find_cheapest_room_for_guest(self, hotelname: str, guest: int):
        for hotels in self.__hotel:
            if hotels.name.upper() == hotelname.upper():
                price = 9999999
                recommendedroom = None
                for rooms in hotels.room:
                    if rooms.price < price and rooms.guests >= guest:
                        price = rooms.price
                        recommendedroom = rooms
                return recommendedroom
                    
    
    def add_payment(self, reservation_id : int, discount_code: Optional[str] = None) -> dict:
        if self.current_user == None:
            return "User Not login"
        user = self.current_user
        if user.cart == None:
            return "Cart empty"
        if user.cart.id == reservation_id:
            hotel = self.search_hotel_by_id(user.cart.hotel_id)
            if hotel != None:
                room = hotel.search_room_by_name(user.cart.room_detail)
                price = room.price
                if discount_code:
                    if not room.discount or room.discount.code != discount_code:
                        raise HTTPException(status_code=400, detail="Invalid discount code")

                    discounted_amount = room.price * room.discount.amount
                    price -= discounted_amount
                self.__payment.append(Payment(user.user_id, price, hotel.name, room.detail))
                room.reservation = user.cart
                user.reservation = user.cart
                reserveid = room.reservation[-1].id
                paydate = datetime.date.today()
                user.cart = None
                user.receipt = Receipt(user.name, hotel.name, room.detail, price, room.reservation[-1].date_in,room.reservation[-1].date_out)
                return {
                    "Name" : user.name,
                    "Reservation ID" : reserveid,
                    "Hotel" : hotel.name,
                    "Room" : room.detail,
                    "Check in Date" : room.reservation[-1].date_in,
                    "Check out Date" : room.reservation[-1].date_out,
                    "Payment Date" : paydate,
                    "Total Price" : price
                }
            raise HTTPException(status_code=404, detail="Hotel not found")
        raise HTTPException(status_code=400, detail="Invalid Reservation ID")
        # Validate - Checked 

    def add_feedback(self, hotel_name: str, comment: str, rating: int):
        time = date.today()
        user = self.__current_user
        if user == None:
            raise HTTPException(status_code=404, detail="User Not login")
        if rating < 0 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be 0 to 5 with full number")
        for reservation in user.reservation: 
            if reservation.date_out < time:
                for hotel in self.__hotel:
                    if reservation.hotel_name == hotel_name: 
                        if reservation.reviewed_status == False:
                            if rating <= 5:
                                feedback = Feedback(user.name, comment, rating, time)
                                hotel.feedback = feedback
                                reservation.toggle_status()
                                return {
                                    "User": user.name,
                                    "Hotel": hotel.name,
                                    "Comment": comment,
                                    "Rating": rating,
                                    "Time": time
                                }
                            raise HTTPException(status_code=400, detail="Rating must be in between 0-5!")
                        raise HTTPException(status_code=400, detail="Already Reviewed!")
        raise HTTPException(status_code=400, detail="No completed reservations for feedback")   

    def add_hotel(self, hotel_name: str, location_country: str, location_city : str, location_map: str, image:str):
        if self.current_user == None:
            raise HTTPException(status_code=403, detail="Please Login")
        if self.current_user.type != "admin":
            raise HTTPException(status_code=403, detail="No Permission")
        for hotels in self.__hotel:
            if hotels.name.upper() == hotel_name.upper():
                raise HTTPException(status_code=403, detail="Hotel name already exists")
        new_hotel = Hotel(hotel_name,Location(location_country,location_city,location_map))
        self.hotel = new_hotel
        new_hotel.imgsrc = image
        return {"HotelID" : self.__hotel[-1]}
         
    def add_room(self, hotel_name: str, detail: str, price: int, guests: int, image:str):
        if self.current_user == None:
            raise HTTPException(status_code=403, detail="Please Login")
        if self.current_user.type != "admin":
            raise HTTPException(status_code=403, detail="No Permission")
        for hotel in self.__hotel:
            if hotel.name == hotel_name:
                for rooms in hotel.room:
                    if rooms.detail.upper() == detail.upper():
                        raise HTTPException(status_code=403, detail="Room already exists")
                new_room = Room(detail,price,guests)
                hotel.room = new_room
                hotel.room[-1].rooms_image = image
                hotel.room[-1].discount = Discount("New",0.01,datetime.date(3000,12,12))
                return "Success",{"Your Hotel":hotel}
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    def add_discount(self, hotel_name: str, detail: str, discount_code: str, discount_amount: float, discount_expiration: str):
        discount_expiration = discount_expiration.split('-')
        discount_expiration = datetime.date(int(discount_expiration[0]),int(discount_expiration[1]),int(discount_expiration[2]))
        if self.current_user == None:
            raise HTTPException(status_code=403, detail="Please Login")
        if self.current_user.type != "admin":
            raise HTTPException(status_code=403, detail="No Permission")
        if discount_amount > 1:
            raise HTTPException(status_code=403, detail="Discount must not be higher than 1")
        for hotel in self.__hotel:
            if hotel.name.upper() == hotel_name.upper():
                for room in hotel.room:
                    if room.detail.upper() == detail.upper():
                        discount = Discount(discount_code, discount_amount, discount_expiration)
                        room.discount = discount
                        return "Success",{"Your Hotel":hotel}
        raise HTTPException(status_code=404, detail="Hotel not found")

    def edit_room(self, hotel_name: str, room_detail: str, new_price: int):
        if self.current_user == None:
            raise HTTPException(status_code=403, detail="Please Login")
        if self.current_user.type != "admin":
            raise HTTPException(status_code=403, detail="No Permission")
        hotel = self.search_hotel_by_name(hotel_name) 
        if hotel is not None:
            room = hotel.search_room_by_name(room_detail)   
            if room is not None:
                room.price = new_price
                return room
            else:
                raise HTTPException(status_code=404, detail="Room not found")
        else:
            raise HTTPException(status_code=404, detail="Hotel not found")
        
    def edit_hotel(self, hotel_name: str, country: str, city: str, maps: str , imgsrc: str):
        if self.current_user == None:
            raise HTTPException(status_code=403, detail="Please Login")
        if self.current_user.type != "admin":
            raise HTTPException(status_code=403, detail="No Permission")
        hotel = self.search_hotel_by_name(hotel_name)
        if hotel is not None:
            hotel.name = hotel_name
            hotel.location.country = country
            hotel.location.city = city
            hotel.location.map = maps
            hotel.imgsrc = imgsrc
            return hotel
        else:
            raise HTTPException(status_code=404, detail="Hotel not found")
  
    def remove_hotel(self, hotel_name: str):
        if self.current_user == None:
            raise HTTPException(status_code=403, detail="Please Login")
        if self.current_user.type != "admin":
            raise HTTPException(status_code=403, detail="No Permission")
        hotel = self.search_hotel_by_name(hotel_name)
        if hotel is not None:
            self.__hotel.remove(hotel)
            return "Hotel removed"
        else:
            raise HTTPException(status_code=404, detail="Hotel not found")

    def remove_room(self, hotel_name: str, room_detail: str):
        if self.current_user == None:
            raise HTTPException(status_code=403, detail="Please Login")
        if self.current_user.type != "admin":
            raise HTTPException(status_code=403, detail="No Permission")
        hotel = self.search_hotel_by_name(hotel_name)
        if hotel is not None:
            room = hotel.search_room_by_name(room_detail)
            if room is not None:
                hotel.room.remove(room)
                return "Room removed"
            else:
                raise HTTPException(status_code=404, detail="Room not found")
        else:
            raise HTTPException(status_code=404, detail="Hotel not found")

class Hotel:
    __code = 0
    def __init__(self, name, location:object):
        Hotel.__code += 1
        self.__id = Hotel.__code
        self.__name = name
        self.__location = location
        self.__rooms = []
        self.__feedback = []
        self.__imgsrc = []
    
    @property
    def id(self):
        return self.__id
    
    @property
    def name(self):
        return self.__name
    
    @name.setter
    def name(self, name):
        self.__name = name
    
    @property
    def location(self):
        return self.__location
    
    @property
    def room(self):
        return self.__rooms
    
    @room.setter
    def room(self, room:object):
        self.__rooms.append(room)
    
    @property
    def feedback(self):
        return self.__feedback
    
    @feedback.setter
    def feedback(self, feedback:object):
        self.__feedback.append(feedback)

    @property
    def imgsrc(self):
        return self.__imgsrc
    
    @imgsrc.setter
    def imgsrc(self, link):
        self.__imgsrc.append(link)

    def cheapest_room(self):
        min_price = 40000
        result = None
        for room in self.__rooms:
            if room.price < min_price:
                min_price = room.price
                result = room
        return result
    
    def average_rating(self):
        if len(self.__feedback) == 0:
            return "N/A"
        return round((sum(feedback.rating for feedback in self.__feedback) / len(self.__feedback)),2)
    
    def search_room_by_name(self, name):
        for rooms in self.__rooms:
            if rooms.detail == name:
                return rooms
    
class Location:
    def __init__(self, country:str, city:str, map):
        self.__country = country
        self.__city = city
        self.__map = map

    @property
    def country(self):
        return self.__country
    
    @country.setter
    def country(self, country):
        self.__country = country
    
    @property
    def city(self):
        return self.__city
    
    @city.setter
    def city(self, city):
        self.__city = city
    
    @property
    def map(self):
        return self.__map
    
    @map.setter
    def map(self, map):
        self.__map = map

class Room:
    def __init__(self, detail:str, price:int, guests:int):
        self.__detail = detail
        self.__price = price
        self.__guests = guests
        self.__reservation = []
        self.__discount = Discount('0',0,datetime.date(3000,12,31))
        self.__rooms_image = None
    
    @property
    def detail(self):
        return self.__detail
    
    @property
    def price(self):
        return self.__price
    
    @price.setter
    def price(self, price):
        self.__price = price

    @property
    def guests(self):
        return self.__guests
    
    @guests.setter
    def guests(self, guests):
        self.__guests = guests
    
    @property
    def reservation(self):
        return self.__reservation

    def price_with_discount(self):
        if self.__discount == None:
            return self.__price
        price = self.price * (1 - self.__discount.amount)
        return price
    
    def is_available(self,start,end):
        for reservations in self.__reservation:
            reservestart = reservations.date_in
            reserveend = reservations.date_out
            if (HotelReservationSystem.is_overlap(HotelReservationSystem,start, end, reservestart,reserveend)):
                return False
        return True
    
    def cancel_reservation(self,reserve):
         self.__reservation.remove(reserve)

    @property
    def available(self):
        return self.__is_available
    
    @property
    def toggle(self):
        self.__is_available = not self.__is_available
    
    @property
    def discount(self):
        return self.__discount

    @reservation.setter
    def reservation(self, reservation:object):
        self.__reservation.append(reservation)

    @discount.setter
    def discount(self, discount: object):
        self.__discount = discount

    @property
    def rooms_image(self):
        return self.__rooms_image
    
    @rooms_image.setter
    def rooms_image(self, link:str):
        self.__rooms_image = link

class Reservation:
    __code = 0
    def __init__(self, user:object, date_in:object, date_out:object):
        Reservation.__code += 1
        self.__id = Reservation.__code
        self.__user = user
        self.__date_in = date_in
        self.__date_out = date_out
        self.__hotel_id = None
        self.__room_detail = None
        self.__hotel_name = None
        self.__reviewed_status = False

    @property
    def id(self):
        return self.__id

    @property
    def user(self):
        return self.__user 
    
    @property
    def date_in(self):
        return self.__date_in
    
    @date_in.setter
    def date_in(self, date):
        self.__date_in = date
    
    @property
    def hotel_name(self):
        return self.__hotel_name
    
    @hotel_name.setter
    def hotel_name(self,hotel):
        self.__hotel_name = hotel

    @property
    def date_out(self):
        return self.__date_out
    
    @date_out.setter
    def date_out(self, date):
        self.__date_out = date

    @property
    def hotel_id(self):
        return self.__hotel_id
    
    @property
    def room_detail(self):
        return self.__room_detail
    
    @hotel_id.setter
    def hotel_id(self,hotel_id):
        self.__hotel_id = hotel_id
    
    @room_detail.setter
    def room_detail(self,room_detail):
        self.__room_detail = room_detail

    @property
    def reviewed_status(self):
        return self.__reviewed_status

    def toggle_status(self):
        self.__reviewed_status = True

class User:
    __code = 0
    def __init__(self, name:str, password:str, telephone:str, email:str, type :str):
        User.__code += 1
        self.__user_id = User.__code
        self.__name = name
        self.__password = password
        self.__telephone = telephone
        self.__email = email
        self.__type = type
        self.__receipt = []
        self.__reservation = []
        self.__cart = None
        
    @property
    def user_id(self):
        return self.__user_id

    @property
    def name(self):
        return self.__name    
    
    @name.setter     
    def name(self, name:str):
        self.__name = name

    @property
    def password(self):
        return self.__password
    
    @password.setter
    def password(self, password:str):
        self.__password = password
    
    @property 
    def telephone(self):
        return self.__telephone
    
    @telephone.setter
    def telephone(self, telephone:str):
        self.__telephone = telephone
    
    @property
    def email(self):
        return self.__email
    
    @email.setter
    def email(self, email:str):
        self.__email = email
    
    @property
    def receipt(self):
        return self.__receipt
    
    @receipt.setter
    def receipt(self, receipt:object):
        self.__receipt.append(receipt)

    @property
    def reservation(self):
        return self.__reservation
        
    @reservation.setter
    def reservation(self,reservation):
        self.__reservation.append(reservation)
    
    @property
    def cart(self):
        return self.__cart
    
    @cart.setter
    def cart(self,cart):
        self.__cart = cart

    def cancel_reservation(self,reserve):
         self.__reservation.remove(reserve)

    @property
    def type(self):
        return self.__type
    
    @type.setter
    def type(self,type):
        self.__type = type

class Admin(User):
    def __init__(self, name: str, password: str, telephone: str):
        super().__init__(name, password, telephone)
        self.__type = "admin"
        self.__email = "admin01@gmail.com"

    @property
    def type(self):
        return self.__type
    
    @property
    def password(self):
        return self.__password
    
    @property
    def telephone(self):
        return self.__telephone
    
    @property
    def email(self):
        return self.__email

class Feedback:
    def __init__(self, user:object, comment:str, rating:int, time:int):
        self.__user = user
        self.__comment = comment
        self.__rating = rating
        self.__time = time
    
    @property
    def user(self):
        return self.__user
    
    @property
    def comment(self):
        return self.__comment
    
    @property
    def rating(self):
        return self.__rating
    
    @property
    def time(self):
        return self.__time

class Payment:
    __code = 0
    def __init__(self, user_id, amount, hotel_name, room):
        Payment.__code += 1
        self.id = Payment.__code
        self.__user = user_id
        self.__amount = amount
        self.__hotel_name = hotel_name
        self.__hotel_room = room

    @property
    def user_id(self):
        return self.__user
    
    @property
    def amount(self):
        return self.__amount
    
    @property
    def hotel(self):
        return self.__hotel_name
    
    @property
    def room(self):
        return self.__hotel_room

class Discount: 
    def __init__(self, code: str, amount, expiration):
        self.__code = code
        self.__amount = amount
        self.__expiration = expiration
    
    @property
    def code(self):
        return self.__code
    
    @property
    def amount(self):
        return self.__amount
    
    @property
    def expiration(self):
        return self.__expiration
    
    @amount.setter
    def amount(self,amount):
        if(amount.isnumeric() and amount <= 1):
            self.__amount = amount

class Receipt:
    def __init__(self,user_name,hotel,room,price,checkin,checkout):
        self.__user_name = user_name
        self.__hotel = hotel
        self.__room = room
        self.__price = price
        self.__checkin = checkin
        self.__checkout = checkout

    @property
    def user(self):
        return self.__user_name
    
    @property
    def hotel(self):
        return self.__hotel
    
    @property
    def room(self):
        return self.__room
    
    @property
    def price(self):
        return self.__price
    
    @user.setter
    def user(self,user_name):
        self.__user_name = user_name
    
    @hotel.setter
    def hotel(self,hotel):
        self.__hotel = hotel
    
    @room.setter
    def room(self,room):
        self.__room = room
    
    @price.setter
    def price(self,price):
        self.__price = price
    
    @property
    def checkin(self):
        return self.__checkin
    
    @checkin.setter
    def checkin(self,checkin):
        self.__checkin = checkin

    @property
    def checkout(self):
        return self.__checkout

    @checkout.setter
    def checkout(self,checkout):
        self.__checkout = checkout