import Web3 from 'web3';

let getWeb3 = new Promise(function (resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.

  window.addEventListener('load', function () {
    let results;
    let provider = new Web3.providers.HttpProvider('http://127.0.0.1:8502');
    let web3 = new Web3(provider);
    //web3.defaultAccount = results.web3.eth.accounts[0];
    //web3.personal.unlockAccount(results.web3.eth.defaultAccount);

    results = {
      web3: web3
    };

    console.log('No web3 instance injected, using Local web3.');
    resolve(results);
  });
});

export default getWeb3;
