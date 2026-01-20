const mongoose = require("mongoose");
const schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new schema({
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    name:{type:String, required:true},
    role:{type:String, enum:["user","admin"], default:"user"}
}, {timestamps: true})

const CourseSchema = new schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    price:{type:Number, required:true},
    image:{type:String, required:true},
    adminId:{type:ObjectId, ref:'User', required:true}
}, {timestamps: true})

const PurchaseSchema = new schema({
    courseId:{type:ObjectId, ref:'Course', required:true},
    userId:{type:ObjectId, ref:'User', required:true}
}, {timestamps: true})

PurchaseSchema.index({userId:1, courseId:1}, {unique:true});

const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);
const Purchase = mongoose.model('Purchase', PurchaseSchema);


module.exports = {User, Course, Purchase};