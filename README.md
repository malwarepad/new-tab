# Chrome new tab knockoff

I really did spend a solid 3 days of my life, recreating Chrome's infamous minimal "New Tab" page just because the 10 shortcut limit drove me insane. I suppose I'm just built different...

## Getting started

In the `.env` file adjust the `NEXT_PUBLIC_NAME` to your preferance and use the following command to generate a valid JWT private key:

> `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`

Now just use this command to build and use this thing:

> `docker compose up -d`

## Default credentials

> user: `admin`

> password: `password`

## The stack

- [NextJS](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Prisma](https://prisma.io/)
- [SQLite](https://www.sqlite.org/)

## Contributions

If you have a feature to implement, go do it yourself and open a PR. This is a quick and dirty personal project afterall...

## Copyright & Licensing

Dude I don't to the slightest care about what happens to this code.

Copyright&copy; MalwarePad Productions 2016 - 2023
