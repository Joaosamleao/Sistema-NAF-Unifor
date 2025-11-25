import mongoose from 'mongoose';

const envioLogSchema = new mongoose.Schema({
  agendamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agendamento' },
  payload: { type: Object },
  attempts: [
    {
      attemptNumber: Number,
      success: Boolean,
      statusCode: Number,
      responseText: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  success: { type: Boolean, default: false },
  sentBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('EnvioLog', envioLogSchema);
