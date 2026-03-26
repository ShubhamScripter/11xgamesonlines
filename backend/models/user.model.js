const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    validate:{
      validator:function(value){
        return /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,16}$/.test(value);
      },
      message:"Strong Password Required"
     
    }

      
    
  },
  
  role: {
    type: String,
    enum: ['admin', 'subadmin', 'seniorSuper', 'superAgent', 'agent', 'user'],
    required: true,
  },
  timezone: {
    type: String,
    required: true,
  },
  siteTag: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  creatorRole: {
    type: String,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  parentRole: {
    type: String,
    enum: ['admin', 'subadmin', 'seniorSuper', 'superAgent', 'agent', 'user'],
  },
  loginCode: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'locked'],
    default: 'active',
  },
  totalBalance: {
    type: Number,
    default: 0,
  },
  totalExposure: {
    type: Number,
    default: 0,
  },
  totalAvailableBalance: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  totalPlayerBalance: {
    type: Number,
    default: 0,
  },
  isCheatBet: {
    type: Boolean,
    default: false,
  },
  sessionToken: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  lastDevice: {
    type: String,
    default: null,
  },
  lastIP: {
    type: String,
    default: null,
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
