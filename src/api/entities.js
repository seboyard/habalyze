import { db } from '@/api/base44Client';
import { db } from './base44Client';

export const Query = db.entities.Query;
export const User = db.auth;

export const Habit = db.entities.Habit;
export const HabitLog = db.entities.HabitLog;
export const Goal = db.entities.Goal;
export const Project = db.entities.Project;
export const ProjectTask = db.entities.ProjectTask;
export const ShopItem = db.entities.ShopItem;
export const Notification = db.entities.Notification;
export const Friendship = db.entities.Friendship;
export const UserPreferences = db.entities.UserPreferences;
