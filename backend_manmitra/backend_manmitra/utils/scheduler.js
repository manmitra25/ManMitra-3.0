// utils/scheduler.js
import cron from "node-cron";
import TaskProgress from "../models/TaskProgress.js";
import { sendEmail } from "./email.js";

// The scheduler runs hourly and checks habits with reminderTime matching current HH:MM
const startScheduler = () => {
  // Run every minute in development for faster testing: '* * * * *'
  // For production run hourly at minute 0: '0 * * * *'
  const cronExpression = process.env.NODE_ENV === "production" ? "0 * * * *" : "* * * * *";
  cron.schedule(cronExpression, async () => {
    try {
      console.log("[Scheduler] running habit reminders check");
      const all = await TaskProgress.find({ "habits.reminderTime": { $exists: true, $ne: null } }).populate("student", "email username");
      const now = new Date();

      // Build HH:MM in server timezone (UTC if server is UTC)
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const currHourMin = `${h}:${m}`;

      for (const prog of all) {
        for (const habit of prog.habits) {
          if (!habit.reminderTime) continue;
          if (habit.reminderTime === currHourMin) {
            const todayKey = new Date().toISOString().slice(0,10);
            const doneToday = habit.doneDates && habit.doneDates.get(todayKey);
            if (!doneToday && prog.student && prog.student.email) {
              await sendEmail({
                to: prog.student.email,
                subject: `Reminder: ${habit.title}`,
                text: `Hi ${prog.student.username || 'student'}, reminder to complete your habit: ${habit.title}.`
              });
              console.log(`[Scheduler] reminder sent to ${prog.student.email} for habit ${habit.title}`);
            }
          }
        }
      }
    } catch (err) {
      console.error("[Scheduler] error:", err);
    }
  });
};

export { startScheduler };
