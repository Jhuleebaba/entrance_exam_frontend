"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var mongoose_1 = __importDefault(require("mongoose"));
var Question_1 = __importDefault(require("../models/Question"));
var sampleQuestions = [
    // Mathematics Questions
    {
        question: "What is the value of π (pi) to two decimal places?",
        options: ["3.12", "3.14", "3.16", "3.18"],
        correctAnswer: "3.14",
        subject: "Mathematics",
        marks: 2
    },
    {
        question: "Solve for x: 2x + 5 = 13",
        options: ["x = 4", "x = 6", "x = 8", "x = 3"],
        correctAnswer: "x = 4",
        subject: "Mathematics",
        marks: 2
    },
    {
        question: "What is the square root of 144?",
        options: ["10", "12", "14", "16"],
        correctAnswer: "12",
        subject: "Mathematics",
        marks: 2
    },
    // English Questions
    {
        question: "Which of these is a proper noun?",
        options: ["happy", "London", "beautiful", "quickly"],
        correctAnswer: "London",
        subject: "English",
        marks: 1
    },
    {
        question: "What is the past tense of 'write'?",
        options: ["wrote", "written", "writing", "writes"],
        correctAnswer: "wrote",
        subject: "English",
        marks: 1
    },
    {
        question: "Identify the correct sentence:",
        options: [
            "They is going home.",
            "He have a book.",
            "She is reading a book.",
            "We is happy."
        ],
        correctAnswer: "She is reading a book.",
        subject: "English",
        marks: 1
    },
    // Science Questions
    {
        question: "What is the chemical symbol for gold?",
        options: ["Au", "Ag", "Fe", "Cu"],
        correctAnswer: "Au",
        subject: "Science",
        marks: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        correctAnswer: "Mars",
        subject: "Science",
        marks: 1
    },
    {
        question: "What is the largest organ in the human body?",
        options: ["Heart", "Brain", "Liver", "Skin"],
        correctAnswer: "Skin",
        subject: "Science",
        marks: 2
    },
    // General Knowledge Questions
    {
        question: "What is the capital of Nigeria?",
        options: ["Lagos", "Abuja", "Kano", "Port Harcourt"],
        correctAnswer: "Abuja",
        subject: "General Knowledge",
        marks: 2
    },
    {
        question: "Who wrote 'Things Fall Apart'?",
        options: [
            "Wole Soyinka",
            "Chinua Achebe",
            "Chimamanda Adichie",
            "Ben Okri"
        ],
        correctAnswer: "Chinua Achebe",
        subject: "General Knowledge",
        marks: 2
    },
    {
        question: "Which river is the longest in Africa?",
        options: ["Congo River", "Niger River", "Nile River", "Zambezi River"],
        correctAnswer: "Nile River",
        subject: "General Knowledge",
        marks: 2
    }
];
var addSampleQuestions = function () { return __awaiter(void 0, void 0, void 0, function () {
    var questions, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                // Connect to MongoDB
                return [4 /*yield*/, mongoose_1["default"].connect('mongodb://localhost:27017/entrance-exam')];
            case 1:
                // Connect to MongoDB
                _a.sent();
                console.log('Connected to MongoDB');
                // Delete existing questions
                return [4 /*yield*/, Question_1["default"].deleteMany({})];
            case 2:
                // Delete existing questions
                _a.sent();
                console.log('Cleared existing questions');
                return [4 /*yield*/, Question_1["default"].insertMany(sampleQuestions)];
            case 3:
                questions = _a.sent();
                console.log("Added ".concat(questions.length, " sample questions"));
                // Disconnect from MongoDB
                return [4 /*yield*/, mongoose_1["default"].disconnect()];
            case 4:
                // Disconnect from MongoDB
                _a.sent();
                console.log('Disconnected from MongoDB');
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('Error adding sample questions:', error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
// Run the script
addSampleQuestions();
