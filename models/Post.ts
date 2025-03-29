import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide post content'],
  },
  userId: {
    type: String,
    required: [true, 'Please provide user ID'],
  },
  isAIApproved: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema); 