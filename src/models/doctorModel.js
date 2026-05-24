import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    experience: {
      type: Number,
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    clinicName: {
      type: String,
      required: true,
    },

    clinicAddress: {
      type: String,
      required: true,
    },

    clinicLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },


    profileImage: {
      type: String,
      default: "",
    },

    licenseDocument: {
      type: String,
      required: true,
    },

    consultationFee: {
      type: Number,
      required: true,
      default: 0,
    },

    availability: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    role: {
      type: String,
      default: "doctor",
    },
    
    isBlocked: {
      type: Boolean,
      default: false,
    },

    isClinicOpen: {
      type: Boolean,
      default: false,
    },

    currentQueueNumber: {
      type: Number,
      default: 0,
    },
    pushToken: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
doctorSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// Method to compare passwords
doctorSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Doctor", doctorSchema);