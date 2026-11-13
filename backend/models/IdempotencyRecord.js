import mongoose from 'mongoose';

const idempotencyRecordSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    keyHash: { type: String, required: true },
    requestHash: { type: String, required: true },
    actorRole: { type: String, required: true },
    state: { type: String, enum: ['pending', 'completed'], required: true, default: 'pending' },
    status: { type: Number, default: null },
    body: { type: mongoose.Schema.Types.Mixed, default: null },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
    collection: 'idempotency_records',
  }
);

idempotencyRecordSchema.index({ userId: 1, keyHash: 1 }, { unique: true });

export default mongoose.model('IdempotencyRecord', idempotencyRecordSchema);
