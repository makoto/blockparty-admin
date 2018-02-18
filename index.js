const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3("wss://mainnet.infura.io/ws");
const secret_file =  'tmp/test_private.key';
const privateKey = process.env.SECRET || fs.readFileSync(secret_file, 'utf8');
const moment = require('moment');
let crypto = require('crypto');

const data = JSON.parse(fs.readFileSync('lib/Conference.json', 'utf8'));
const abi = data.abi;
const address = data.networks['1'].address;

require('http').createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    var conference = new web3.eth.Contract(abi, address)
    conference.methods.name().call(function(e,r){
        res.write(r);
        res.write('\n');

        conference.getPastEvents('RegisterEvent', {fromBlock:5080322}, function(error, events){
            console.log(r)
            console.log(events.length)
            events.forEach(function(event, index){
                let decrypted = crypto.privateDecrypt(privateKey, new Buffer(event.returnValues._encryption, 'hex')).toString('utf8');
                web3.eth.getBlock(event.blockNumber).then(function(r){
                    let registeredAt = moment(r.timestamp * 1000).format();
                    res.write([index + 1, registeredAt, event.returnValues.participantName, decrypted].join('\t'));
                    res.write('\n');
                    if(index + 1 == events.length){
                        res.end()
                    }
                })
            })
        })
    })
}).listen(process.env.PORT || 3000);

