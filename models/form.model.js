import mongoose from 'mongoose'


const formSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    }
}, {timeStamps: true})

export default mongoose.model('Form', formSchema);