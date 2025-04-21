import { Drowsiness } from "@/models";

export const drowsinessService = {
  createLog: async (ear: number, yawn: number) => {
    const log = new Drowsiness({ ear, yawn });
    return await log.save();
  },

  getLogs: async () => {
    return await Drowsiness.find().sort({ createdAt: -1 });
  },
};
