/**
 * Script to populate database with complete syllabus data
 * Run with: npx tsx scripts/populate-syllabus.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const syllabusData = {
  "B.Tech (Computer Science & Engineering)": {
    duration: "4 Years (8 Semesters)",
    semesters: {
      1: [
        {
          name: "Programming with Java",
          syllabus: [
            { module: 1, unit: 1, topic: "Introduction", details: "Basics of programming, OOP concepts, JVM architecture, JDK, JRE" },
            { module: 1, unit: 2, topic: "Java Fundamentals", details: "Variables & Data types, Operators, Input/Output, Type conversion & casting" },
            { module: 1, unit: 3, topic: "Control Structures", details: "if, if-else, loops, switch-case" },
            { module: 1, unit: 4, topic: "OOP in Java", details: "Classes & Objects, Constructors, Inheritance, Polymorphism, Encapsulation, Abstraction" },
            { module: 1, unit: 5, topic: "Advanced Java", details: "Exception handling, Packages & interfaces, String handling, Streams & File handling, Multithreading basics" },
          ],
        },
        {
          name: "Data Structures",
          syllabus: [
            { module: 1, unit: 1, topic: "Introduction", details: "Types of data structures, Time & Space complexity" },
            { module: 1, unit: 2, topic: "Linear Structures", details: "Arrays, Linked lists, Stacks, Queues, Circular queues" },
            { module: 1, unit: 3, topic: "Non-Linear Structures", details: "Trees, BST, AVL trees, Graphs, adjacency list & matrix" },
            { module: 1, unit: 4, topic: "Searching/Sorting", details: "Linear & binary search, Bubble, insertion, merge, quick sort" },
            { module: 1, unit: 5, topic: "Applications", details: "Recursion, Hashing, Priority queues" },
          ],
        },
        {
          name: "Software Engineering",
          syllabus: [
            { module: 1, unit: 1, topic: "Software Concepts", details: "SDLC models (Waterfall, Spiral, Agile), Requirement analysis" },
            { module: 1, unit: 2, topic: "System Modeling", details: "DFD, Use-case modeling, UML diagrams (class, sequence, activity)" },
            { module: 1, unit: 3, topic: "Design Engineering", details: "Architecture design, User-interface design, Component-based design" },
            { module: 1, unit: 4, topic: "Testing", details: "Unit testing, Integration testing, System testing, Alpha/Beta testing" },
            { module: 1, unit: 5, topic: "Maintenance", details: "Software quality, Risk management, DevOps life cycle" },
          ],
        },
        {
          name: "Engineering Mathematics–I",
          syllabus: [
            { module: 1, unit: 1, topic: "Limits & Continuity" },
            { module: 1, unit: 2, topic: "Differentiation" },
            { module: 1, unit: 3, topic: "Applications of derivatives" },
            { module: 1, unit: 4, topic: "Integration" },
            { module: 1, unit: 5, topic: "Differential equations" },
          ],
        },
        {
          name: "Physics for Engineers",
          syllabus: [
            { module: 1, unit: 1, topic: "Wave mechanics" },
            { module: 1, unit: 2, topic: "Optics" },
            { module: 1, unit: 3, topic: "Electromagnetism" },
            { module: 1, unit: 4, topic: "Semiconductor devices" },
          ],
        },
      ],
      2: [
        {
          name: "Data Structures & Algorithms",
          syllabus: [
            { module: 1, unit: 1, topic: "Complexity", details: "Time complexity, Space complexity, Big-O, Big-Ω, Big-Θ" },
            { module: 1, unit: 2, topic: "Trees", details: "BST, AVL, Red-Black Trees, Heaps" },
            { module: 1, unit: 3, topic: "Graph Algorithms", details: "DFS, BFS, Dijkstra, Bellman-Ford, Kruskal, Prim" },
            { module: 1, unit: 4, topic: "Advanced Sorting", details: "Heap sort, Tim sort, Radix sort" },
            { module: 1, unit: 5, topic: "Algorithm Design", details: "Divide & Conquer, Greedy, Dynamic Programming" },
          ],
        },
        {
          name: "Software Engineering (Advanced)",
          syllabus: [
            { module: 1, unit: 1, topic: "Detailed UML" },
            { module: 1, unit: 2, topic: "Project management" },
            { module: 1, unit: 3, topic: "Agile & Scrum" },
            { module: 1, unit: 4, topic: "Software metrics" },
            { module: 1, unit: 5, topic: "DevOps pipeline" },
          ],
        },
        {
          name: "Digital Logic Design",
          syllabus: [
            { module: 1, unit: 1, topic: "Boolean expressions" },
            { module: 1, unit: 2, topic: "Minimization" },
            { module: 1, unit: 3, topic: "MUX/DEMUX" },
            { module: 1, unit: 4, topic: "Latches & FF" },
            { module: 1, unit: 5, topic: "Counters & Registers" },
          ],
        },
      ],
      3: [
        {
          name: "Operating Systems",
          syllabus: [
            { module: 1, unit: 1, topic: "Process management" },
            { module: 1, unit: 2, topic: "CPU scheduling" },
            { module: 1, unit: 3, topic: "Deadlocks" },
            { module: 1, unit: 4, topic: "Memory management" },
            { module: 1, unit: 5, topic: "File systems" },
            { module: 1, unit: 6, topic: "I/O systems" },
            { module: 1, unit: 7, topic: "UNIX/Linux commands" },
          ],
        },
        {
          name: "Database Management Systems",
          syllabus: [
            { module: 1, unit: 1, topic: "ER modeling" },
            { module: 1, unit: 2, topic: "SQL" },
            { module: 1, unit: 3, topic: "Normalization" },
            { module: 1, unit: 4, topic: "Transaction processing" },
            { module: 1, unit: 5, topic: "Concurrency control" },
          ],
        },
        {
          name: "Computer Organization & Architecture",
          syllabus: [
            { module: 1, unit: 1, topic: "Logic circuits" },
            { module: 1, unit: 2, topic: "CPU design" },
            { module: 1, unit: 3, topic: "Memory hierarchy" },
            { module: 1, unit: 4, topic: "Pipelines" },
            { module: 1, unit: 5, topic: "Instruction set design" },
          ],
        },
        {
          name: "Discrete Mathematics",
          syllabus: [
            { module: 1, unit: 1, topic: "Sets, relations, functions" },
            { module: 1, unit: 2, topic: "Graph theory" },
            { module: 1, unit: 3, topic: "Boolean logic" },
            { module: 1, unit: 4, topic: "Combinatorics" },
          ],
        },
      ],
      4: [
        {
          name: "Design & Analysis of Algorithms",
          syllabus: [
            { module: 1, unit: 1, topic: "Recurrence relations" },
            { module: 1, unit: 2, topic: "Greedy & DP" },
            { module: 1, unit: 3, topic: "Backtracking" },
            { module: 1, unit: 4, topic: "NP-Completeness" },
          ],
        },
        {
          name: "Microprocessors",
          syllabus: [
            { module: 1, unit: 1, topic: "8085/8086 architecture" },
            { module: 1, unit: 2, topic: "Assembly language" },
            { module: 1, unit: 3, topic: "Memory interfacing" },
          ],
        },
        {
          name: "Computer Networks",
          syllabus: [
            { module: 1, unit: 1, topic: "OSI model" },
            { module: 1, unit: 2, topic: "TCP/IP" },
            { module: 1, unit: 3, topic: "Routing algorithms" },
            { module: 1, unit: 4, topic: "Ethernet, Wi-Fi" },
          ],
        },
      ],
      5: [
        {
          name: "Theory of Computation",
          syllabus: [
            { module: 1, unit: 1, topic: "Finite automata" },
            { module: 1, unit: 2, topic: "Regular languages" },
            { module: 1, unit: 3, topic: "Context-free grammars" },
            { module: 1, unit: 4, topic: "Turing machines" },
          ],
        },
        {
          name: "Compiler Design",
          syllabus: [
            { module: 1, unit: 1, topic: "Lexical analysis" },
            { module: 1, unit: 2, topic: "Parsing" },
            { module: 1, unit: 3, topic: "Code generation" },
            { module: 1, unit: 4, topic: "Optimization" },
          ],
        },
        {
          name: "Artificial Intelligence",
          syllabus: [
            { module: 1, unit: 1, topic: "Search methods" },
            { module: 1, unit: 2, topic: "Expert systems" },
            { module: 1, unit: 3, topic: "ML basics" },
          ],
        },
      ],
      6: [
        {
          name: "Machine Learning",
          syllabus: [
            { module: 1, unit: 1, topic: "Supervised/Unsupervised" },
            { module: 1, unit: 2, topic: "Regression" },
            { module: 1, unit: 3, topic: "Classification" },
            { module: 1, unit: 4, topic: "Clustering" },
            { module: 1, unit: 5, topic: "Neural networks" },
          ],
        },
        {
          name: "Distributed Systems",
          syllabus: [
            { module: 1, unit: 1, topic: "RPC" },
            { module: 1, unit: 2, topic: "Distributed database" },
            { module: 1, unit: 3, topic: "Synchronization" },
          ],
        },
        {
          name: "Big Data Analytics",
          syllabus: [
            { module: 1, unit: 1, topic: "Hadoop" },
            { module: 1, unit: 2, topic: "MapReduce" },
            { module: 1, unit: 3, topic: "Spark basics" },
          ],
        },
      ],
      7: [
        {
          name: "Deep Learning",
          syllabus: [
            { module: 1, unit: 1, topic: "CNN" },
            { module: 1, unit: 2, topic: "RNN" },
            { module: 1, unit: 3, topic: "LSTM" },
            { module: 1, unit: 4, topic: "GANs" },
          ],
        },
        {
          name: "Data Mining",
          syllabus: [
            { module: 1, unit: 1, topic: "Clustering" },
            { module: 1, unit: 2, topic: "Association rules" },
            { module: 1, unit: 3, topic: "Text mining" },
          ],
        },
      ],
      8: [
        {
          name: "Major Project & Internship",
          syllabus: [
            { module: 1, unit: 1, topic: "Project Planning" },
            { module: 1, unit: 2, topic: "Implementation" },
            { module: 1, unit: 3, topic: "Documentation" },
            { module: 1, unit: 4, topic: "Presentation" },
          ],
        },
      ],
    },
  },
  "BCA": {
    duration: "3 Years (6 Semesters)",
    semesters: {
      1: [
        {
          name: "Programming in C",
          syllabus: [
            { module: 1, unit: 1, topic: "Variables" },
            { module: 1, unit: 2, topic: "Pointers" },
            { module: 1, unit: 3, topic: "Loops" },
            { module: 1, unit: 4, topic: "Arrays" },
          ],
        },
        {
          name: "Computer Fundamentals",
          syllabus: [
            { module: 1, unit: 1, topic: "Computer Basics" },
            { module: 1, unit: 2, topic: "Hardware & Software" },
            { module: 1, unit: 3, topic: "Operating Systems" },
          ],
        },
        {
          name: "Digital Electronics",
          syllabus: [
            { module: 1, unit: 1, topic: "K-maps" },
            { module: 1, unit: 2, topic: "Number systems" },
            { module: 1, unit: 3, topic: "Logic Gates" },
          ],
        },
        {
          name: "Mathematics",
          syllabus: [
            { module: 1, unit: 1, topic: "Algebra" },
            { module: 1, unit: 2, topic: "Calculus" },
            { module: 1, unit: 3, topic: "Statistics" },
          ],
        },
      ],
      2: [
        {
          name: "Data Structures",
          syllabus: [
            { module: 1, unit: 1, topic: "Linked list" },
            { module: 1, unit: 2, topic: "Stacks" },
            { module: 1, unit: 3, topic: "Queues" },
          ],
        },
        {
          name: "OOP in C++",
          syllabus: [
            { module: 1, unit: 1, topic: "OOP principles" },
            { module: 1, unit: 2, topic: "Classes & Objects" },
            { module: 1, unit: 3, topic: "Inheritance" },
            { module: 1, unit: 4, topic: "Polymorphism" },
          ],
        },
        {
          name: "DBMS",
          syllabus: [
            { module: 1, unit: 1, topic: "SQL" },
            { module: 1, unit: 2, topic: "Joins" },
            { module: 1, unit: 3, topic: "Transactions" },
          ],
        },
      ],
      3: [
        {
          name: "Java Programming",
          syllabus: [
            { module: 1, unit: 1, topic: "Java Basics" },
            { module: 1, unit: 2, topic: "OOP in Java" },
            { module: 1, unit: 3, topic: "Exception Handling" },
          ],
        },
        {
          name: "Operating Systems",
          syllabus: [
            { module: 1, unit: 1, topic: "Process Management" },
            { module: 1, unit: 2, topic: "Memory Management" },
            { module: 1, unit: 3, topic: "File Systems" },
          ],
        },
        {
          name: "Web Technologies",
          syllabus: [
            { module: 1, unit: 1, topic: "HTML/CSS" },
            { module: 1, unit: 2, topic: "JavaScript" },
            { module: 1, unit: 3, topic: "PHP" },
          ],
        },
      ],
      4: [
        {
          name: "Software Engineering",
          syllabus: [
            { module: 1, unit: 1, topic: "SDLC" },
            { module: 1, unit: 2, topic: "UML" },
            { module: 1, unit: 3, topic: "Testing" },
          ],
        },
        {
          name: "Python Programming",
          syllabus: [
            { module: 1, unit: 1, topic: "Python Basics" },
            { module: 1, unit: 2, topic: "Data Structures" },
            { module: 1, unit: 3, topic: "OOP in Python" },
          ],
        },
        {
          name: "RDBMS",
          syllabus: [
            { module: 1, unit: 1, topic: "Advanced SQL" },
            { module: 1, unit: 2, topic: "Normalization" },
            { module: 1, unit: 3, topic: "PL/SQL" },
          ],
        },
      ],
      5: [
        {
          name: "Data Analytics",
          syllabus: [
            { module: 1, unit: 1, topic: "Data Analysis" },
            { module: 1, unit: 2, topic: "Visualization" },
            { module: 1, unit: 3, topic: "Tools" },
          ],
        },
        {
          name: "Cloud Computing",
          syllabus: [
            { module: 1, unit: 1, topic: "Cloud Models" },
            { module: 1, unit: 2, topic: "AWS Basics" },
            { module: 1, unit: 3, topic: "Deployment" },
          ],
        },
        {
          name: "Cybersecurity",
          syllabus: [
            { module: 1, unit: 1, topic: "Security Basics" },
            { module: 1, unit: 2, topic: "Cryptography" },
            { module: 1, unit: 3, topic: "Network Security" },
          ],
        },
      ],
      6: [
        {
          name: "AI & Machine Learning",
          syllabus: [
            { module: 1, unit: 1, topic: "ML Basics" },
            { module: 1, unit: 2, topic: "Supervised Learning" },
            { module: 1, unit: 3, topic: "Unsupervised Learning" },
          ],
        },
        {
          name: "Major Project",
          syllabus: [
            { module: 1, unit: 1, topic: "Project Planning" },
            { module: 1, unit: 2, topic: "Implementation" },
            { module: 1, unit: 3, topic: "Documentation" },
          ],
        },
      ],
    },
  },
  "MCA": {
    duration: "4 Semesters",
    semesters: {
      1: [
        {
          name: "Data Structures",
          syllabus: [
            { module: 1, unit: 1, topic: "Trees" },
            { module: 1, unit: 2, topic: "Sorting" },
            { module: 1, unit: 3, topic: "Advanced Structures" },
          ],
        },
        {
          name: "Java",
          syllabus: [
            { module: 1, unit: 1, topic: "JDBC" },
            { module: 1, unit: 2, topic: "Advanced Java" },
            { module: 1, unit: 3, topic: "Frameworks" },
          ],
        },
        {
          name: "DBMS",
          syllabus: [
            { module: 1, unit: 1, topic: "SQL" },
            { module: 1, unit: 2, topic: "Advanced Queries" },
            { module: 1, unit: 3, topic: "Transactions" },
          ],
        },
        {
          name: "Software Engineering",
          syllabus: [
            { module: 1, unit: 1, topic: "SDLC" },
            { module: 1, unit: 2, topic: "UML" },
            { module: 1, unit: 3, topic: "Agile" },
          ],
        },
      ],
      2: [
        {
          name: "Operating Systems",
          syllabus: [
            { module: 1, unit: 1, topic: "Advanced OS Concepts" },
            { module: 1, unit: 2, topic: "Process Scheduling" },
            { module: 1, unit: 3, topic: "Memory Management" },
          ],
        },
        {
          name: "Computer Networks",
          syllabus: [
            { module: 1, unit: 1, topic: "Network Protocols" },
            { module: 1, unit: 2, topic: "Routing" },
            { module: 1, unit: 3, topic: "Security" },
          ],
        },
        {
          name: "Web Technologies",
          syllabus: [
            { module: 1, unit: 1, topic: "Advanced Web Development" },
            { module: 1, unit: 2, topic: "Frameworks" },
            { module: 1, unit: 3, topic: "APIs" },
          ],
        },
        {
          name: "Advanced Java",
          syllabus: [
            { module: 1, unit: 1, topic: "Enterprise Java" },
            { module: 1, unit: 2, topic: "Spring Framework" },
            { module: 1, unit: 3, topic: "Hibernate" },
          ],
        },
      ],
      3: [
        {
          name: "Machine Learning",
          syllabus: [
            { module: 1, unit: 1, topic: "ML Algorithms" },
            { module: 1, unit: 2, topic: "Deep Learning" },
            { module: 1, unit: 3, topic: "Applications" },
          ],
        },
        {
          name: "Cloud Computing",
          syllabus: [
            { module: 1, unit: 1, topic: "Cloud Architecture" },
            { module: 1, unit: 2, topic: "AWS/Azure" },
            { module: 1, unit: 3, topic: "DevOps" },
          ],
        },
        {
          name: "Distributed Systems",
          syllabus: [
            { module: 1, unit: 1, topic: "Distributed Architecture" },
            { module: 1, unit: 2, topic: "Consistency" },
            { module: 1, unit: 3, topic: "Scalability" },
          ],
        },
      ],
      4: [
        {
          name: "Internship",
          syllabus: [
            { module: 1, unit: 1, topic: "Industry Exposure" },
            { module: 1, unit: 2, topic: "Practical Training" },
          ],
        },
        {
          name: "Major Project",
          syllabus: [
            { module: 1, unit: 1, topic: "Project Planning" },
            { module: 1, unit: 2, topic: "Implementation" },
            { module: 1, unit: 3, topic: "Documentation & Presentation" },
          ],
        },
      ],
    },
  },
  "BSc IT": {
    duration: "3 Years (6 Semesters)",
    semesters: {
      1: [
        { name: "C Programming", syllabus: [{ module: 1, unit: 1, topic: "C Basics" }, { module: 1, unit: 2, topic: "Pointers" }, { module: 1, unit: 3, topic: "Functions" }] },
        { name: "Digital Logic", syllabus: [{ module: 1, unit: 1, topic: "Logic Gates" }, { module: 1, unit: 2, topic: "Boolean Algebra" }] },
        { name: "Mathematics", syllabus: [{ module: 1, unit: 1, topic: "Algebra" }, { module: 1, unit: 2, topic: "Calculus" }] },
      ],
      2: [
        { name: "Data Structures", syllabus: [{ module: 1, unit: 1, topic: "Arrays & Lists" }, { module: 1, unit: 2, topic: "Stacks & Queues" }] },
        { name: "DBMS", syllabus: [{ module: 1, unit: 1, topic: "SQL" }, { module: 1, unit: 2, topic: "Normalization" }] },
        { name: "Web Technologies", syllabus: [{ module: 1, unit: 1, topic: "HTML/CSS" }, { module: 1, unit: 2, topic: "JavaScript" }] },
      ],
      3: [
        { name: "Java", syllabus: [{ module: 1, unit: 1, topic: "Java Basics" }, { module: 1, unit: 2, topic: "OOP" }] },
        { name: "Operating Systems", syllabus: [{ module: 1, unit: 1, topic: "OS Concepts" }, { module: 1, unit: 2, topic: "Process Management" }] },
        { name: "Statistics", syllabus: [{ module: 1, unit: 1, topic: "Descriptive Statistics" }, { module: 1, unit: 2, topic: "Probability" }] },
      ],
      4: [
        { name: "Computer Networks", syllabus: [{ module: 1, unit: 1, topic: "Network Basics" }, { module: 1, unit: 2, topic: "Protocols" }] },
        { name: "Python", syllabus: [{ module: 1, unit: 1, topic: "Python Basics" }, { module: 1, unit: 2, topic: "Data Structures" }] },
        { name: "Software Engineering", syllabus: [{ module: 1, unit: 1, topic: "SDLC" }, { module: 1, unit: 2, topic: "UML" }] },
      ],
      5: [
        { name: "Cloud Computing", syllabus: [{ module: 1, unit: 1, topic: "Cloud Models" }, { module: 1, unit: 2, topic: "Services" }] },
        { name: "Cybersecurity", syllabus: [{ module: 1, unit: 1, topic: "Security Basics" }, { module: 1, unit: 2, topic: "Threats" }] },
        { name: "Elective", syllabus: [{ module: 1, unit: 1, topic: "Elective Subject" }] },
      ],
      6: [
        { name: "Major Project", syllabus: [{ module: 1, unit: 1, topic: "Project Work" }] },
      ],
    },
  },
  "BBA": {
    duration: "3 Years (6 Semesters)",
    semesters: {
      1: [
        { name: "Principles of Management", syllabus: [{ module: 1, unit: 1, topic: "Management Basics" }, { module: 1, unit: 2, topic: "Functions" }] },
        { name: "Micro Economics", syllabus: [{ module: 1, unit: 1, topic: "Demand & Supply" }, { module: 1, unit: 2, topic: "Market Structures" }] },
      ],
      2: [
        { name: "Macro Economics", syllabus: [{ module: 1, unit: 1, topic: "National Income" }, { module: 1, unit: 2, topic: "Monetary Policy" }] },
        { name: "Accounting", syllabus: [{ module: 1, unit: 1, topic: "Financial Accounting" }, { module: 1, unit: 2, topic: "Cost Accounting" }] },
      ],
      3: [
        { name: "Human Resource Management", syllabus: [{ module: 1, unit: 1, topic: "HR Functions" }, { module: 1, unit: 2, topic: "Recruitment" }] },
        { name: "Marketing", syllabus: [{ module: 1, unit: 1, topic: "Marketing Basics" }, { module: 1, unit: 2, topic: "4Ps" }] },
      ],
      4: [
        { name: "Operations Management", syllabus: [{ module: 1, unit: 1, topic: "Operations Basics" }, { module: 1, unit: 2, topic: "Quality Management" }] },
        { name: "Business Law", syllabus: [{ module: 1, unit: 1, topic: "Contract Law" }, { module: 1, unit: 2, topic: "Company Law" }] },
      ],
      5: [
        { name: "Project Management", syllabus: [{ module: 1, unit: 1, topic: "Project Planning" }, { module: 1, unit: 2, topic: "Execution" }] },
      ],
      6: [
        { name: "Strategic Management", syllabus: [{ module: 1, unit: 1, topic: "Strategy Formulation" }, { module: 1, unit: 2, topic: "Implementation" }] },
      ],
    },
  },
  "MBA": {
    duration: "2 Years (4 Semesters)",
    semesters: {
      1: [
        { name: "Finance", syllabus: [{ module: 1, unit: 1, topic: "Financial Management" }, { module: 1, unit: 2, topic: "Investment Analysis" }] },
        { name: "Marketing", syllabus: [{ module: 1, unit: 1, topic: "Marketing Strategy" }, { module: 1, unit: 2, topic: "Brand Management" }] },
        { name: "Statistics", syllabus: [{ module: 1, unit: 1, topic: "Business Statistics" }, { module: 1, unit: 2, topic: "Data Analysis" }] },
      ],
      2: [
        { name: "Human Resources", syllabus: [{ module: 1, unit: 1, topic: "HR Strategy" }, { module: 1, unit: 2, topic: "Talent Management" }] },
        { name: "Business Communication", syllabus: [{ module: 1, unit: 1, topic: "Communication Skills" }, { module: 1, unit: 2, topic: "Presentation" }] },
        { name: "Operations", syllabus: [{ module: 1, unit: 1, topic: "Operations Strategy" }, { module: 1, unit: 2, topic: "Supply Chain" }] },
      ],
      3: [
        { name: "Strategic Management", syllabus: [{ module: 1, unit: 1, topic: "Corporate Strategy" }, { module: 1, unit: 2, topic: "Competitive Advantage" }] },
        { name: "Research Methodology", syllabus: [{ module: 1, unit: 1, topic: "Research Design" }, { module: 1, unit: 2, topic: "Data Collection" }] },
      ],
      4: [
        { name: "Internship", syllabus: [{ module: 1, unit: 1, topic: "Industry Training" }] },
        { name: "Major Project", syllabus: [{ module: 1, unit: 1, topic: "Research Project" }, { module: 1, unit: 2, topic: "Dissertation" }] },
      ],
    },
  },
};

async function populateDatabase() {
  console.log("Starting database population...");

  try {
    for (const [courseName, courseData] of Object.entries(syllabusData)) {
      console.log(`\nCreating course: ${courseName}`);

      // Create or get course
      let course = await prisma.course.findUnique({
        where: { name: courseName },
      });

      if (!course) {
        course = await prisma.course.create({
          data: { name: courseName },
        });
        console.log(`  ✓ Created course: ${courseName}`);
      } else {
        console.log(`  → Course already exists: ${courseName}`);
      }

      // Create semesters and subjects
      for (const [semesterNum, subjects] of Object.entries(courseData.semesters)) {
        const semesterNumber = parseInt(semesterNum, 10);
        console.log(`  Creating Semester ${semesterNumber}...`);

        // Create or get semester
        let semester = await prisma.semester.findUnique({
          where: {
            courseId_number: {
              courseId: course.id,
              number: semesterNumber,
            },
          },
        });

        if (!semester) {
          semester = await prisma.semester.create({
            data: {
              courseId: course.id,
              number: semesterNumber,
            },
          });
          console.log(`    ✓ Created semester ${semesterNumber}`);
        }

        // Create subjects
        for (const subjectData of subjects) {
          let subject = await prisma.subject.findUnique({
            where: {
              semesterId_name: {
                semesterId: semester.id,
                name: subjectData.name,
              },
            },
          });

          if (!subject) {
            subject = await prisma.subject.create({
              data: {
                semesterId: semester.id,
                name: subjectData.name,
              },
            });
            console.log(`      ✓ Created subject: ${subjectData.name}`);
          }

          // Check existing syllabus items
          const existingItems = await prisma.syllabusItem.findMany({
            where: { subjectId: subject.id },
          });

          const existingKeys = new Set(
            existingItems.map((item) => `${item.module}-${item.unit}-${item.topic}`)
          );

          // Create syllabus items
          let createdCount = 0;
          for (const syllabusItem of subjectData.syllabus) {
            const key = `${syllabusItem.module}-${syllabusItem.unit}-${syllabusItem.topic}`;
            if (!existingKeys.has(key)) {
              await prisma.syllabusItem.create({
                data: {
                  subjectId: subject.id,
                  module: syllabusItem.module,
                  unit: syllabusItem.unit,
                  topic: syllabusItem.topic,
                  details: (syllabusItem as any).details || null,
                },
              });
              createdCount++;
            }
          }
          if (createdCount > 0) {
            console.log(`        ✓ Added ${createdCount} new syllabus items`);
          } else {
            console.log(`        → Syllabus items already exist`);
          }
          console.log(`        ✓ Added ${subjectData.syllabus.length} syllabus items`);
        }
      }
    }

    console.log("\n✅ Database population completed successfully!");
  } catch (error) {
    console.error("❌ Error populating database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateDatabase()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
