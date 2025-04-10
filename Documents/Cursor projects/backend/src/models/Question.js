"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var mongoose_1 = __importDefault(require("mongoose"));
var questionSchema = new mongoose_1["default"].Schema({
    question: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: {
            validator: function (v) {
                return v.length === 4;
            },
            message: 'Question must have exactly 4 options'
        }
    },
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required'],
        validate: {
            validator: function (v) {
                return this.options.includes(v);
            },
            message: 'Correct answer must be one of the options'
        }
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        "enum": ['Mathematics', 'English', 'Science', 'General Knowledge']
    },
    marks: {
        type: Number,
        required: [true, 'Marks are required'],
        min: [1, 'Marks must be at least 1']
    }
}, {
    timestamps: true
});
exports["default"] = mongoose_1["default"].model('Question', questionSchema);
