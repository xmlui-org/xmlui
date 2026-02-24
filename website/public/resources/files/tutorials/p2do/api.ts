import { ApiInterceptorDefinition } from "xmlui";

const today = new Date();
today.setHours(23, 59, 59, 999);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const twoDaysLater = new Date(today);
twoDaysLater.setDate(twoDaysLater.getDate() + 2);
const threeDaysLater = new Date(today);
threeDaysLater.setDate(threeDaysLater.getDate() + 3);
const weekLater = new Date(today);
weekLater.setDate(weekLater.getDate() + 7);
const monthLater = new Date(today);
monthLater.setMonth(monthLater.getMonth() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysEarlier = new Date(today);
twoDaysEarlier.setDate(twoDaysEarlier.getDate() - 2);
const threeDaysEarlier = new Date(today);
threeDaysEarlier.setDate(threeDaysEarlier.getDate() - 3);
const weekEarlier = new Date(today);
weekEarlier.setDate(weekEarlier.getDate() - 7);
const monthEarlier = new Date(today);
monthEarlier.setMonth(monthEarlier.getMonth() - 1);

const mock: ApiInterceptorDefinition = {
  type: "db",
  config: {
    database: "xmluiTodoApp",
    version: 2,
  },
  apiUrl: "/api",
  initialData: {
    users: [
      {
        id: 1,
        displayName: "John Smith",
        avatarUrl: "resource:avatar-user",
      },
      {
        id: 2,
        displayName: "Jane Smith",
        avatarUrl: "resource:avatar-user",
      },
    ],
    topics: [
      {
        id: 1,
        name: "Work",
        color: "#3455eb",
      },
      {
        id: 2,
        name: "Personal",
        color: "#ebc334",
      },
      {
        id: 3,
        name: "Shopping",
        color: "#2a9660",
      },
      {
        id: 4,
        name: "Health",
        color: "#ff5733",
      },
      {
        id: 5,
        name: "Fitness",
        color: "#34eb67",
      },
      {
        id: 6,
        name: "Education",
        color: "#a934eb",
      },
      {
        id: 7,
        name: "Hobbies",
        color: "#eb34b3",
      },
      {
        id: 8,
        name: "Travel",
        color: "#33ff57",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Buy vegetables",
        topicId: 3,
        description: "Buy assorted vegetables from the market",
        createdDate: twoDaysEarlier.toISOString(),
        dueDate: today.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 2,
        title: "Finish presentation",
        topicId: 1,
        description: "Finalize the presentation slides for the client meeting",
        createdDate: threeDaysEarlier.toISOString(),
        dueDate: today.toISOString(),
        completed: true,
        completedDate: today.toISOString(),
        assignedTo: 1,
      },
      {
        id: 3,
        title: "Schedule dentist appointment",
        topicId: 4,
        description: "Book an appointment with the dentist for a check-up",
        createdDate: threeDaysEarlier.toISOString(),
        dueDate: null,
        completed: true,
        completedDate: yesterday.toISOString(),
        assignedTo: 1,
      },
      {
        id: 4,
        title: "Run 5k",
        topicId: 5,
        description: "Complete a 5-kilometer run in the park",
        createdDate: today.toISOString(),
        dueDate: twoDaysLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 5,
        title: "Read chapter 3",
        topicId: 6,
        description: "Read and summarize chapter 3 of the textbook",
        createdDate: threeDaysEarlier.toISOString(),
        dueDate: weekLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 6,
        title: "Painting session",
        topicId: 7,
        description: "Spend an hour painting a landscape",
        createdDate: yesterday.toISOString(),
        dueDate: twoDaysLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 7,
        title: "Plan weekend trip",
        topicId: 8,
        description: "Research and plan activities for the upcoming weekend trip",
        createdDate: today.toISOString(),
        dueDate: null,
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 8,
        title: "Yoga session",
        topicId: 5,
        description: "Attend a yoga class for relaxation",
        createdDate: yesterday.toISOString(),
        dueDate: tomorrow.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 9,
        title: "Complete online course",
        topicId: 6,
        description: "Finish the remaining modules of the online course",
        createdDate: threeDaysEarlier.toISOString(),
        dueDate: monthLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 10,
        title: "Buy birthday gift",
        topicId: 3,
        description: "Purchase a gift for a friend's birthday",
        createdDate: twoDaysEarlier.toISOString(),
        dueDate: monthLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 11,
        title: "Submit expense report",
        topicId: 1,
        description: "Compile and submit the monthly expense report",
        createdDate: threeDaysEarlier.toISOString(),
        dueDate: yesterday.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 12,
        title: "Visit gym",
        topicId: 5,
        description: "Hit the gym for a strength training session",
        createdDate: monthEarlier.toISOString(),
        dueDate: null,
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 13,
        title: "Study for exam",
        topicId: 6,
        description: "Review notes and prepare for the upcoming exam",
        createdDate: monthEarlier.toISOString(),
        dueDate: yesterday.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 14,
        title: "Cook dinner",
        topicId: 2,
        description: "Prepare a healthy dinner at home",
        createdDate: today.toISOString(),
        dueDate: today.toISOString(),
        completed: true,
        completedDate: today.toISOString(),
        assignedTo: 1,
      },
      {
        id: 15,
        title: "Buy groceries",
        topicId: 3,
        description: "Stock up on essential groceries for the week",
        createdDate: yesterday.toISOString(),
        dueDate: twoDaysLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 16,
        title: "Write blog post",
        topicId: 1,
        description: "Draft a blog post on industry trends",
        createdDate: weekEarlier.toISOString(),
        dueDate: null,
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 17,
        title: "Go for a walk",
        topicId: 5,
        description: "Take a brisk walk in the neighborhood for exercise",
        createdDate: yesterday.toISOString(),
        dueDate: null,
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 18,
        title: "Research new hobby",
        topicId: 7,
        description: "Explore potential new hobbies and interests",
        createdDate: monthEarlier.toISOString(),
        dueDate: null,
        completed: true,
        completedDate: weekEarlier.toISOString(),
        assignedTo: 1,
      },
      {
        id: 19,
        title: "Book flight tickets",
        topicId: 8,
        description: "Book flight tickets for the upcoming vacation",
        createdDate: weekEarlier.toISOString(),
        dueDate: today.toISOString(),
        completed: true,
        completedDate: today.toISOString(),
        assignedTo: 1,
      },
      {
        id: 20,
        title: "Review health goals",
        topicId: 4,
        description: "Review and adjust personal health and fitness goals",
        createdDate: threeDaysEarlier.toISOString(),
        dueDate: weekLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 21,
        title: "Attend networking event",
        topicId: 1,
        description: "Attend a networking event to expand professional contacts",
        createdDate: twoDaysEarlier.toISOString(),
        dueDate: yesterday.toISOString(),
        completed: true,
        completedDate: today.toISOString(),
        assignedTo: 1,
      },
      {
        id: 22,
        title: "Practice meditation",
        topicId: 2,
        description: "Dedicate time to practice mindfulness meditation",
        createdDate: weekEarlier.toISOString(),
        dueDate: null,
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 23,
        title: "Buy new running shoes",
        topicId: 5,
        description: "Purchase a new pair of running shoes for better support",
        createdDate: yesterday.toISOString(),
        dueDate: weekLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 24,
        title: "Learn a new recipe",
        topicId: 2,
        description: "Experiment with a new recipe for dinner",
        createdDate: monthEarlier.toISOString(),
        dueDate: null,
        completed: true,
        completedDate: threeDaysEarlier.toISOString(),
        assignedTo: 1,
      },
      {
        id: 25,
        title: "Explore local art gallery",
        topicId: 7,
        description: "Visit a local art gallery to appreciate artworks",
        createdDate: threeDaysEarlier.toISOString(),
        dueDate: null,
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 26,
        title: "Update resume",
        topicId: 1,
        description: "Review and update the resume with recent achievements",
        createdDate: twoDaysEarlier.toISOString(),
        dueDate: twoDaysLater.toISOString(),
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 27,
        title: "Organize closet",
        topicId: 2,
        description: "Declutter and organize the wardrobe",
        createdDate: "2024-04-19T00:00:00Z",
        dueDate: "2024-06-20T23:59:59Z",
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 28,
        title: "Plan outdoor picnic",
        topicId: 7,
        description: "Plan a picnic outing with friends or family",
        createdDate: "2024-04-19T00:00:00Z",
        dueDate: "2024-06-22T23:59:59Z",
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 29,
        title: "Research new travel destination",
        topicId: 8,
        description: "Research and plan a trip to a new travel destination",
        createdDate: "2024-04-19T00:00:00Z",
        dueDate: "2024-06-25T23:59:59Z",
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
      {
        id: 30,
        title: "Update health tracker",
        topicId: 4,
        description: "Update the health tracker app with recent activities",
        createdDate: "2024-04-19T00:00:00Z",
        dueDate: "2024-06-28T23:59:59Z",
        completed: false,
        completedDate: null,
        assignedTo: 1,
      },
    ],
  },

  helpers: {
    Assertions: {
      ensureTask: `(taskId) => {
        const foundTask = $db.$tasks.byId(taskId);
        if (!foundTask) {
          throw Errors.NotFound404("Task id:" + taskId + " not found");
        };
        return foundTask;
      }`,
    },
    getSection: `(task) => {
      if (task.completed) return "Completed";
      if (!task.dueDate) return "NoDueDate";
      if (isToday(task.dueDate)) return "Today";
      return getDate(task.dueDate) < getDate() 
        ? "Overdue" 
        : "Upcoming";
    }`,
  },

  auth: {
    defaultLoggedInUser: {
      id: 1,
    },
  },

  operations: {
    login: {
      url: "/login",
      method: "post",
      queryParamTypes: {
        userId: "integer",
      },
      handler: "$authService.login({id: $queryParams.userId})",
    },

    loadMe: {
      url: "/users/me",
      method: "get",
      handler: "$db.$users.byId($loggedInUser.id)",
    },

    "users-list": {
      url: "/users",
      method: "get",
      responseShape: "user[]",
      handler: `$db.$users.toArray()`,
    },

    "task-list": {
      url: "/tasks",
      method: "get",
      responseShape: "task[]",
      handler: `$db.$tasks.toArray();`,
    },

    "task-list-recent": {
      url: "/tasks-recent",
      method: "get",
      responseShape: "task[]",
      handler: `$db.$tasks.orderBy(t => t.id, true).take(5).toArray();`,
    },

    "task-list-overdue": {
      url: "/tasks/overdue",
      method: "get",
      responseShape: "task[]",
      handler: `$db.$tasks.whereAsArray(t => getSection(t) === 'Overdue');`,
    },

    "task-list-today": {
      url: "/tasks/today",
      method: "get",
      responseShape: "task[]",
      handler: `$db.$tasks.whereAsArray(t => 
        !t.completed && t.dueDate && 
        $env.getDate(t.dueDate).setHours(0,0,0,0) === $env.getDate().setHours(0,0,0,0)
      );`,
    },

    "task-list-upcoming": {
      url: "/tasks/upcoming",
      method: "get",
      responseShape: "task[]",
      handler: `$db.$tasks.whereAsArray(t => getSection(t) === 'Upcoming');`,
    },

    "task-list-completed": {
      url: "/tasks/completed",
      method: "get",
      responseShape: "task[]",
      handler: `$db.$tasks.whereAsArray(t => getSection(t) === 'Completed');`,
    },

    "task-counts": {
      url: "/taskcounts",
      method: "get",
      handler: `return {
        all: $db.$tasks.toArray().length,
        overdue: $db.$tasks.whereAsArray(t => getSection(t) === 'Overdue').length,
        today: $db.$tasks.whereAsArray(t => 
          !t.completed && t.dueDate && 
          $env.getDate(t.dueDate).setHours(0,0,0,0) === $env.getDate().setHours(0,0,0,0)
        ).length,
        upcoming: $db.$tasks.whereAsArray(t => getSection(t) === 'Upcoming').length,
        completed: $db.$tasks.whereAsArray(t => getSection(t) === 'Completed').length
      }`,
    },

    // --- Retrieve a particular task data
    "tasks-read": {
      url: "/tasks/:taskId",
      method: "get",
      responseShape: "task",
      pathParamTypes: {
        taskId: "integer",
      },
      handler: "Assertions.ensureTask($pathParams.taskId)",
    },

    "tasks-delete": {
      url: "/tasks/:taskId",
      method: "delete",
      pathParamTypes: {
        taskId: "integer",
      },
      handler: `
        const taskId = $pathParams.taskId;
        const task = Assertions.ensureTask(taskId);
        if (task) {
          $db.$tasks.deleteById(taskId);
        }
      `,
    },

    "tasks-edit": {
      url: "/tasks/:taskId",
      pathParamTypes: {
        taskId: "integer",
      },
      method: "put",
      handler: `
        // --- Get task attributes
        const taskId = $pathParams.taskId;
        const { 
          title, 
          topicId, 
          description, 
          createdDate, 
          dueDate, 
          assignedTo, 
          completed, 
          completedDate 
        } = $requestBody; 
        
        // --- Update the task
        const originalTask = Assertions.ensureTask(taskId);  
        $db.$tasks.update({
          ...originalTask,
          title,
          topicId,
          description,
          dueDate,
          assignedTo,
          completed,
          completedDate
        });

        // --- Done.
        return $db.$tasks.byId(taskId);
        `,
    },

    "tasks-create": {
      url: "/tasks",
      method: "post",
      successStatusCode: 201,
      responseShape: "task?",
      handler: `
        const { title, topicId, description, dueDate } = $requestBody;
        if (title === undefined || title.length === 0) {
          throw Error('Task without title is not permitted')
        }
        
        // --- Create the task with defaults
        const task = $db.$tasks.insert({
          title, 
          topicId: topicId ? Number(topicId) : null, 
          description, 
          createdDate: $env.getDate().toISOString(), 
          dueDate, 
          assignedTo: $loggedInUser.id, 
        });
        
        // --- Read back task data to create the DTO
        const taskDto = $db.$tasks.byId(task.id);
        return taskDto;
      `,
    },

    "tasks-summary": {
      url: "/charts/tasks-summary",
      method: "get",
      handler: `
        delay(1000);
        return [
          { "id": "Overdue", "value": 12 },
          { "id": "Today", "value": 2 },
          { "id": "Upcoming", "value": 5 },
          { "id": "Completed", "value": 7 }
        ]
      `,
    },

    "topics-list": {
      url: "/topics",
      method: "get",
      handler: `$db.$topics.toArray()`,
    },
  },
};

export default mock;
