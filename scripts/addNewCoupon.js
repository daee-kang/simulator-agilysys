var couponData = db.get('coupons').value()
var newCoupon = {}
var couponFlags = {}

function addNewCoupon(){

    newCoupon = {
            "CouponNumber": "",
            "Balance": ""
    }

    couponFlags = {
        "CouponNumber": false,
        "Balance": false,
      }

}

function saveCouponForm(){

    couponData.push(newCoupon)
    db.set('players', playerData).write()
    updateCouponTable()
    addNewUser()
    checkFlag()

    document.getElementById('save-coupon').textContent = "New Coupon Added Successfully!";

    setTimeout(function(){
        document.getElementById('save-coupon').textContent = "";
    },3000);

    document.getElementById("coupon-form").reset();
}


function enterCouponInfo(inputElement){
    
    if(inputElement.name === 'couponNumber'){
        newCoupon.CouponNumber = inputElement.value
        couponFlags.CouponNumber = true
        checkCouponFlag()
    }
    else if(inputElement.name === 'balance'){
        newCoupon.Balance = inputElement.value
        couponFlags.Balance = true
        checkCouponFlag() 
    }
}

function checkCouponFlag(){
    
    if(couponFlags.CouponNumber && couponFlags.Balance)
        document.getElementById("save-coupon-button").disabled = false
    else
        document.getElementById("save-coupon-button").disabled = true
}

function newCouponWindow(){
    document.getElementById('add-coupon').style.display = 'block'
    document.getElementById('edit-coupons').style.display = 'none'
    addNewCoupon()
    document.getElementById("save-coupon-button").disabled = true
}

function loadCouponTable(){
    document.getElementById('add-coupon').style.display = 'none'
    document.getElementById('edit-coupons').style.display = 'block'
}