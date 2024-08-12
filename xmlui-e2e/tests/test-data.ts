const exampleUsers = [
  {
    id: 1,
    displayName: "Grumpy Dwarf",
    firstName: "Grumpy",
    lastName: "Dwarf",
    shortName: "grumpyd",
    avatarUrl: "https://source.boringavatars.com/beam/120/grumpyd",
  },
  {
    id: 2,
    displayName: "Dopey Dwarf",
    firstName: "Dopey",
    lastName: "Dwarf",
    shortName: "dopeyd",
    avatarUrl: "https://source.boringavatars.com/beam/120/dopeyd",
  },
  {
    id: 3,
    displayName: "Sneezy Dwarf",
    firstName: "Sneezy",
    lastName: "Dwarf",
    shortName: "sneezyd",
    avatarUrl: "https://source.boringavatars.com/beam/120/sneezyd"
  },
  {
    id: 4,
    displayName: "Happy Dwarf",
    firstName: "Happy",
    lastName: "Dwarf",
    shortName: "happyd",
    avatarUrl: "https://source.boringavatars.com/beam/120/happyd"
  },
  {
    id: 5,
    displayName: "Snow White",
    firstName: "Snow",
    lastName: "White",
    shortName: "snowwy",
    avatarUrl: "https://source.boringavatars.com/beam/120/snowwy"
  },
]

/**
 * Get a number of example users. Current max (and default) is a collection with a length of 5
 * @param num Maximum number of returned users
 * @returns A user collection
 */
export function createExampleUsers(num?: number) {
  return [...exampleUsers.slice(0, num)];
}

// TODO: Add members intuitively
export function createExampleChannels(num = 4, type: "direct" | "public" = "direct") {
  const temp: Record<string, any>[] = [];
  for (let i = 0; i < num; i++) {
    temp.push({
      id: i,
      type,
      name: `${type}_${i}`
    });
  }
  return temp;
}

export const empty2PersonDirectChannel = {
  users: [
    {
      id: 1,
      displayName: "Grumpy Dwarf",
      shortName: "grumpyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/grumpyd",
    },
    {
      id: 2,
      displayName: "Dopey Dwarf",
      shortName: "dopeyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/dopeyd",
    },
  ],
  channels: [
    {
      id: 1,
      type: "direct",
      name: "DC_1_2",
    },
  ],
  members: [
    {
      channelId: 1,
      userId: 1,
      creator: true,
    },
    {
      channelId: 1,
      userId: 2,
      creator: false,
    },
  ],
};

export const empty2PersonTopicChannel = {
  users: [
    {
      id: 1,
      displayName: "Grumpy Dwarf",
      shortName: "grumpyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/grumpyd",
    },
    {
      id: 2,
      displayName: "Dopey Dwarf",
      shortName: "dopeyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/dopeyd",
    },
  ],
  channels: [
    {
      id: 1,
      type: "public",
      name: "DC_1_2",
    }
  ],
  members: [
    {
      channelId: 1,
      userId: 1,
      creator: true,
    },
    {
      channelId: 1,
      userId: 2,
      creator: false,
    },
  ],
};

export const dirChanWithTextMsgs = {
  users: [
    {
      id: 1,
      displayName: "Grumpy Dwarf",
      shortName: "grumpyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/grumpyd",
    },
    {
      id: 2,
      displayName: "Dopey Dwarf",
      shortName: "dopeyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/dopeyd",
    },
  ],
  channels: [
    {
      id: 1,
      type: "direct",
      name: "DC_1_2",
    },
  ],
  members: [
    {
      channelId: 1,
      userId: 1,
      creator: true,
    },
    {
      channelId: 1,
      userId: 2,
      creator: false,
    },
  ],

  messages: [
    { channelId: 1, contents: "hello", sentBy: 1, sentTime: "2023-08-17T13:10:10Z", id: 1 },
    { channelId: 1, contents: "hi", sentBy: 2, sentTime: "2023-08-17T13:11:10Z", id: 2 },
    { channelId: 1, contents: "there!", sentBy: 2, sentTime: "2023-08-17T13:10:10Z", id: 3 },
  ],
};

export const manyEmpty2PersonDirectChannels = {
  users: [
    {
      id: 1,
      displayName: "Grumpy Dwarf",
      shortName: "grumpyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/grumpyd",
    },
    {
      id: 2,
      displayName: "Dopey Dwarf",
      shortName: "dopeyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/dopeyd",
    },
    {
      id: 3,
      displayName: "Sneezy Dwarf",
      shortName: "sneezyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/sneezyd",
    },
    {
      id: 4,
      displayName: "Happy Dwarf",
      shortName: "happyd",
      avatarUrl: "https://source.boringavatars.com/beam/120/happyd",
    },
    {
      id: 5,
      displayName: "Snow White",
      shortName: "snowwy",
      avatarUrl: "https://source.boringavatars.com/beam/120/snowwy",
    },
  ],
  channels: [
    {
      id: 1,
      type: "direct",
      name: "DC_1_2",
    },
    {
      id: 2,
      type: "direct",
      name: "DC_1_3",
    },
    {
      id: 3,
      type: "direct",
      name: "DC_1_4",
    },
    {
      id: 4,
      type: "direct",
      name: "DC_1_5",
    },
    {
      id: 5,
      type: "direct",
      name: "DC_2_3",
    },
    {
      id: 6,
      type: "direct",
      name: "DC_2_4",
    },
    {
      id: 7,
      type: "direct",
      name: "DC_2_5",
    },
    {
      id: 8,
      type: "direct",
      name: "DC_3_4",
    },
    {
      id: 9,
      type: "direct",
      name: "DC_3_5",
    },
    {
      id: 10,
      type: "direct",
      name: "DC_4_5",
    },
  ],
  reactions: [],
  members: [
    {
      channelId: 1,
      userId: 1,
      creator: true,
    },
    {
      channelId: 1,
      userId: 2,
      creator: false,
    },
    {
      channelId: 2,
      userId: 1,
      creator: true,
    },
    {
      channelId: 2,
      userId: 3,
      creator: false,
    },
    {
      channelId: 3,
      userId: 1,
      creator: true,
    },
    {
      channelId: 3,
      userId: 4,
      creator: false,
    },
    {
      channelId: 4,
      userId: 1,
      creator: true,
    },
    {
      channelId: 4,
      userId: 5,
      creator: false,
    },
    {
      channelId: 5,
      userId: 2,
      creator: true,
    },
    {
      channelId: 5,
      userId: 3,
      creator: false,
    },
    {
      channelId: 6,
      userId: 2,
      creator: true,
    },
    {
      channelId: 6,
      userId: 4,
      creator: false,
    },
    {
      channelId: 7,
      userId: 2,
      creator: true,
    },
    {
      channelId: 7,
      userId: 5,
      creator: false,
    },
    {
      channelId: 8,
      userId: 3,
      creator: true,
    },
    {
      channelId: 8,
      userId: 4,
      creator: false,
    },
    {
      channelId: 9,
      userId: 3,
      creator: true,
    },
    {
      channelId: 9,
      userId: 5,
      creator: false,
    },
    {
      channelId: 10,
      userId: 4,
      creator: true,
    },
    {
      channelId: 10,
      userId: 5,
      creator: false,
    },
  ],
  messages: [],
  attachments: [],
};
