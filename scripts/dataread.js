const { ipcRenderer, remote } = require('electron')
const fs = require('fs')
const csv = require('csv-parser')
const path = require('path')

//database shit
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

var players = []
var offers = []
var coupons = []

var appReady = false

//checks to see if data is loaded, if not, show message
function isAppReady(){
    let playerExists = false
    let offersExists = false

    if(db.get('players').size().value() != 0) {
        playerExists = true

    } else {
        console.log('player info missing')
        console.log(db.get('players').size().value())
    }

    if(db.get('offers').size().value() != 0) {
        offersExists = true 
    } else {
        console.log('player info missing')
        console.log(db.get('offers').size().value())
    }

    if(offersExists === true && playerExists === true){
        appReady = true
        updateTable()
        ipcRenderer.send("isAppReady", true );//send this serverside
        document.getElementById('app-not-ready').style.display = "none"
        document.getElementById('awaiting-request').style.display = "block"
    } else {
        document.getElementById('app-not-ready').style.display = "block"
    }

    if(!appReady){
        document.getElementById("edit-info").disabled = true
      } else {
        document.getElementById("edit-info").disabled = false
      }
}

//there needs to be more logical shit here but we don't know the conditions so just leave this for now.

//opens window to select file to download mock data
function openPlayers(){
    let dialog = remote.dialog
    dialog.showOpenDialog({
        title: 'Open Mock Data',
        filters: [
            {name: 'csv', extensions: ['csv']}
        ]
    }, (fileName) => {
        if(fileName === undefined){
            return;
        } 
        players = []
        csv(['firstName', 'lastName', 'accountNumber', 'tierLevel', 'dateOfBirth', 'pointBalance', 'compBalance', 'promo2Balance', 'isBanned', 'isInActive', 'isPinLocked'])
        fs.createReadStream(fileName[0])
        .pipe(csv())
        .on('data', (data) => {
            players.push(data)
        })
        .on('end' , () => {
            db.set('players', players).write()
            isAppReady()
        })
        document.getElementById("player-data-status").innerText = "Player Data ✔️"
        db.write()
    })
}

function openOffers(){
    csv(['AccountNumber', 'OfferCode', 'OfferName', 'OfferValue', 'OfferStartDate', 'OfferEndDate'])
    let dialog = remote.dialog
    dialog.showOpenDialog({
        title: 'Open Mock Data',
        filters: [
            {name: 'csv', extensions: ['csv']}
        ]
    }, (fileName) => {
        if(fileName === undefined){
            return;
        } 
        offers = []
        fs.createReadStream(fileName[0])
        .pipe(csv())
        .on('data', (data) => {
            offers.push(data)
        })
        .on('end' , () => {
            db.set('offers', offers).write()
            isAppReady()
        })
        document.getElementById("offer-data-status").innerText = "Offer Data ✔️"
        db.write()
    })
}

function openCoupons(){
    db.read()
    csv(["CouponNumber", "Balance"])
    let dialog = remote.dialog
    dialog.showOpenDialog({
        title: 'Open Coupon Data',
        filters: [
            {name: 'csv', extensions: ['csv']}
        ]
    }, (fileName) => {
        if(fileName === undefined){
            return;
        } 
        coupons = []
        fs.createReadStream(fileName[0])
        .pipe(csv())
        .on('data', (data) => {
            coupons.push(data)
        })
        .on('end' , () => {
            db.set('coupons', coupons).write()
            isAppReady()
        })
        console.log(coupons)
        document.getElementById("coupon-data-status").innerText = "Coupon Data ✔️"
        db.write()
    })
}


//checks to see if files were already uploaded and stored locally
function checkUploaded() {
    if (db.get('players').size().value() == 0) {
        document.getElementById('player-data-status').textContent = "Player Data ❌"
    } else {
        document.getElementById('player-data-status').textContent = "Player Data ✔️"
        players = db.get('players').value()
    }

    if (db.get('offers').size().value() == 0) {
        document.getElementById('offer-data-status').textContent = "Offer Data ❌"
    } else {
        document.getElementById('offer-data-status').textContent = "Offer Data ✔️"
        offers = db.get('offers').value()
    }

    if (db.get('coupons').size().value() == 0) {
        document.getElementById('coupon-data-status').textContent = "Coupons Data 🐈"
    } else {
        document.getElementById('coupon-data-status').textContent = "Coupons Data ✔️"
        coupons = db.get('coupons').value()
    }
    isAppReady()
    //update points to dollars
    checkPointsToDollars()
}

function checkPointsToDollars(){
    let pointsToDollars = db.get('pointsToDollars').value()
    document.getElementById('pointsToDollars').textContent = pointsToDollars + " : 1"
    db.write()
}
