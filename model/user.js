const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/linh-website-rework', {useNewUrlParser: true, useUnifiedTopology: true});

const UserSchema = new mongoose.Schema({
    mail: String,
    password: String,
    fullname: String,
    sex: String,
    ava: String,
    dob: Date
})
const User = mongoose.model('User', UserSchema);
UserModel = {
    create: (data, done)=>{
        if (UserModel.validPassword(data.password))
            User.findOne({mail: data.mail}, (err, item) =>{
                if (err)
                    done && done(err)
                else if (item)
                    done && done({message: "This email address has been taken by another account.", color: "red"})
                else{
                    User.create(data, (err, item) =>{
                        if (err)
                            done && done(err)
                        else if (item)
                            done && done({message: "Congratulations! Your account has been successfully created.", color: "green"})
                        else done && done(err)
                    })
                }
            })
        else done && done({message: "Your password must be between 8 to 32 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character." ,color:'red'})
    },
    get: (condition, done) =>{
        User.findOne({mail: data.mail}, (err, item) =>{
            if (err)
                done && done(err)
            else if (item)
                done && done(null,item)
            else{
                done && done({message: "User not found!"})
            }
        })
    },
    login: (data, done) =>{
        User.findOne({mail: data.mail}, (err, item) =>{
            if (err)
                done && done(err)
            else if (item)
                if (item.password == data.password)
                    done && done()
                else
                    done && done({massage: "The username or password you entered isn't correct. Try entering it again.", color: "red"})
            else
                done && done({massage: "The username or password you entered isn't correct. Try entering it again.", color: "red"})
        })
    },
    validPassword: (password) =>{
        var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,32}$/
        return !!password.match(passw)
    }
}
module.exports = UserModel;