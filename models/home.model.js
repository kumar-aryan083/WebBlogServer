import mongoose from 'mongoose'

const homeSchema = mongoose.Schema({
    homeRow: [{
        type: String
    }]
})

export default mongoose.model('Home', homeSchema);