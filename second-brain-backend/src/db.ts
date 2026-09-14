// model = mongoose.model
// Schema = mongoose.Schema

import mongoose, {model, Schema} from "mongoose";
import { required } from "zod/mini";

const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true}
})

export const UserModel = model("User",UserSchema);  


const ContentSchema = new Schema({
    title: {type: String, required: true},
    link: {type: String, required: true},
    type: {type: String, required: true},
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User', requied: true}
})

export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', requied: true, unique: true}
})

export const LinkModel = model("Links", LinkSchema);
