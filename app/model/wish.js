module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const WishSchema = new Schema({
    creator: { type: Schema.Types.ObjectId },
    created_at: { type: Number },
    modified_at: { type: Number },
    meta: { type: Object },
    claimed_by: { type: Schema.Types.ObjectId },
    claimed_at: { type: Number },
  })

  return mongoose.model('Wish', WishSchema)
}
