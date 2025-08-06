// // import * as BackgroundTask from "expo-background-task";
// // import * as TaskManager from "expo-task-manager";
// import { APIService } from "./apiService";
// import { auth } from "@/config/firebase";

// const BACKGROUND_TASK_PULL = 'batch-push';

// export const getCurrentToken = async (): Promise<string | null> => {
//   try {
//     const currentUser = auth.currentUser;
//     if (!currentUser) {
//       console.log("No current user found");
//       return null;
//     }
    
//     console.log("Getting token for user:", currentUser.uid);
//     const token = await currentUser.getIdToken();
//     console.log("Token retrieved successfully, length:", token?.length);
//     return token;
//   } catch (error) {
//     console.error("Error fetching token:", error);
//     return null;
//   }
// };

// export const initializeBackgroundTask = async (
//     innerAppMountedPromise: Promise<void>
// ) => {
//     TaskManager.defineTask(BACKGROUND_TASK_PULL, async () => {

//     // wait for js to load
//     await innerAppMountedPromise;
//     console.log('about to fetch data')
    
//     // fetch the latest data
//     try {
//         const authToken = getCurrentToken();
//         APIService.fetchTransactions(authToken);
//         console.log("Background fetch successful");
//     } catch (error) {
//         console.error("Error fetching data from firebase:", error);
//     }
//     });

//     if(!(await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_PULL))){
//         await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_PULL, {
//             minimumInterval: 15,
//         });
//     }
// }

