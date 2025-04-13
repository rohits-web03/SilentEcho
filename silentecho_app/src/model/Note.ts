import mongoose, { Document, Schema } from 'mongoose';

export interface Note extends Document {
    userId: mongoose.Types.ObjectId;
    ciphernote: string;
    slug: string;
    expiresAt?: Date;
    createdAt: Date;
}

const NoteSchema: Schema<Note> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    ciphernote: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

const NoteModel =
    (mongoose.models.Note as mongoose.Model<Note>) ||
    mongoose.model<Note>('Note', NoteSchema);

export default NoteModel;
