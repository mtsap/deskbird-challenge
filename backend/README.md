<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install

# start the database
$ docker-compose up -d

# seed the database
$ npx ts-node -r tsconfig-paths/register scripts/seedDB.ts

# copy .env.example to .env
$ cp .env.example .env
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

### NestJS first timer

This is  the first time I'm using NestJS and a lot of the setup was assied by AI.
I used TypeORM for the database as it's the ORM that integrates best with NestJS.

As a long time user of Express or similar frameworks, Nest need a bit of getting used to
since it's a completely different paradigm but, when you get used to it, it tries to stay
out of your way and just let you do what you want.

### Auth
I used JWT for authentication/authorization.

The user hits the LOGIN endpoint and the backend generates a JWT token and sends it back to the client.
The rest of the routes are guarded by the AuthGuard, and AdminGuard which checks the token and if it's valid, it sets the user in the request.

I implemented the login functionality and used a separate DB table to store the auth related info.
If that was a real production a lot more work would be done to implement the refresh token and the expiration time,
sign up process, forgot password, etc.

Chances are though that in reality a third party service is used.



### Testing

I implemented some mock test for the controllers to make sure that the endpoints are working as expected.
This is the one pain point I had with NestJS since mocking the services was not trivial.

Maybe there are better ways to do it, or e2e tests are preferred so mocking is not needed.


### Error Handling with Neverthrow

In small personal projects, I tend to avoid, wherever possible, using native exceptions and try/catch blocks.
While they’re standard in JS/TS, they come with a few drawbacks:

  - Lack of visibility – It's not clear from a function's signature whether it can throw an error.

  - Poor composability – Chaining multiple potentially throwing functions can lead to verbose or awkward patterns:
        - One option is a single try/catch, which makes it hard to handle different errors cleanly.
        - Another is wrapping each call in its own try/catch, which clutters the flow and requires shared state between blocks.

Instead, I prefer a Rust/Go-style approach where errors are returned as values and handled explicitly. 
For this project, I used oxide.ts to wrap operations in Result objects, which makes it easy to:

  - Express success/failure clearly in the function signature.
  - Handle each case explicitly in a clean, composable way.
  - Avoid surprises from unhandled exceptions.

For example, controllers handle Result objects directly and respond accordingly—either returning a successful response or
logging and surfacing a structured error.

This approach improves both clarity and control, especially in systems that might grow more complex over time.
Though there is a possibility that this approach won't scale well with NestJS.
