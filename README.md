# My Nom Nom API

---
API URL: https://sheltered-brook-64267.herokuapp.com/

---
## Summary
- This API allows the user to (but not limited to) post meal items to a menu table, view those items, manipulate those items, and post those meal items to a meal plan table.
- This API allows retrieving of relevant  data in a meaningful way that can be used in your client app.
- The user needs a JWT token to access protected endpoints.
- To get a JWT token, the user must first register for an account and then login to get the token.
- The JWT token can then be used to access the protected endpoints.
- See the API documentation below for more details.  

---
## Technologies Used

- Node  
  - a JavaScript runtime built on Chrome's V8 JavaScript engine.  


- Express  
  - a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.


- PostgreSQL  
  - a free and open-source relational database management system emphasizing extensibility and SQL compliance.


- Knex  
  - A SQL query builder that is flexible, portable, and fun to use!


- Chai  
  - a BDD / TDD assertion library for [node](http://nodejs.org) and the browser that can be delightfully paired with any javascript testing framework.


- Mocha  
  - a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun.  

---
## API Documentation

### Endpoints
---
### /users
You can use this endpoint to register for an account.  

---
### post &ensp;/users
**Body**   
Data Type: raw JSON  

Required Fields:
- firstname
- lastname
- username
- password  
    - must be longer than 8 chars
    - must be less than 72 chars
    - must not start or end with spaces
    - must contain 1 upper case, lower case, number, and special character


Example Body Request:  
>  {<br/>
  &ensp;&ensp;"firstname": "John",  
  &ensp;&ensp;"lastname": "Smith",  
  &ensp;&ensp;"username": "jsmith",  
  &ensp;&ensp;"password": "Password#1"  
  }  

Example Body Response:
  >{<br/>
      &ensp;&ensp;"id": 1,  
      &ensp;&ensp;"firstname": "John",  
      &ensp;&ensp;"lastname": "Smith",  
      &ensp;&ensp;"username": "jsmith",  
      &ensp;&ensp;"datecreated": "2020-08-29T12:25:30.150Z"  
  }


---
### /auth/login
You can use this endpoint to login to your account & get a JWT token to access the other endpoints.  

---
### post &ensp;/auth/login
**Body**   
Data Type: raw JSON   

Required Fields:
  - username
  - password  


Example Body Request:  
>  {<br/>
  &ensp;&ensp;"username": "jsmith",  
  &ensp;&ensp;"password": "Password#1"  
  }  

Example Body Response:
  > {<br/>
      &ensp;&ensp;"authToken":"eyJhbGciOi . . . . . On5I"  
  }

---
### /auth/refresh
You can use this endpoint to gain new JWT tokens. The new JWT token will expire further in the future than the old one.  

---
### post &ensp;/auth/refresh
**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)

**Body**   
Example Body Response:
  > {<br/>
      &ensp;&ensp;"authToken":"eyJhbGciOi . . . . . aaEs"  
  }

---
### /menu
You can use this endpoint to get your menu items or post new menu items.  

---
### get &ensp;/menu
**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)

**Body**   
Example Body Response:
> [<br/>
    &ensp;{  
      &ensp;&ensp;"id": 1,  
      &ensp;&ensp;"name": "Cereal",  
      &ensp;&ensp;"userid": 1,  
      &ensp;&ensp;"imageurl": "some-url.com/image.jpg",</br>
      &ensp;&ensp;"calories": 200,  
      &ensp;&ensp;"carbs": 49,  
      &ensp;&ensp;"protein": 3,  
      &ensp;&ensp;"fat": 12,  
      &ensp;&ensp;"category": "Breakfast"  
&ensp;}  
]

### post &ensp;/menu
**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)


**Body**   
Data Type: raw JSON   

Required Fields:
  - name
  - category  



Example Body Request:  
>  {<br/>
&ensp;&ensp;"name": "PB&J Sandwich",  
&ensp;&ensp;"category": "Lunch"  
}  

Example Body Response:
> {<br/>
      &ensp;&ensp;"id": 2,  
      &ensp;&ensp;"name": "PB&J Sandwich",  
      &ensp;&ensp;"userid": 1,  
      &ensp;&ensp;"imageurl": "",</br>
      &ensp;&ensp;"calories": null,  
      &ensp;&ensp;"carbs": null,  
      &ensp;&ensp;"protein": null,  
      &ensp;&ensp;"fat": null,  
      &ensp;&ensp;"category": "Lunch"  
}  




---
### /menu/:itemid
This endpoint allows you to retrieve a menu item by id, edit by id, or delete by id.

---  
### get &ensp;/menu/:itemid
(e.g.) get&ensp;/menu/2  

**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)



**Body**   
Example Body Response:
> {<br/>
      &ensp;&ensp;"id": 2,  
      &ensp;&ensp;"name": "PB&J Sandwich",  
      &ensp;&ensp;"userid": 1,  
      &ensp;&ensp;  "imageurl": "",</br>
      &ensp;&ensp;"calories": null,  
      &ensp;&ensp;"carbs": null,  
      &ensp;&ensp;"protein": null,  
      &ensp;&ensp;"fat": null,  
      &ensp;&ensp;"category": "Lunch"  
}  

### patch &ensp;/menu/:itemid
(e.g.) patch&ensp;/menu/2  

**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)


**Body**   
Example Body Request:  
>  {<br/>
&ensp;&ensp;"name": "PB&J Sandwich + Apples",  
&ensp;&ensp;"category": "Lunch"  
}  

Response:  
Status: 204 No Content



### delete &ensp;/menu/:itemid
(e.g.) delete&ensp;/menu/2  

**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)


**Body**   
Response:  
Status: 204 No Content

---
### /plan  
This endpoint allows you to post, get, or delete meal items from the plan table.

---
### post &ensp;/plan
**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)

**Body**   
Data Type: raw JSON   

Required Fields:
  - id (id of menu item)
  - userid  


Example Body Request:  
  >  {<br/>
  &ensp;&ensp;"id": 1,  
  &ensp;&ensp;"userid": 1  
  }  

Example Body Response:
  > {<br/>
        &ensp;&ensp;"id": 1,  
        &ensp;&ensp;"userid": 1,  
        &ensp;&ensp;"menuitemid": 1  
  }  

### get &ensp;/plan
**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)

**Body**   
Example Body Response:
> [<br/>
    &ensp;{  
      &ensp;&ensp;"id": 1,  
      &ensp;&ensp;"menuitemid": 1,  
      &ensp;&ensp;"userid": 1,  
      &ensp;&ensp;"name": "Cereal",  
      &ensp;&ensp;"imageurl": "some-url.com/image.jpg",</br>
      &ensp;&ensp;"calories": 200,  
      &ensp;&ensp;"carbs": 49,  
      &ensp;&ensp;"protein": 3,  
      &ensp;&ensp;"fat": 12,  
      &ensp;&ensp;"category": "Breakfast"  
&ensp;}  
]

### delete &ensp;/plan


**Header**<br/>
Key: Authorization   
Value: Bearer (Enter your auth token value here)

**Body**   
Data Type: raw JSON  

Required Fields:
  - id (id of plan item)

Example Body Request:  
>  {<br/>
&ensp;&ensp;"id": 1,  
}  

Response:  

Status: 204 No Content


---  

  
