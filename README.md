# Voting Frontend


![Voting Frontend](https://github.com/provotum/meta/raw/c8d381f4b3e0c39248757db349964c66bfa25dbf/voter-frontend.png)


This repository holds the voting frontend to submit votes to the blockchain.

## Installation
Follow the steps below to run this app on your local system

* Clone this repo and `cd` into it: `git clone git@github.com:provotum/frontend.git && cd frontend`
* Run `npm install`
* Adjust the environment variables in `.env`. You'll need:
    * `BACKEND=` The url to the running [backend](https://github.com/provotum/backend) instance.
    * `GETH_NODE=` The url to a geth node connected to the network
    * `MOCK_IDENTITY_PROVIDER=` The url to the [identity provider](https://github.com/provotum/mock-identity-provider)

## Development

Once installed, you may run 
```
  npm start -s
```
which will open the app on [http://localhost:3001/](http://localhost:3001/)

## Production

To get a production build of this application, run 
```
  npm run build
```
which will generate a bundled version of this app in `dist/bundle.js`.
To display the app, you'll eventually need an `index.html` as follows:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Voter Dashboard | Provotum</title>
    <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png">
    <link rel="manifest" href="favicon/site.webmanifest">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
</head>
<body>
<div id="app"></div>
<script src="/bundle.js" charset="utf-8"></script>
</body>
</html>
```
