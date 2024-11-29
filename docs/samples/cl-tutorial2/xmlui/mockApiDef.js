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

window.XMLUI_MOCK_API = {
  type: "db",
  config: {
    database: "cl-tutorial-db",
    version: 8,
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
    categories: [
      {
        id: 1,
        name: "Decision Maker",
        color: "#3455eb",
      },
      {
        id: 2,
        name: "Influencer",
        color: "#ebc334",
      },
      {
        id: 3,
        name: "Technical Contact",
        color: "#2a9660",
      },
      {
        id: 4,
        name: "End User",
        color: "#ff5733",
      },
      {
        id: 5,
        name: "Account Manager",
        color: "#34eb67",
      },
      {
        id: 6,
        name: "Financial Approver",
        color: "#a934eb",
      },
      {
        id: 7,
        name: "Legal Officer",
        color: "#eb34b3",
      },
    ],
    contacts: [
      {
        id: 1,
        fullName: "James Kirk",
        categoryId: 1,
        comments: "Oversees all major business transactions.",
        reviewDueDate: today.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 2,
        fullName: "Jane Coherty",
        categoryId: 2,
        comments: "Advocates for new technology adoption.",
        reviewDueDate: today.toISOString(),
        reviewCompleted: true,
      },
      {
        id: 3,
        fullName: "Michael Johnson",
        categoryId: 3,
        comments:
          "Responsible for integrating the software with current systems.",
        reviewDueDate: null,
        reviewCompleted: true,
      },
      {
        id: 4,
        fullName: "Emily Davis",
        categoryId: 4,
        comments: "Provides feedback on product performance.",
        reviewDueDate: twoDaysLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 5,
        fullName: "Robert Brown",
        categoryId: 5,
        comments: "Manages the budget for purchases.",
        reviewDueDate: weekLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 6,
        fullName: "Laura Wilson",
        categoryId: 6,
        comments: "Key contact for day-to-day operations.",
        reviewDueDate: twoDaysLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 7,
        fullName: "Chris Taylor",
        categoryId: 7,
        comments: "Ensures all contracts meet regulatory standards.",
        reviewDueDate: null,
        reviewCompleted: false,
      },
      {
        id: 8,
        fullName: "Sophia Martinez",
        categoryId: 1,
        comments: "Oversees system upgrades and integrations.",
        reviewDueDate: tomorrow.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 9,
        fullName: "Daniel Thomas",
        categoryId: 5,
        comments: "Finish the remaining modules of the online course",
        reviewDueDate: monthLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 10,
        fullName: "Olivia Harris",
        categoryId: 5,
        comments: "Assesses market opportunities and leads campaigns.",
        reviewDueDate: monthLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 11,
        fullName: "James Clark",
        categoryId: 3,
        comments: "Ensures smooth delivery of services.",
        reviewDueDate: yesterday.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 12,
        fullName: "Isabella Moore",
        categoryId: 2,
        comments: "Coordinates schedules and meetings for community members.",
        reviewDueDate: null,
        reviewCompleted: false,
      },
      {
        id: 13,
        fullName: "Amelia Hall",
        categoryId: 6,
        comments: "Responsible for staffing and personnel management.",
        reviewDueDate: yesterday.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 14,
        fullName: "William Lee",
        categoryId: 6,
        comments: "Handles service issues and escalations.",
        reviewDueDate: today.toISOString(),
        reviewCompleted: true,
      },
      {
        id: 15,
        fullName: "Mia Anderson",
        categoryId: 5,
        comments: "Works on building long-term client relationships.",
        reviewDueDate: twoDaysLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 16,
        fullName: "Benjamin Walker",
        categoryId: 1,
        comments: "In charge of vendor selection and negotiation.",
        reviewDueDate: null,
        reviewCompleted: false,
      },
      {
        id: 17,
        fullName: "Jacob Young",
        categoryId: 4,
        comments: "Provides data-driven insights for decision making.",
        reviewDueDate: null,
        reviewCompleted: false,
      },
      {
        id: 18,
        fullName: "Ethan King",
        categoryId: 3,
        comments: "Optimizes product delivery and logistics.",
        reviewDueDate: null,
        reviewCompleted: true,
      },
      {
        id: 19,
        fullName: "Charlotte Scott",
        categoryId: 7,
        comments: "In charge of product strategy and development legal issues.",
        reviewDueDate: today.toISOString(),
        reviewCompleted: true,
      },
      {
        id: 20,
        fullName: "Logan Green",
        categoryId: 4,
        comments: "Manages data models and analytics for the company.",
        reviewDueDate: weekLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 21,
        fullName: "Ava Adams",
        categoryId: 2,
        comments: "Ensures customer satisfaction and retention.",
        reviewDueDate: yesterday.toISOString(),
        reviewCompleted: true,
      },
      {
        id: 22,
        fullName: "Noah Baker",
        categoryId: 3,
        comments: "Oversees tech strategy and implementation.",
        reviewDueDate: null,
        reviewCompleted: false,
      },
      {
        id: 23,
        fullName: "Grace Nelson",
        categoryId: 6,
        comments: "Manages budgets and financial planning.",
        reviewDueDate: weekLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 24,
        fullName: "Lucas Carter",
        categoryId: 3,
        comments: "Responsible for product maintenance and new features.",
        reviewDueDate: null,
        reviewCompleted: true,
      },
      {
        id: 25,
        fullName: "Evelyn Perez",
        categoryId: 1,
        comments: "Oversees all internal processes and improvements.",
        reviewDueDate: null,
        reviewCompleted: false,
      },
      {
        id: 26,
        fullName: "Henry Turner",
        categoryId: 5,
        comments: "Works on strategic partnerships.",
        reviewDueDate: twoDaysLater.toISOString(),
        reviewCompleted: false,
      },
      {
        id: 27,
        fullName: "Ella Parker",
        categoryId: 4,
        comments: "Ensures the product meets user experience standards.",
        reviewDueDate: "2024-06-20T23:59:59Z",
        reviewCompleted: false,
      },
      {
        id: 28,
        fullName: "Jack Sanchez",
        categoryId: 7,
        comments: "Plan a picnic outing with friends or family",
        reviewDueDate: "2024-06-22T23:59:59Z",
        reviewCompleted: false,
      },
      {
        id: 29,
        fullName: "Victoria Roberts",
        categoryId: 2,
        comments: "Handles external communications and PR.",
        reviewDueDate: "2024-06-25T23:59:59Z",
        reviewCompleted: false,
      },
      {
        id: 30,
        fullName: "Alexander Evans",
        categoryId: 6,
        comments: "Responsible for overall finance.",
        reviewDueDate: "2024-06-28T23:59:59Z",
        reviewCompleted: false,
      },
    ],
  },

  helpers: {
    Assertions: {
      ensureContact: `(contactId) => {
        const foundContact = $db.$contacts.byId(contactId);
        if (!foundContact) {
          throw Errors.NotFound404("Contact id:" + contactId + " not found");
        };
        return foundContact;
      }`,
    },
    getSection: `(contact) => {
      if (contact.reviewCompleted) return "Completed";
      if (!contact.reviewDueDate) return "NoDueDate";
      if (isToday(contact.reviewDueDate)) return "Today";
      return getDate(contact.reviewDueDate) < getDate() 
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
    test: {
      url: "/test",
      method: "get",
      handler: "'Hello, from XMLUI emulated backend!'",
    },
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
      handler: `$db.$users.toArray()`,
    },

    "contact-list": {
      url: "/contacts",
      method: "get",
      handler: `$db.$contacts.toArray();`,
    },

    "contact-list-recent": {
      url: "/contacts-recent",
      method: "get",
      handler: `$db.$contacts.orderBy(t => t.id, true).take(5).toArray();`,
    },

    "contact-list-overdue": {
      url: "/contacts/overdue",
      method: "get",
      handler: `$db.$contacts.whereAsArray(t => getSection(t) === 'Overdue');`,
    },

    "contact-list-today": {
      url: "/contacts/today",
      method: "get",
      handler: `$db.$contacts.whereAsArray(t => 
        !t.reviewCompleted && t.reviewDueDate && 
        $env.getDate(t.reviewDueDate).setHours(0,0,0,0) === $env.getDate().setHours(0,0,0,0)
      );`,
    },

    "contact-list-upcoming": {
      url: "/contacts/upcoming",
      method: "get",
      handler: `$db.$contacts.whereAsArray(t => getSection(t) === 'Upcoming');`,
    },

    "contact-list-completed": {
      url: "/contacts/completed",
      method: "get",
      handler: `$db.$contacts.whereAsArray(t => getSection(t) === 'Completed');`,
    },

    "contact-counts": {
      url: "/contactcounts",
      method: "get",
      handler: `return {
        all: $db.$contacts.toArray().length,
        overdue: $db.$contacts.whereAsArray(t => getSection(t) === 'Overdue').length,
        today: $db.$contacts.whereAsArray(t => 
          !t.reviewCompleted && t.reviewDueDate && 
          $env.getDate(t.reviewDueDate).setHours(0,0,0,0) === $env.getDate().setHours(0,0,0,0)
        ).length,
        upcoming: $db.$contacts.whereAsArray(t => getSection(t) === 'Upcoming').length,
        completed: $db.$contacts.whereAsArray(t => getSection(t) === 'Completed').length
      }`,
    },

    // --- Retrieve a particular task data
    "contacts-read": {
      url: "/contacts/:contactId",
      method: "get",
      pathParamTypes: {
        contactId: "integer",
      },
      handler: "Assertions.ensureContact($pathParams.contactId)",
    },

    "contacts-delete": {
      url: "/contacts/:contactId",
      method: "delete",
      pathParamTypes: {
        contactId: "integer",
      },
      handler: `
        const contactId = $pathParams.contactId;
        const contact = Assertions.ensureContact(contactId);
        if (contact) {
          $db.$contacts.deleteById(contactId);
        }
      `,
    },

    "contacts-edit": {
      url: "/contacts/:taskId",
      pathParamTypes: {
        taskId: "integer",
      },
      method: "put",
      handler: `
        // --- Get task attributes
        const taskId = $pathParams.taskId;
        const { 
          fullName, 
          categoryId, 
          comments, 
          reviewDueDate, 
          reviewCompleted, 
        } = $requestBody; 
        
        // --- Update the task
        const originalTask = Assertions.ensureContact(taskId);  
        $db.$contacts.update({
          ...originalTask,
          fullName,
          categoryId,
          comments,
          reviewDueDate,
          reviewCompleted,
        });

        // --- Done.
        return $db.$contacts.byId(taskId);
        `,
    },

    "contacts-create": {
      url: "/contacts",
      method: "post",
      successStatusCode: 201,
      handler: `
        const { fullName, categoryId, comments, reviewDueDate } = $requestBody;
        if (fullName === undefined || fullName.length === 0) {
          throw Error('Contact without fullName is not permitted')
        }
        
        // --- Create the contact with defaults
        const contact = $db.$contacts.insert({
          fullName, 
          categoryId: categoryId ? Number(categoryId) : null, 
          comments, 
          reviewDueDate, 
        });
        
        // --- Read back contact data to create the DTO
        const contactDto = $db.$contacts.byId(task.id);
        return contactDto;
      `,
    },

    "contacts-summary": {
      url: "/charts/contacts-summary",
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

    "categories-list": {
      url: "/categories",
      method: "get",
      handler: `$db.$categories.toArray()`,
    },
  },
};
