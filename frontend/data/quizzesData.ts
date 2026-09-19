export interface QuizQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseTitle: string;
  category: string;
  title: string;
  description: string;
  fullOverview: string;
  topicsCovered: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  xpReward: number;
  questions: QuizQuestion[];
}

export const ALL_QUIZZES: Quiz[] = [
  {
    id: "py-quiz-1",
    courseId: "python-101",
    courseTitle: "Python Programming Jungle",
    category: "Python",
    title: "Python Syntax & Functions Challenge",
    description: "Test your understanding of function definitions, variable scopes, and loops in Python.",
    fullOverview: "This comprehensive test evaluates your core Python programming skills. You will be tested on function declarations, list comprehensions, and list manipulation algorithms.",
    topicsCovered: [
      "Function declaration syntax with `def`",
      "List comprehensions and filtering conditions",
      "List methods like `.append()` and `.insert()`",
    ],
    level: "Beginner",
    estimatedMinutes: 10,
    xpReward: 200,
    questions: [
      {
        id: 1,
        question: "Which keyword is used to declare a function in Python?",
        codeSnippet: "# Example function declaration\n??? my_function():\n    print('Hello World')",
        options: ["func", "def", "function", "define"],
        correctIndex: 1,
        explanation: "In Python, functions are defined using the 'def' keyword followed by the function name and parentheses.",
      },
      {
        id: 2,
        question: "What will be the output of the following list comprehension?",
        codeSnippet: "nums = [1, 2, 3, 4]\nevens = [x * 2 for x in nums if x % 2 == 0]\nprint(evens)",
        options: ["[2, 4, 6, 8]", "[4, 8]", "[2, 4]", "[4, 6]"],
        correctIndex: 1,
        explanation: "The filter 'if x % 2 == 0' selects 2 and 4. Multiplying each by 2 yields [4, 8].",
      },
      {
        id: 3,
        question: "How do you append an item to a list in Python?",
        codeSnippet: "my_list = [10, 20]\n# Add 30 to the list",
        options: ["my_list.add(30)", "my_list.push(30)", "my_list.append(30)", "my_list.insert(30)"],
        correctIndex: 2,
        explanation: "Python lists use the '.append(item)' method to add an element to the end of the list.",
      },
    ],
  },
  {
    id: "web-quiz-1",
    courseId: "web-dev-202",
    courseTitle: "Web Development Starter",
    category: "Web Dev",
    title: "React State & Props Mastery",
    description: "Challenge your knowledge of React hooks, component re-renders, and JSX syntax.",
    fullOverview: "Validate your React skills with questions covering essential hooks like `useState`, parent-child props communication, and JSX syntax fundamentals.",
    topicsCovered: [
      "React hooks: `useState` & `useEffect`",
      "Parent to child props data flow",
      "JSX syntax rules and rendering",
    ],
    level: "Beginner",
    estimatedMinutes: 12,
    xpReward: 250,
    questions: [
      {
        id: 1,
        question: "Which React hook is used to handle state inside a functional component?",
        codeSnippet: "import { ??? } from 'react';\n\nconst [count, setCount] = ???(0);",
        options: ["useRef", "useEffect", "useState", "useContext"],
        correctIndex: 2,
        explanation: "'useState' returns a stateful value and a function to update it in functional components.",
      },
      {
        id: 2,
        question: "What is the correct way to pass data from a parent to a child component in React?",
        options: ["Using Redux only", "Using Props", "Using LocalStorage", "Using CSS variables"],
        correctIndex: 1,
        explanation: "Props (short for properties) are the standard way to pass data down from parent to child components.",
      },
      {
        id: 3,
        question: "What does JSX stand for in React?",
        options: ["JavaScript XML", "Java Syntax Extension", "JSON Xtension", "JavaScript Standard XML"],
        correctIndex: 0,
        explanation: "JSX stands for JavaScript XML, allowing you to write HTML-like elements inside JavaScript.",
      },
    ],
  },
  {
    id: "cpp-quiz-1",
    courseId: "cpp-303",
    courseTitle: "C++ & Data Structures",
    category: "C++",
    title: "Pointers & Memory Management Quiz",
    description: "Deep dive into pointer arithmetic, memory allocation, and stack vs heap in C++.",
    fullOverview: "A technical evaluation of C++ pointers, dynamic memory allocation using `new`, and fundamental data structures like stacks and queues.",
    topicsCovered: [
      "Memory address operator `&` and dereference operator `*`",
      "Dynamic allocation with `new` and `delete`",
      "LIFO Stack vs FIFO Queue mechanics",
    ],
    level: "Intermediate",
    estimatedMinutes: 15,
    xpReward: 350,
    questions: [
      {
        id: 1,
        question: "Which operator is used to access the memory address of a variable in C++?",
        codeSnippet: "int val = 42;\nint* ptr = ???val;",
        options: ["*", "&", "->", "."],
        correctIndex: 1,
        explanation: "The address-of operator '&' returns the memory address of a variable.",
      },
      {
        id: 2,
        question: "What keyword is used to allocate memory on the heap dynamically in C++?",
        options: ["malloc", "alloc", "new", "create"],
        correctIndex: 2,
        explanation: "In modern C++, 'new' is used to dynamically allocate objects on the heap.",
      },
      {
        id: 3,
        question: "Which data structure follows the LIFO (Last In First Out) principle?",
        options: ["Queue", "Stack", "Vector", "Linked List"],
        correctIndex: 1,
        explanation: "A Stack operates on LIFO (Last In First Out), whereas a Queue operates on FIFO.",
      },
    ],
  },
  {
    id: "ai-quiz-1",
    courseId: "ai-404",
    courseTitle: "AI & Machine Learning Intro",
    category: "AI & Data",
    title: "Neural Networks & Prompt Engineering Quiz",
    description: "Evaluate your understanding of machine learning models, activation functions, and LLMs.",
    fullOverview: "Explore key AI concepts including activation functions, model overfitting, and supervised vs unsupervised machine learning techniques.",
    topicsCovered: [
      "Neural network activation functions",
      "Overfitting and generalization",
      "Supervised learning with labeled datasets",
    ],
    level: "Advanced",
    estimatedMinutes: 15,
    xpReward: 400,
    questions: [
      {
        id: 1,
        question: "What is the primary role of an activation function in a Neural Network?",
        options: [
          "To speed up database connections",
          "To introduce non-linearity into the model",
          "To compress image file sizes",
          "To format output strings",
        ],
        correctIndex: 1,
        explanation: "Activation functions introduce non-linearities into neural networks, allowing them to learn complex patterns.",
      },
      {
        id: 2,
        question: "In Machine Learning, what is 'Overfitting'?",
        options: [
          "When a model performs well on training data but poorly on unseen test data",
          "When a model trains too quickly",
          "When a dataset has too few columns",
          "When the model size exceeds 1 GB",
        ],
        correctIndex: 0,
        explanation: "Overfitting happens when a model memorizes noise in the training set instead of learning general rules.",
      },
      {
        id: 3,
        question: "Which type of learning uses labeled input and output datasets?",
        options: ["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Self-Directed Learning"],
        correctIndex: 1,
        explanation: "Supervised Learning algorithms are trained using annotated/labeled data pairs.",
      },
    ],
  },
  {
    id: "js-quiz-1",
    courseId: "js-505",
    courseTitle: "JavaScript & Async Masterclass",
    category: "JavaScript",
    title: "Async/Await & Promises Deep Dive",
    description: "Master asynchronous control flow, event loops, and microtask queues.",
    fullOverview: "Test your mastery over JavaScript asynchronous code execution, Promise states, async/await rules, and Promise.all error handling.",
    topicsCovered: [
      "Promise lifecycle states (Pending, Fulfilled, Rejected)",
      "Async function declaration requirements",
      "Error handling with `Promise.all()`",
    ],
    level: "Intermediate",
    estimatedMinutes: 12,
    xpReward: 300,
    questions: [
      {
        id: 1,
        question: "What state is a Promise in right after it is created?",
        options: ["Fulfilled", "Rejected", "Pending", "Settled"],
        correctIndex: 2,
        explanation: "A new Promise starts in the 'Pending' state until it resolves or rejects.",
      },
      {
        id: 2,
        question: "What keyword must precede a function definition to use 'await' inside it?",
        codeSnippet: "??? function fetchData() {\n    const res = await fetch(url);\n}",
        options: ["defer", "async", "promise", "sync"],
        correctIndex: 1,
        explanation: "The 'await' keyword can only be used inside functions declared with 'async'.",
      },
      {
        id: 3,
        question: "What does 'Promise.all()' do when one of the passed promises rejects?",
        options: [
          "Waits for all others to finish",
          "Immediately rejects with the first error",
          "Ignores the error and returns valid ones",
          "Returns null",
        ],
        correctIndex: 1,
        explanation: "Promise.all fails fast: if any promise rejects, the entire Promise.all immediately rejects.",
      },
    ],
  },
];

export function getQuizById(id: string): Quiz | undefined {
  return ALL_QUIZZES.find((q) => q.id === id);
}
