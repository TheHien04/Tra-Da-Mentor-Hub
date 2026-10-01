import mongoose from 'mongoose';

const AuditEventSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now, index: true },
    actorId: { type: String, default: null },
    actorRole: { type: String, default: null },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: null },
    ip: { type: String, default: null },
  },
  { versionKey: false }
);

export default mongoose.models.AuditEvent || mongoose.model('AuditEvent', AuditEventSchema);
