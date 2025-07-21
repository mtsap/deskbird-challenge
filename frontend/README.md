# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.


### Process and thoughts

As a preface I have to say the I havne't work with Angular since Angular 1 back in 2015
and I havn't work in the frontend for that past 2 years. So I am a bit rust on that front.

In my eyes Angular 2 is a mix between React componets and Nest's philosofy of classes and DI. (or maybe Nest was inspired by Angular 2?)

RxJs as a paradigm is a more functional approach which I really enjoy.

A lot of AI was used to help me wire everything up.

### Auth

We call the login endpoint and get a JWT token back. We then store that token in local storage and use an interceptor to attach the token to every request.
Logout just clears the token and redirects to the login page.

- Dashboard

We have a dashboard page that shows a list of users.
Admins can edit users and see the user's details.
Normal users dont have access to the edit page.
Guards are used to ensure only admins can edit users.

### Looks and design

I have worked as a full stack developer for 7 years but design and making things pretty was never my strong point.
I used primeng for the dashboard and I let AI help me wire everything up.
That's why it looks the way it does ( horrible ).
I just prefered to spend more time on the backend and the logic parts of the frontend.


### NgRx

Had no issues understanding NgRx since I have used both Redux and RxJs before.

I actully enjoy the deep integration of RxJS with Angular so making state also an observable makes sense.
