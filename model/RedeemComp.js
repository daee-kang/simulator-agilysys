const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

module.exports = {
    RedeemComp : function RedeemComp(accountNumber, compList){
        let foundAccount = undefined
        let i = 0;

        foundAccount = db.get('players')
            .find({accountNumber: accountNumber})
            .value()
        
        let currentCompPoints = parseInt(foundAccount.compBalance)
        let outCompList = []
        let redeemedTotal = 0

        compList.forEach(comp => {
            currentCompPoints -= parseInt(comp.RedeemDollars)
            let isUnder0
            if(currentCompPoints >= 0) {
                redeemedTotal += comp.RedeemDollars
                isUnder0 = false
            } else {
                isUnder0 = true
            }
            currentCompPoints = foundAccount.compBalance - redeemedTotal

            let transactionIdCount = db.get('transactionId').value()
            transactionId++
            db.set('transactionId', transactionIdCount).write() //write back to db               

            let data = {     
                "SequenceID": comp.SequenceID,
                "ReferenceID": comp.ReferenceID,
                "RedeemDollars": comp.RedeemDollars,
                "TransactionId": transactionIdCount,
                "ResponseStatus": {
                    "IsSuccess": !isUnder0,
                    "ErrorMessage": !isUnder0 ? "" : "negative balance",
                    "ErrorCode": ""
                    }
            }

            db.get('transactions')
                .push({
                    type: "RedeemComp",
                    transactionId: transactionIdCount,
                    data
                })
                .write()
            outCompList.push(data)
        });


        db.get('players')
            .find({accountNumber: String(accountNumber)})
            .assign({compBalance: foundAccount.compBalance - redeemedTotal})
            .write()

        let out = {
            "AccountNumber": accountNumber,
            "CompBalance": foundAccount.compBalance,
            "RedeemCompList": outCompList,
            "ResponseStatus": {
                "IsSuccess": true,
                "ErrorMessage": "",
                "ErrorCode": ""
              },
              "CustomFields": {}
        }



        return { out, redeemedTotal }
    }
}