const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env variables
dotenv.config();

// Models
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Timetable = require('../models/Timetable');
const StudyMaterial = require('../models/StudyMaterial');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Announcement = require('../models/Announcement');
const Job = require('../models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // 1. Clear database
    console.log('Clearing database tables...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Attendance.deleteMany({});
    await Grade.deleteMany({});
    await Timetable.deleteMany({});
    await StudyMaterial.deleteMany({});
    await Assignment.deleteMany({});
    await AssignmentSubmission.deleteMany({});
    await Announcement.deleteMany({});
    await Job.deleteMany({});

    console.log('Database cleared. Seeding users...');

    // Hash passwords beforehand to save computation
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('student123', salt);
    const adminHashedPassword = await bcrypt.hash('admin123', salt);
    const facultyHashedPassword = await bcrypt.hash('faculty123', salt);

    // 2. Create Users
    const admin = await User.create({
      name: 'Dr. Rajesh Sharma (Admin)',
      email: 'admin@portal.com',
      password: adminHashedPassword,
      role: 'Admin',
      department: 'Administration',
      phone: '+91 98765 43210',
      address: 'Main Block, Campus Ground, Tech University'
    });

    const facultyCSE = await User.create({
      name: 'Prof. Amit Verma',
      email: 'faculty@portal.com',
      password: facultyHashedPassword,
      role: 'Faculty',
      department: 'Computer Science and Engineering',
      facultyId: 'FAC-CSE-001',
      designation: 'Associate Professor',
      phone: '+91 99887 76655',
      address: 'Faculty Quarters Q-3, Tech Campus'
    });

    const facultyECE = await User.create({
      name: 'Dr. Priya Nair',
      email: 'ece_faculty@portal.com',
      password: facultyHashedPassword,
      role: 'Faculty',
      department: 'Electronics and Communication Engineering',
      facultyId: 'FAC-ECE-002',
      designation: 'Assistant Professor',
      phone: '+91 99443 32211',
      address: 'Staff Block B, Floor 2, Tech Campus'
    });

    const student1 = await User.create({
      name: 'Yaswanth Kumar',
      email: 'student@portal.com',
      password: defaultHashedPassword,
      role: 'Student',
      department: 'Computer Science and Engineering',
      rollNo: 'CSE-2023-045',
      batch: '2023-2027',
      semester: 1,
      phone: '+91 90001 23456',
      address: 'Room 304, Hostel C, Tech University Campus',
      skills: ['React.js', 'Node.js', 'JavaScript', 'MongoDB', 'Python'],
      education: [
        { institution: 'Tech University', degree: 'B.Tech CSE', year: '2023 - Present', percentage: '9.1 CGPA' },
        { institution: 'St. Mary High School', degree: 'Class XII (CBSE)', year: '2022', percentage: '94.6%' }
      ],
      projects: [
        { title: 'Portfolio Website', description: 'Personal branding website built with HTML, CSS, JS.', technologies: 'HTML, CSS, JS', link: 'https://yaswanth.me' }
      ]
    });

    const student2 = await User.create({
      name: 'Aanya Sen',
      email: 'student2@portal.com',
      password: defaultHashedPassword,
      role: 'Student',
      department: 'Computer Science and Engineering',
      rollNo: 'CSE-2023-012',
      batch: '2023-2027',
      semester: 1,
      phone: '+91 90002 98765',
      address: 'Hostel A, Room 102, Tech University Campus'
    });

    const student3 = await User.create({
      name: 'Rohan Gupta',
      email: 'student3@portal.com',
      password: defaultHashedPassword,
      role: 'Student',
      department: 'Electronics and Communication Engineering',
      rollNo: 'ECE-2023-091',
      batch: '2023-2027',
      semester: 1,
      phone: '+91 90003 44556',
      address: 'Day scholar, Sector 4, Tech City'
    });

    console.log('Users seeded. Seeding courses...');

    // 3. Create Courses
    const courseDSA = await Course.create({
      name: 'Data Structures and Algorithms',
      code: 'CS201',
      department: 'Computer Science and Engineering',
      semester: 1,
      faculty: facultyCSE._id,
      students: [student1._id, student2._id],
      description: 'Comprehensive study of lists, stacks, queues, trees, search/sort algorithms and complexity analysis.'
    });

    const courseDBMS = await Course.create({
      name: 'Database Management Systems',
      code: 'CS202',
      department: 'Computer Science and Engineering',
      semester: 1,
      faculty: facultyCSE._id,
      students: [student1._id, student2._id],
      description: 'Relational model, database design, SQL queries, transaction management, and indexing methods.'
    });

    const courseDSD = await Course.create({
      name: 'Digital System Design',
      code: 'EC201',
      department: 'Electronics and Communication Engineering',
      semester: 1,
      faculty: facultyECE._id,
      students: [student3._id],
      description: 'Boolean algebra, logic gates, combinational and sequential circuit design, VHDL simulation.'
    });

    console.log('Courses seeded. Seeding timetables...');

    // 4. Create Timetables
    await Timetable.create([
      { course: courseDSA._id, dayOfWeek: 'Monday', startTime: '09:00', endTime: '09:50', room: 'LH-101', department: 'Computer Science and Engineering', batch: 'CSE 2023' },
      { course: courseDBMS._id, dayOfWeek: 'Monday', startTime: '10:00', endTime: '10:50', room: 'LH-101', department: 'Computer Science and Engineering', batch: 'CSE 2023' },
      
      { course: courseDSA._id, dayOfWeek: 'Tuesday', startTime: '11:00', endTime: '11:50', room: 'LH-101', department: 'Computer Science and Engineering', batch: 'CSE 2023' },
      { course: courseDBMS._id, dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '09:50', room: 'LH-102', department: 'Computer Science and Engineering', batch: 'CSE 2023' },
      
      { course: courseDSA._id, dayOfWeek: 'Thursday', startTime: '10:00', endTime: '10:50', room: 'Lab-3', department: 'Computer Science and Engineering', batch: 'CSE 2023' },
      { course: courseDBMS._id, dayOfWeek: 'Friday', startTime: '14:00', endTime: '14:50', room: 'LH-101', department: 'Computer Science and Engineering', batch: 'CSE 2023' },
      
      { course: courseDSD._id, dayOfWeek: 'Monday', startTime: '11:00', endTime: '11:50', room: 'LH-204', department: 'Electronics and Communication Engineering', batch: 'ECE 2023' },
      { course: courseDSD._id, dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '15:30', room: 'ECE Lab-1', department: 'Electronics and Communication Engineering', batch: 'ECE 2023' }
    ]);

    console.log('Timetable seeded. Seeding historical attendance...');

    // 5. Create Attendance logs (Generate past 10 days)
    const logs = [];
    const statusOptions = ['Present', 'Present', 'Present', 'Present', 'Absent', 'Present']; // ~83% average attendance
    
    for (let i = 1; i <= 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setUTCHours(0,0,0,0);
      
      // Seed for student 1 & student 2 in DSA & DBMS
      logs.push({
        student: student1._id,
        course: courseDSA._id,
        date: new Date(date),
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        markedBy: facultyCSE._id
      });
      logs.push({
        student: student1._id,
        course: courseDBMS._id,
        date: new Date(date),
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        markedBy: facultyCSE._id
      });

      logs.push({
        student: student2._id,
        course: courseDSA._id,
        date: new Date(date),
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        markedBy: facultyCSE._id
      });
      logs.push({
        student: student2._id,
        course: courseDBMS._id,
        date: new Date(date),
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        markedBy: facultyCSE._id
      });

      // Seed for student 3 in ECE DSD
      logs.push({
        student: student3._id,
        course: courseDSD._id,
        date: new Date(date),
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        markedBy: facultyECE._id
      });
    }
    await Attendance.insertMany(logs);

    console.log('Attendance seeded. Seeding grades...');

    // 6. Create Grades
    // Student 1 (High in DSA, Low in DBMS to trigger recommendation engine)
    await Grade.create([
      { student: student1._id, course: courseDSA._id, semester: 1, examType: 'Mid-Term', marksObtained: 88, maxMarks: 100, grade: 'A', gradedBy: facultyCSE._id, feedback: 'Strong logic and excellent implementations.' },
      { student: student1._id, course: courseDSA._id, semester: 1, examType: 'Quiz', marksObtained: 19, maxMarks: 20, grade: 'A+', gradedBy: facultyCSE._id, feedback: 'Perfect score in binary search questions.' },
      
      // Low grade in DBMS to demonstrate AI performance recommendation
      { student: student1._id, course: courseDBMS._id, semester: 1, examType: 'Mid-Term', marksObtained: 55, maxMarks: 100, grade: 'C', gradedBy: facultyCSE._id, feedback: 'Needs improvement in normalization and SQL Joins.' },
      { student: student1._id, course: courseDBMS._id, semester: 1, examType: 'Quiz', marksObtained: 11, maxMarks: 20, grade: 'C', gradedBy: facultyCSE._id, feedback: 'Fumbled Schema design questions.' }
    ]);

    // Student 2
    await Grade.create([
      { student: student2._id, course: courseDSA._id, semester: 1, examType: 'Mid-Term', marksObtained: 92, maxMarks: 100, grade: 'A+', gradedBy: facultyCSE._id, feedback: 'Top performer in class!' }
    ]);

    // Student 3
    await Grade.create([
      { student: student3._id, course: courseDSD._id, semester: 1, examType: 'Mid-Term', marksObtained: 78, maxMarks: 100, grade: 'B+', gradedBy: facultyECE._id, feedback: 'Good understanding of sequential circuits.' }
    ]);

    console.log('Grades seeded. Seeding announcements & placements...');

    // 7. Announcements
    await Announcement.create([
      { title: 'Mid-Term Examination Schedule - 2026', content: 'The Mid-Term exam schedule for 1st-semester students starts from July 15th, 2026. Detailed seating arrangements will be published outside LH Block next week.', category: 'Exam', targetAudience: 'Student', postedBy: admin._id },
      { title: 'Placement Drive: Microsoft Software Engineering Hires', content: 'Microsoft is conducting a campus recruitment drive for final-year students and summer internships for pre-final year students. Register under the Opportunities section before June 30th.', category: 'Placement', targetAudience: 'All', postedBy: admin._id },
      { title: 'Academic Syllabus Revision Feedback', content: 'Dear Faculty members, please review the proposed modifications for the Core CS syllabus and submit feedback by Friday evening.', category: 'Academic', targetAudience: 'Faculty', postedBy: admin._id }
    ]);

    // 8. Placements / Jobs
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);

    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    await Job.create([
      {
        title: 'Software Development Intern',
        company: 'Google',
        description: 'Join the Google Workspace team to build high-scale web products. You will work alongside senior software development developers, designing features and refining API response rates.',
        requirements: ['Strong understanding of Data Structures & Algorithms', 'Familiarity with React, Node.js or Java', 'Good communication and problem solving skills'],
        location: 'Hyderabad, India',
        type: 'Internship',
        salary: 'INR 1,20,000 / Month',
        deadline: oneMonthFromNow,
        postedBy: admin._id
      },
      {
        title: 'Graduate Engineer Trainee (GET)',
        company: 'Microsoft',
        description: 'Full-time entry developer program within Cloud + AI block. Responsible for writing unit test suites, building microservices, and refactoring backend code bases.',
        requirements: ['B.Tech / M.Tech in CS/ECE/IT', 'Familiarity with C#, TypeScript or C++', 'Basic knowledge of SQL/NoSQL databases'],
        location: 'Bangalore, India',
        type: 'Full-time',
        salary: 'INR 18,00,000 / Annum',
        deadline: twoWeeksFromNow,
        postedBy: admin._id
      }
    ]);

    console.log('=========================================');
    console.log('Database seeded successfully!');
    console.log('=========================================');
    console.log('Login credentials for verification:');
    console.log('1. Admin   : admin@portal.com  / admin123');
    console.log('2. Faculty : faculty@portal.com / faculty123');
    console.log('3. Student : student@portal.com / student123');
    console.log('=========================================');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

connectDB().then(seedData);
