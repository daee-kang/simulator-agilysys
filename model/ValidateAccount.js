const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

module.exports = {
    ValidateAccount : function ValidateAccount(cardType, cardNumber){
        db.read()
        let validatedAccounts = []
        let allPlayers = db.get('players').value()

        switch(cardType){
            case "AccountNumber": {
                allPlayers.forEach(player => {
                    if(player.accountNumber === cardNumber){
                        validatedAccounts.push(player)
                    }
                });
            }
            case "PhoneNumber": {
                allPlayers.forEach(player => {
                    if(player.phoneNumber === cardNumber){
                        validatedAccounts.push(player)
                    }
                });
            }
            case "CardNumber": {
                allPlayers.forEach(player => {
                    if(player.cardNumber === cardNumber){
                        validatedAccounts.push(player)
                    }
                });
            }
            
            let PatronResponse = []
            let oneAccountBlocked = false
            validatedAccounts.forEach(account => {
                //see if player is blocked
                let isBlocked = account.isInActive || account.isPinLocked || account.isBanned;
                if(isBlocked) {
                    oneAccountBlocked = true
                }

                PatronResponse.push({
                    ClubStateId: 40,//hardcoded for rn
                    AccountNumber: account.accountNumber,
                    FirstName: account.firstName,
                    LastName: account.lastName, 
                    ClubState: account.tierLevel,
                    DateOfBirth: account.dateOfBirth,
                    PointsBalance: account.pointBalance,
                    PointsBalanceInDollars: account.pointBalance/db.get('pointsToDollars').value(),
                    CompBalance: account.compBalance,
                    Promo2Balance: account.promo2Balance,
                    IsInActive: account.isInActive,
                    IsPinLocked: account.isPinLocked,
                    IsBanned: account.isBanned,
                    ResponseResult: {
                        IsSuccess: !(account.isInActive || account.isPinLocked || account.isBanned),
                        ErrorMessage: generateErrorMessage(account),
                        ErrorCode: "error"
                    }
                })
            });

            let ResponseStatus;
            if(validatedAccounts.length === 0){
                ResponseStatus = {
                    IsSuccess: false,
                    ErrorMessage: "No accounts found",
                    ErrorCode: "error"
                }
            } else if (oneAccountBlocked){
                ResponseStatus = {
                    IsSuccess: false,
                    ErrorMessage: "One of the collection failed, review the collection result.",
                    ErrorCode: "error"
                }
            } else {
                ResponseStatus = {
                    IsSuccess: true,
                    ErrorMessage: "",
                    ErrorCode: ""
                }
            }

            return {
                PatronResponse,
                ResponseStatus
            }
        }
    }
}

function generateErrorMessage(account){
    let outString = "Player with Account # " + account.accountNumber
    if(account.isInActive){
        outString += " is inactive"
    } else if(account.isBanned){
        outString += " has been banned"
    } else if(account.isPinLocked){
        outString += " is pin locked"
    }
    return outString
}