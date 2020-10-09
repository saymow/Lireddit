import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};

    users.forEach((user) => {
      userIdToUser[user.id] = user;
    });

    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);

    // console.log("users: ", users);
    // console.log("userIdToUser: ", userIdToUser);
    // console.log("sortedUsers: ", sortedUsers);

    // userIdToUser and sortedUsers intended to order the users array bc somehow it came unsorted from db.

    return sortedUsers;
  });
